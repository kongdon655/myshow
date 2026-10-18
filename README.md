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

## 快速开始

```bash
npm install
npm run dev   # http://localhost:3000
```

## 内容管理

- 站点配置（姓名、职位、强调色、社交链接）：`content/data/site.ts`
- 技能：`content/data/skills.ts`
- 经历/教育：`content/data/timeline.ts`
- 博客正文：`content/blog/*.md`
- 项目正文：`content/projects/*.md`

新增 `.md` 文件后，首页列表会通过 ISR 自动更新。

## 环境变量（可选）

联系表单默认降级为「仅日志」。如需持久化，复制 `.env.local.example` 为 `.env.local` 并配置：

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
