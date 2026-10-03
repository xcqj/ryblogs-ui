# AGENTS.md — PLUS-UI 管理后台前端

## 项目
- RuoYi-Vue-Plus 6.X 配套前端（Vue3 + Vite + TS），本仓库独立于后端仓库
- 后端仓库：../RuoYi-Vue-Plus（多根工作区下可见）

## 权威源
- API 契约：../RuoYi-Vue-Plus/docs/blog-api.md（接口路径/权限标识/出入参以其为准，冲突先报告）
- 切片计划：../RuoYi-Vue-Plus/docs/ROADMAP.md
- 环境搭建：../RuoYi-Vue-Plus/docs/SETUP.md
- 前端实现清单：docs/frontend-plan.md（派生自 ROADMAP S10，状态以 ROADMAP 为准）

## 编码规范与技能（动手前先读）
- 本仓库自带 AI 编码治理资产，与后端仓库同构：
  - **技能（skill）**：`.codex/skills/frontend-crud-coding/SKILL.md`——新增/修改 CRUD 列表页、树表页、api、types、页面壳的编码规范，动手前先读并遵循。
  - **子代理规则**：`.claude/agents/frontend-*.md`（`frontend-api-types` / `frontend-crud-coding` / `frontend-crud-page` / `frontend-page-enhancement`），按任务类型选用。
  - **代码生成模板**：`gen/`（`api.ts.ftl` / `types.ts.ftl` / `index.vue.ftl` / `index-tree.vue.ftl`），仅作 RuoYi 风格骨架参考；生成后必须按契约与业务规则改造，不得原样当成品。
  - **`.qoder/skills/` 下同名条目是指向 `.codex/skills/` 的符号链接**（Qoder 自动加载用），勿复制出第二份实体。
- 信息源优先级（与后端 AGENTS.md §4 同序）：① plus-ui 仓库内真实代码（同目录最近似页面优先，如 `src/views/demo`、`system`、`workflow` 同类页）→ ② `../RuoYi-Vue-Plus/docs/` 权威文档（契约 / ROADMAP / SETUP）→ ③ 本仓库 `.codex` / `.claude` skill 与 `gen/` 模板 → ④ 通用 Vue / Element Plus 知识（最低，禁止照搬通用模板或上游旧版）。

## 红线
- 公共页面只调 /blog/public/**；作者后台用 /blog/article|user/**；管理功能用 /blog/admin/**（三层边界，契约 §1/§15）
- 不信任前端做权限判断：按钮隐藏只是体验，权限以后端为准；不给非管理员分配 blog:admin 菜单
- token 经统一请求封装携带 Authorization + clientid 头，不在业务代码手写
- 不把个人机器路径/代理地址写进代码与配置

## 工作流
- 与后端联调的每个切片闭环：接口契约确认 → 页面实现 → 联调 → 浏览器验收 → 小步 commit
