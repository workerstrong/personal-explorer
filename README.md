# Personal Explorer

一个 React + Vite 的交互式 Bento Grid 个人网站，并附带中文可视化内容工作台。公开网站读取构建时生成的静态内容，所以即使 Supabase 暂停或临时不可用，访客仍能看到最后一次成功发布的版本。

## 本地运行

```bash
pnpm install
pnpm dev
```

- 公开网站：`http://localhost:5173/`
- 内容工作台：`http://localhost:5173/admin`

如果还没有配置 Supabase，后台会自动使用“本地演示模式”。修改会自动保存在当前浏览器的 `localStorage`，适合体验编辑、实时预览和发布校验，但不会部署到互联网。

## 修改个人资料

有两种方式：

1. 推荐：打开 `/admin`，在表单中编辑并实时预览。
2. 直接修改初始资料：[src/data/profile.js](src/data/profile.js)。它仍是首次建站、本地回退和初始化云端草稿的唯一源码数据文件。

第一阶段工作台可编辑：姓名、身份定位、简介、所在地、状态、邮箱、About 两段内容、全部首页卡片的标题与摘要、SEO 标题/描述/分享图链接。

项目、技能、社交链接、图片等完整初始内容仍集中在 `src/data/profile.js`；这些数组的可视化增删、排序和图片上传属于下一阶段。

## 接入免费的 Supabase 后台

1. 新建一个 Supabase 项目。
2. 打开 SQL Editor，复制并运行 `supabase/migrations/001_phase_one_cms.sql`。运行前把文件底部的 `you@example.com` 改成你的管理员邮箱。
3. 在 Supabase Authentication 中启用 Email / Magic Link，并把本地及线上 `/admin` 地址加入 Redirect URLs。
4. 若希望登录保持约 7 天，在 Supabase Auth 设置中把 refresh-token/session 策略设为对应时长。
5. 复制 `.env.example` 为 `.env.local`，填入 Supabase URL 和 anon key。

只配置下面两个值，就会从本地演示模式切换为 Magic Link 登录和云端草稿：

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## 接入 Vercel 静态发布

把项目导入 Vercel，然后在项目环境变量中加入 `.env.example` 列出的全部值。关键变量：

- `SUPABASE_SERVICE_ROLE_KEY`：只供服务器 API 使用，绝不能以 `VITE_` 开头。
- `ADMIN_EMAIL`：必须与 SQL 白名单中的管理员邮箱一致。
- `VERCEL_DEPLOY_HOOK_URL`：在 Vercel Git / Deploy Hooks 中创建。
- `VERCEL_TOKEN`、`VERCEL_PROJECT_ID`、可选 `VERCEL_TEAM_ID`：用于后台显示部署是否已完成。
- `VITE_PUBLIC_SITE_URL`：线上公开网站地址。

发布过程是：后台保存最新草稿 → `/api/publish` 再次验证管理员和内容 → 写入 `site_publications` → 触发 Vercel 构建 → `scripts/generate-content.mjs` 把已发布 JSON 生成为 `public/content/profile.json` → 静态站点上线。

数据库的 RLS 策略只允许白名单管理员读写草稿；公开角色只能读取已发布内容。服务端发布接口还会再次核对 `ADMIN_EMAIL`，形成第二道保护。

## 检查与构建

```bash
pnpm test
pnpm build
pnpm preview
```

生产文件输出到 `dist/`。`predev` 和 `prebuild` 会自动生成 `public/content/profile.json`；没有云端配置或还没有发布记录时，会安全回退到 `src/data/profile.js`。

## 已实现的体验与无障碍

- 800ms 草稿自动保存、保存状态和多标签页版本冲突提示。
- 编辑表单与同一个公开站点组件组成的实时预览，不维护两套页面。
- 桌面/平板/手机尺寸切换；手机后台提供编辑/预览模式切换。
- 发布前内联验证、错误摘要、部署状态和旧版本保留策略。
- 44px 触控目标、清晰焦点、语义标签、live region 和 `prefers-reduced-motion` 支持。
- 公开页弹窗支持焦点管理、Escape 关闭、外链提示和明暗主题。
