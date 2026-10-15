# 前端实现清单 · 博客管理后台（S10）

> 派生实现清单，**不是排期/状态权威源**。切片级状态以 `../RuoYi-Vue-Plus/docs/ROADMAP.md`（S10 / S19）为准；本文件只做前端页面/组件粒度的 TODO 拆解，引用 S10 与契约章节，不复制状态。
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
- [x] 管理员治理页 · 标签：`/blog/admin/tags` rename / merge / 运营更新 / 删除（`blog:tag:*`）（2026-10-05 完成：列表/运营/重命名/删除/合并（§13.5 弹窗+可搜索下拉，不可逆二次确认）；浏览器验收待 S10 收口）
- [x] 管理员治理页 · 评论：`/blog/admin/comments` 列表 + 逻辑删（`blog:comment:*`）（2026-10-04 代码完成，浏览器验收待 S10 收口）
- [x] 作者功能：我的文章列表 / 详情、发文编辑器（复用 `/resource/oss/upload` 传图）、保存 / 发布 / hide / show / delete（`/blog/article/**`）（2026-10-04 A1 列表 + A2 全屏编辑页 + A3 版本抽屉完成；封面用极简 el-upload 捕获 URL；浏览器验收待 S10 收口）
- [x] 作者个人资料：`/blog/user/profile`（`/blog/user/**`）（2026-10-04 并入框架 profile「博客资料」tab（决策3），下线 blogUserProfile 骨架；浏览器验收待 S10 收口）
- [x] 文章详情的历史版本只读子视图（`/blog/article` 侧，非独立 CRUD）（2026-10-04 以「我的文章」列表抽屉实现，§4.1 列表 + §4.2 快照只读；浏览器验收待 S10 收口）
- [x] 路由 / 菜单 / 权限标识与后端 s5/s6/s7 菜单 SQL 对齐（2026-10-04：作者页走静态路由 `/blog-article`（免后端钩子）；治理页 C 菜单已备 `RuoYi-Vue-Plus/docs/blog_s10_menu.sql`，⬜待执行；浏览器验收待 S10 收口）
- [x] 浏览器验收（每页：正向 + 越权 + 参数校验）（2026-10-06 全部通过，S10 收口；衍生修复 D26 运营属性/merge 精选转移、正文图片 oss:// 净化，详见 ROADMAP S10 实施结果）

## 3. 约定提醒

- 三层 API 边界不得混用：治理走 `/blog/admin/**`，作者自助走 `/blog/article|user/**`，公共只读走 `/blog/public/**`（plus-ui 一般不直连公共）。
- 不信任前端权限判断：按钮隐藏只是体验，权限以后端为准。
- token 经统一请求封装携带 `Authorization` + `clientid` 头，不在业务代码手写。
- 与后端联调的闭环：契约确认 → 页面实现 → 联调 → 浏览器验收 → 小步 commit（见 `AGENTS.md`）。
- 边界（D24 原确认，经 D29 修订）：作者「发文 / 编辑」体验落 plus-ui（复用框架后台，本仓库作者页保留）；D29 起 blog-web 亦增设作者中心自助发文/编辑（走 `/blog/article/**`），平台治理仍仅 plus-ui——见 ROADMAP S10 / S12 / D24 / D29。

## 4. S19 登录页 / 后台首页改版（2026-10-13 规划，post-MVP 亮点；状态以 ROADMAP v0.4 为准）

> 与业务逻辑零关联，排核心亮点之后；视觉用 Impeccable skill 打磨，**必须按项目 token 体系重构**，不照抄默认样式（D39）。

- [x] 登录页博客化改造：保留登录逻辑、验证码链路、**SocialCallback 路由**（框架社交回调页，S14 起可能被引用，勿随改版删除）（2026-10-15：品牌区/表单标题改为「Stack Depth · 博客管理后台」定位文案，quickStats/highlights 换为平台真实特性；脚本登录逻辑、验证码、社交登录、rememberMe、footer 一行未动；两个 .env 的 VITE_APP_TITLE 同步改为品牌名；另将 VITE_APP_LOGO_TITLE 改为「Stack Depth」，且侧栏 Logo 由框架 logo.png 换为与 blog-web `AppBrand.vue` 同源的内联 SVG 品牌标（错位叠框 + 品牌黄前框，后框描边随侧栏深浅主题切换））
- [x] 后台首页：博客数据概览（文章/评论/标签计数、待治理评论——调 `blog:article:list` 等已有接口）或静态欢迎页（S19 开工前拍板）（2026-10-15 拍板 A 数据概览并完成：6 张统计卡=文章总数/已发布/草稿/隐藏中（用户隐藏+管理员下线，hint 拆分）/评论总数/标签总数，全部调已有 blog:admin/** 接口 pageSize=1 读 total，零后端改动；`checkPermi` 预判 + 无权限降级提示条 + 单点失败「—」兜底；另加三层接口边界说明卡，纯文案无深链）
- [x] 响应式 / 暗色保持与框架一致（2026-10-15：沿用 960/640 断点策略，样式全走 `--app-*` token 与 `--el-*` 桥接变量，暗色经 `html.dark` token 覆写；移除旧首页 28px 等魔法数字，圆角统一 `--app-radius-*`）
- [x] 验收：浏览器验收（桌面 + 移动视口）；`vue-tsc` 0 错 + 构建通过；治理页/作者页无回归；不动权限与路由结构（三层 API 边界红线）（2026-10-15：agent 侧冒烟通过——浏览器真实登录成功、首页 6 卡拿到真实数据、登录页/首页/作者页/三治理页无控制台错误无 5xx、桌面+移动截图正常；WSL 无 CJK 字体的截图方框问题经 fontconfig 兜底规避；**人工视口/视觉验收 2026-10-16 用户在 Windows 浏览器确认通过**）

> 补充（2026-10-15 收尾，commit `c2d2c60`/`d841848`/`17d270a`）：品牌统一与框架痕迹清理——favicon 换 Stack Depth SVG 品牌标（`public/favicon.svg`，内置 `prefers-color-scheme` 深浅自适应，ico 保留兜底）；删除顶栏 Github/文档外链图标块及 `RuoYiGit`/`RuoYiDoc` 组件；登录/注册页页脚版权改为品牌方；注册页品牌文案对齐登录页；头像旁角色标签「Workspace」→「博客后台」；侧栏菜单「PLUS官网/测试菜单/AI会话/系统监控」由用户在后台菜单管理隐藏（可逆，未落 SQL）。
