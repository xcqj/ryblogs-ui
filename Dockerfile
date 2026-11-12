# syntax=docker/dockerfile:1
# =============================================================================
# 后台管理生产镜像（S25）
#
# 构建：docker build -t sd-admin:local .
#       （上下文是 plus-ui 仓库根；.dockerignore 排除 node_modules/dist）
#
# 关键契约：.env.production 里 VITE_APP_BASE_API = '/prod-api'，产物中的请求固定打到该前缀，
# 因此 nginx.conf 必须提供 location /prod-api/ 反代到 backend —— 改一边必须改另一边。
#
# RSA 公私钥与 client_id 是**构建期内联**进产物的（VITE_ 前缀），不是运行时注入；
# 换密钥必须重新构建镜像。RSA 两项通过 build-arg 传入（compose 的 admin.build.args），
# 仓库内不保留任何密钥字面值。
# =============================================================================

# ---------- 构建阶段 ----------
FROM node:24-alpine AS build
WORKDIR /app

# packageManager 字段已声明 pnpm@10.34.5，corepack 会按它启用对应版本
RUN corepack enable

# 依赖层单独一层：改源码不重装。
# ⚠️ 必须带上 pnpm-workspace.yaml：本项目把 `overrides`（esbuild 0.28.1）与 `allowBuilds`
# 写在那里而不是 package.json，漏拷会导致 ERR_PNPM_LOCKFILE_CONFIG_MISMATCH（frozen 校验失败）。
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
# RSA 密钥构建期注入：Vite 中「执行前已存在的环境变量」优先级高于 .env 文件，
# 因此 .env.production 只留注释、真实值由 build-arg 提供（缺省为空 → 产物无法走加密链路）。
ARG VITE_APP_RSA_PUBLIC_KEY=
ARG VITE_APP_RSA_PRIVATE_KEY=
ENV VITE_APP_RSA_PUBLIC_KEY=$VITE_APP_RSA_PUBLIC_KEY \
    VITE_APP_RSA_PRIVATE_KEY=$VITE_APP_RSA_PRIVATE_KEY
# vite build --mode production（见 package.json scripts.build），产出 dist/
RUN pnpm build

# ---------- 运行阶段 ----------
FROM nginx:alpine

RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q --spider http://127.0.0.1/ || exit 1
