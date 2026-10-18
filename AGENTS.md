# AGENTS.md — 项目代理指令

本文件是给 AI 编码代理（Agent）的项目级指令。改动代码前请先读完本文件，遵循其中的约定。

## 一、项目概述

深色主题、星空背景的**个人作品集网站**，包含首页 Hero、个人介绍、技能展示、项目展示、博客、联系表单等模块。以内容驱动、部署简单为优先。

| 项 | 内容 |
|---|---|
| 框架 | Next.js 15（App Router）+ TypeScript（严格模式） |
| 样式 | Tailwind CSS + CSS 变量（深色主题、强调色可配置） |
| 内容 | 仓库内 `content/**/*.md`（博客/项目）+ `content/data/*.ts`（技能/时间线/站点配置） |
| 后端 | Next.js Route Handlers / Server Actions（无独立后端） |
| 数据库 | Supabase（PostgreSQL），仅用于联系表单留言持久化 |
| 部署 | Vercel（支持 ISR / Server Actions） |

- 主要页面路由：`/`（首页）、`/about`、`/projects`、`/projects/[slug]`、`/blog`、`/blog/[slug]`、`/contact`。
- 核心设计约束来自 `PRD.md`，技术选型与数据模型详见 `TECH_DESIGN.md`，遇到细节分歧以 `PRD.md` 为准。

## 二、开发规范

### 2.1 目录与组织
- 遵循 App Router 约定：页面放 `app/`，可复用组件放 `components/`，纯逻辑/工具放 `lib/`，静态资源放 `public/`。
- 内容与代码分离：博客/项目正文一律写进 `content/**/*.md`（含 frontmatter），**禁止**在组件里硬编码文章/项目列表。
- 站点级配置（姓名、职位、强调色、社交链接）集中在 `content/data/site.ts`，作为「强调色可配置」的唯一来源。

### 2.2 组件规范
- 用函数组件 + Hooks；只在使用浏览器 API（事件、Canvas、表单交互）的组件顶部加 `"use client"`，其余保持服务端组件。
- 客户端与数据获取解耦：读取 Markdown、请求数据库等放 `lib/`，组件只负责渲染。
- 可复用的 Markdown 渲染、代码块、TOC 统一放 `components/markdown/`。

### 2.3 内容与数据
- `lib/posts.ts` 用 `fs.readdir` 动态读取 `content/blog/*.md`、`content/projects/*.md`，按 `date` 降序，生产环境过滤 `draft: true`。
- 博客/项目列表页用 `generateStaticParams` + `revalidate`（ISR）实现「新增 MD 自动更新」。
- 联系表单：用 `zod`（`lib/validation.ts`）做前端即时校验 + 服务端二次校验，提交经 Server Action 或 `app/api/contact/route.ts` 落库到 Supabase `contact_messages` 表。

### 2.4 主题与样式
- 颜色、圆角（12–16px）、缓动曲线收敛为 `styles/globals.css` 的 CSS 变量（如 `--bg` #0B0F1A、`--text` #E6EAF2、`--accent`），Tailwind 通过 `theme.extend.colors` 引用变量；**不要**在组件里硬编码颜色值。
- 三档响应式断点：`<640` 单列、`640–1024` 两列、`>1024` 三列；内容容器 `max-width: 1200px` 居中。
- 星空背景用原生 Canvas 2D + `requestAnimationFrame`，禁止引入 Three.js 或重型动画库。

## 三、代码风格

- **TypeScript**：开启 `strict`，禁止 `any`；公共数据类型（frontmatter、留言等）显式声明 interface/type。
- **命名**：组件用 PascalCase，文件与组件同名；工具函数用 camelCase；常量用 UPPER_SNAKE_CASE。
- **导出**：组件用默认导出，工具函数用命名导出。
- **样式**：优先 Tailwind 工具类，避免内联 `style`；需要动态值（如强调色）时用 CSS 变量而非拼接字符串。
- **React**：优先受控组件；列表渲染用稳定 key；事件监听与 `rAF` 循环必须在 `useEffect` 清理函数中释放（`cancelAnimationFrame`、`removeEventListener`）。
- **错误处理**：网络/数据库操作捕获错误并向上抛出或返回失败状态，不静默吞掉；表单失败要给用户明确反馈并保留已填内容。

## 四、测试要求

以 `PRD.md` 的验收标准为必测项，代码合并前逐项自检：

1. **375px 无横向滚动**：窄屏下检查无 `overflow-x` 溢出，必要时全局 `overflow-x: hidden` 兜底。
2. **移动端星空 ≥ 50fps**：移动端降低粒子数（约 50），`dpr` 上限 2；用性能面板验证帧率。
3. **新增 MD 自动更新**：在 `content/blog/` 新增 `.md` 后，列表页能通过 ISR 自动出现。
4. **表单成功/失败反馈**：空值/非法邮箱触发校验提示；提交成功显示成功态，失败显示错误且不丢内容。
5. **深色主题对比度达标**：文字/强调色对比度满足 WCAG AA（≥ 4.5:1）。

自动化层面：
- 提交前运行 `npm run lint` 与 `npm run typecheck`（或 `tsc --noEmit`），确保无错误。
- 为关键纯逻辑（`lib/posts.ts` 的 frontmatter 解析、`lib/validation.ts` 的 zod 校验）补充单元测试。
- 对星空组件、响应式布局、表单交互做基础组件/端到端测试。

## 五、注意事项

- **Markdown 安全**：渲染用户/MD 内容时启用 `rehype-sanitize`，禁止对未清洗内容使用 `dangerouslySetInnerHTML`，防 XSS。
- **数据库安全**：Supabase 开启 Row Level Security，匿名访问只允许插入 `contact_messages`，禁止读/改/删其他行。
- **无障碍**：所有图片补 `alt`；移动端汉堡菜单需 `aria-expanded`/`aria-controls`、焦点陷阱、`Esc` 关闭；保证键盘可导航。
- **动效降级**：尊重 `prefers-reduced-motion: reduce`，此时星空渲染静态星点、关闭闪烁与视差。
- **Canvas 性能**：处理 `devicePixelRatio`（上限 2）；视差监听用 `rAF` 节流；组件卸载必须停止动画循环。
- **不引入冗余依赖**：粒子动画、UI 动效用原生能力实现，除非明确需要，勿添加 Three.js、动画库等重型依赖。
- **一致性**：改动若涉及数据模型、路由或依赖，同步更新 `PRD.md` 与 `TECH_DESIGN.md`。
