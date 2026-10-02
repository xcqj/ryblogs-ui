# AGENTS.md — PLUS-UI 管理后台前端

## 项目
- RuoYi-Vue-Plus 6.X 配套前端（Vue3 + Vite + TS），本仓库独立于后端仓库
- 后端仓库：../RuoYi-Vue-Plus（多根工作区下可见）

## 权威源
- API 契约：../RuoYi-Vue-Plus/docs/blog-api.md（接口路径/权限标识/出入参以其为准，冲突先报告）
- 切片计划：../RuoYi-Vue-Plus/docs/ROADMAP.md
- 环境搭建：../RuoYi-Vue-Plus/docs/SETUP.md

## 红线
- 公共页面只调 /blog/public/**；作者后台用 /blog/article|user/**；管理功能用 /blog/admin/**（三层边界，契约 §1/§15）
- 不信任前端做权限判断：按钮隐藏只是体验，权限以后端为准；不给非管理员分配 blog:admin 菜单
- token 经统一请求封装携带 Authorization + clientid 头，不在业务代码手写
- 不把个人机器路径/代理地址写进代码与配置

## 工作流
- 与后端联调的每个切片闭环：接口契约确认 → 页面实现 → 联调 → 浏览器验收 → 小步 commit
