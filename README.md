# Stack Depth · 博客管理后台

Vue 3 + TypeScript + Element Plus + Vite 的后台管理端，基于 RuoYi-Vue-Plus 前端，承担三类职责：

- **内容治理**：文章下线 / 恢复、评论审核与删除、标签运营（重命名 / 合并 / 精选 / 排序）
- **作者功能**：我的文章、发文与编辑、历史版本查看（只读快照）
- **系统管理**：用户、角色、菜单、字典等 RuoYi 原生能力

> 读者站与作者中心在 [`blog-web`](../blog-web)，服务端在 [`RuoYi-Vue-Plus`](../RuoYi-Vue-Plus)。三仓必须同级 clone。

## 与其他两仓的差异

| | plus-ui | blog-web |
|---|---|---|
| 使用者 | 管理员、有后台权限的作者 | 所有登录读者 / 作者 |
| 上传接口 | `/resource/oss/upload`（需 `system:oss:upload`） | `/blog/oss/upload`（登录即可） |
| API 基址 | 构建期常量 `VITE_APP_BASE_API` | 运行时 `NUXT_API_BASE` |
| 鉴权 | token 在请求头，浏览器直连后端 | token 在 httpOnly cookie，Nitro 代注入 |

上传接口分叉是刻意的：博客用户注册后默认零角色，复用后台接口会 403（ROADMAP D42）。

## 部署（Docker）

```bash
docker build -t sd-admin:local .
docker run -d -p 8080:80 --network <后端所在网络> sd-admin:local
```

一键起全套（含后端与前台）见后端仓 `script/docker/docker-compose.yml`。

**镜像内是 nginx + 静态产物**，配置在 [`deploy/nginx.conf`](deploy/nginx.conf)，两个契约点：

1. `VITE_APP_BASE_API = '/prod-api'`（`.env.production`）→ nginx 用 `location /prod-api/` 反代，
   `proxy_pass` 必须**剥离前缀**（用 `rewrite ^/prod-api/(.*)$ /$1 break`）；
2. `VITE_APP_MESSAGE_TRANSPORT = 'sse'` → 反代要关 `proxy_buffering`，否则实时消息被缓冲。

反代用 `resolver 127.0.0.11` + 变量形式而非直接写死 upstream：nginx 只在启动时解析一次主机名，后端重启换 IP 会永久 502。

## 本地开发

```bash
pnpm install
pnpm dev          # http://localhost:5173，API 走 /dev-api（vite 代理到 8081）
```

```bash
pnpm build        # 产出 dist/
pnpm lint         # oxlint
```

`packageManager` 声明 pnpm 10.34.5，建议 `corepack enable` 后用 pnpm。
**注意**：`overrides`（esbuild）与 `allowBuilds` 写在 `pnpm-workspace.yaml` 而不是 `package.json`，
Docker 构建的依赖层必须一起 COPY，否则 `--frozen-lockfile` 报 `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`。

## 目录结构

```
src/
  ├── api/           接口封装（含 blog 域）
  ├── components/    通用组件（Editor / ImageUpload / FileUpload ...）
  ├── layouts/       布局（侧栏 / 顶栏 / 设置抽屉）
  ├── views/
  │   ├── blog/      ★ 博客域：adminArticle / adminComment / adminTag / article(作者)
  │   └── system/    RuoYi 原生系统管理
  ├── assets/styles/ 全局样式（tokens / theme-dark / components/_editor-dark.scss）
  └── store/         Pinia
deploy/nginx.conf    生产容器用的 nginx 配置
Dockerfile           多阶段：node 构建 → nginx 运行
```

## 常见问题

**登录后接口全 403**：检查 nginx 反代是否剥掉了 `/prod-api` 前缀（尾斜杠/rewrite）。后端收到的路径应是 `/auth/code` 而不是 `/prod-api/auth/code`。

**改了 `.env.production` 不生效**：`VITE_*` 是**构建期**变量，必须重新 build 镜像。

**暗色模式下代码块是白底**：`src/assets/styles/components/_editor-dark.scss` 覆盖了 WangEditor 的 17 个 CSS 变量与 prism token 色，若新增编辑器样式记得同步。

## 致谢

基于 [RuoYi-Vue-Plus](https://gitee.com/dromara/RuoYi-Vue-Plus)（Apache-2.0）前端。
