# 前端实现清单 · 博客管理后台（S10）

> 派生实现清单，**不是排期/状态权威源**。切片级状态以 `../RuoYi-Vue-Plus/docs/ROADMAP.md`（S10）为准；本文件只做前端页面/组件粒度的 TODO 拆解，引用 S10 与契约章节，不复制状态。
> 权威源：API 契约 `../RuoYi-Vue-Plus/docs/blog-api.md`；编码规范 `.codex/skills/frontend-crud-coding/SKILL.md` + `.claude/agents/frontend-*.md` + `gen/` 模板。

## 1. 现状：失效的生成骨架（2026-09-28 代码生成器产出）

下列页面 / api 调用 `/blog/blogXxx` 生成端点，后端已按 D12/D16/D20 停用并物理删除，**当前全部 404**，对应菜单也已被 `blog_s5/s6/s7_menu.sql` 清理。S10 按真实契约路由重建，而非修好这些骨架。

| 现有页面（src/views/blog/） | 现有 api 调用（已失效） | 后端真实契约路由 | 处置 |
|---|---|---|---|
| blogArticle | `/blog/blogArticle/**` | 作者 `/blog/article/**`；治理 `/blog/admin/articles/**` | 拆为「作者发文/编辑」+「管理员治理」两类页 |
| blogTag | `/blog/blogTag/**` | 治理 `/blog/admin/tags/**`；公共 `/blog/public/tags/**` | 重建为标签治理页（rename/merge/运营更新/删除） |
| blogComment | `/blog/blogComment/**` | 治理 `/blog/admin/comments/**`；公共 `/blog/public/articles/{id}/comments` | 重建为评论管理页（列表/逻辑删） |
| blogUserProfile | `/blog/blogUserProfile/**` | `/blog/user/**`（自助）；`/blog/public/users/{id}` | 并入个人资料 / 作者功能 |
| blogArticleVersion | `/blog/blogArticleVersion/**` | 版本只读嵌在 `/blog/article` 详情 | 删独立页，作文章详情子视图 |
| blogTagAlias | `/blog/blogTagAlias/**` | 无独立契约接口（并入 tag 治理） | 删除页与 api |
| blogArticleTag | `/blog/blogArticleTag/**` | 纯关系表，无对外接口 | 删除页与 api |

## 2. 待办（按优先级）

- [x] 清点并下线失效骨架：删除 `blogArticleTag`、`blogTagAlias` 的 views + api + types（2026-10-03）
- [x] 管理员治理页 · 文章：`/blog/admin/articles` 列表 + 下线 / 恢复动作（`blog:article:*`）（2026-10-04 代码完成，浏览器验收待 S10 收口）
- [x] 管理员治理页 · 标签：`/blog/admin/tags` rename / merge / 运营更新 / 删除（`blog:tag:*`）（2026-10-04 基本管理完成：列表/运营/重命名/删除；**merge 交互推后**，浏览器验收待 S10 收口）
- [x] 管理员治理页 · 评论：`/blog/admin/comments` 列表 + 逻辑删（`blog:comment:*`）（2026-10-04 代码完成，浏览器验收待 S10 收口）
- [ ] 作者功能：我的文章列表 / 详情、发文编辑器（复用 `/resource/oss/upload` 传图）、保存 / 发布 / hide / show / delete（`/blog/article/**`）
- [ ] 作者个人资料：`/blog/user/profile`（`/blog/user/**`）
- [x] 文章详情的历史版本只读子视图（`/blog/article` 侧，非独立 CRUD）（2026-10-04 以「我的文章」列表抽屉实现，§4.1 列表 + §4.2 快照只读；浏览器验收待 S10 收口）
- [ ] 路由 / 菜单 / 权限标识与后端 s5/s6/s7 菜单 SQL 对齐
- [ ] 浏览器验收（每页：正向 + 越权 + 参数校验）

## 3. 约定提醒

- 三层 API 边界不得混用：治理走 `/blog/admin/**`，作者自助走 `/blog/article|user/**`，公共只读走 `/blog/public/**`（plus-ui 一般不直连公共）。
- 不信任前端权限判断：按钮隐藏只是体验，权限以后端为准。
- token 经统一请求封装携带 `Authorization` + `clientid` 头，不在业务代码手写。
- 与后端联调的闭环：契约确认 → 页面实现 → 联调 → 浏览器验收 → 小步 commit（见 `AGENTS.md`）。
- 边界（D24 已确认）：作者「发文 / 编辑」体验落 plus-ui（复用框架后台），blog-web 为纯前台不承担作者发文——见 ROADMAP S10 / D24。
