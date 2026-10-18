# myshow

深色主题、星空背景的个人作品集与博客网站。

## 技术栈

- **Next.js 15**（App Router）+ TypeScript（严格模式）
- **Tailwind CSS v4** + CSS 变量（强调色可配置）
- 原生 Canvas 2D 星空背景
- Markdown（unified + remark/rehype + Shiki 代码高亮）
- Supabase（联系表单留言持久化，可选）

## 功能

- 单页布局：首页 Hero、关于、项目、博客、联系五个区块（锚点滚动）
- 项目 / 博客详情页（Markdown 渲染、代码高亮、目录 TOC）
- 联系表单（zod 校验 + 成功/失败反馈）
- 深色主题 + 可配置强调色，响应式 + 无障碍支持
- 在线后台 `/admin`：密码登录后可修改个人信息、社交链接、技能、经历/教育

## 快速开始

```bash
npm install
npm run dev   # http://localhost:3000
```

## 内容管理

站点的可编辑内容分两类：

### 1. 个人信息（在线后台 `/admin` 修改）

姓名、职位、一句话介绍、邮箱、头像、强调色、个人简介、社交链接、技能、经历/教育等，可通过后台在浏览器里直接修改，无需改代码或重新部署。改动保存到 Supabase，网站前端加载时自动拉取最新内容。

> 需要先配置 Supabase（见下方「后台管理」），未配置时网站使用 `content/data/*.ts` 的默认值展示。

### 2. 博客 / 项目（Markdown 文件）

- 博客正文：`content/blog/*.md`
- 项目正文：`content/projects/*.md`
- 站点默认配置（姓名、职位、强调色、社交链接）：`content/data/site.ts`（后台未配置 Supabase 时的兜底）
- 技能默认值：`content/data/skills.ts`
- 经历/教育默认值：`content/data/timeline.ts`

新增 `.md` 文件后，重新构建（`npm run build`）即可更新列表（静态导出，配合 Cloudflare Pages 自动部署）。

## 后台管理

后台入口为 `/admin`，用于在线修改「个人信息等」内容。基于 Supabase 实现，密码校验在数据库侧（security definer 函数）完成，匿名用户只能读公开内容、不能直接写。

**一次性配置步骤：**

1. 在 [Supabase](https://supabase.com) 新建项目。
2. 打开项目的 **SQL Editor**，把 `supabase/schema.sql` 整段粘贴执行（会建表、RLS 策略、保存函数与种子数据）。
3. 复制 `.env.local.example` 为 `.env.local`，填入项目 URL 与 anon key：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
   （部署到 Cloudflare Pages 时，在项目的环境变量里同样配置这两个值。）
4. 打开 `http://localhost:3000/admin`（或线上站点的 `/admin`）：
   - 默认后台密码为 **`123456`**（`schema.sql` 里已写入），直接登录即可；
   - 登录后可修改个人信息、社交链接、技能、经历/教育，并可修改后台密码。

> 安全提示：请尽快到后台「修改密码」把默认的 `123456` 改成自己的强密码；匿名 key 是公开的，但所有写操作都需要在数据库侧通过密码校验。

## 部署到 Cloudflare Pages

项目已配置静态导出（`next.config.ts` 的 `output: "export"`），构建产物输出到 `out/`。

方式一：Git 集成（推荐，自动部署）

1. Cloudflare 控制台 → Workers & Pages → Create → Pages → Connect to Git
2. 选择本仓库，构建设置：
   - Build command：`npm run build`
   - Build output directory：`out`
3. 保存并部署，即可获得 `xxx.pages.dev` 域名

方式二：本地直接上传

```bash
npm run build
npx wrangler pages deploy out
```

## 环境变量（可选）

联系表单默认降级为「仅日志」，后台 `/admin` 默认不可用。配置 Supabase 后两者均启用，方法见上方「后台管理」一节：

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 脚本

```bash
npm run dev        # 开发
npm run build      # 生产构建
npm run lint       # ESLint
npm run typecheck  # TypeScript 类型检查
```
