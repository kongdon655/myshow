# TECH_DESIGN — 个人作品集网站

> 对应文档：`PRD.md`
> 定位：深色主题、星空背景的个人作品集 + 博客 + 联系表单，以内容驱动、部署简单为优先。

---

## 一、技术栈选择

| 层次 | 选型 | 理由 |
|---|---|---|
| 前端框架 | **Next.js 15（App Router）+ TypeScript** | 需要博客 Markdown 渲染、项目详情页、SEO 与静态生成；SSR/ISR 天然适合「新增 MD 自动更新列表」 |
| 样式 | **Tailwind CSS + CSS 变量** | 快速实现响应式三档断点与设计规范；强调色通过 CSS 变量做成单一配置点 |
| 动效 | **原生 Canvas 2D + requestAnimationFrame**（星空）；CSS transition + 统一缓动（UI） | 粒子星空用原生 Canvas 足够且可控，不引入 Three.js 降低体积；UI 动效用 CSS 即可，无需动画库 |
| 内容/博客 | **Markdown/MDX 文件 + `gray-matter` + `remark/rehype` + Shiki** | 博客/项目以仓库内 `.md` 文件为数据源，符合「新增 MD 自动更新」；Shiki 做代码高亮，SSR 友好 |
| 后端 | **Next.js Route Handlers / Server Actions（无独立后端）** | 作品集除「联系表单提交」外无服务端逻辑，用 Next.js 内置能力即可，部署在 Vercel |
| 数据库 | **Supabase（PostgreSQL）** | 仅用于持久化「联系表单留言」；免费额度足够、自带 REST/Row Level Security、Vercel 生态契合。若想更轻，可退化为 **Turso（libSQL）/ SQLite** 或纯邮件投递（Resend）不落库 |
| 部署 | **Vercel** | 与 Next.js 原生集成，支持 ISR/Server Actions |

> 备选：若博客内容量大且需要非技术用户在线编辑，可将「内容层」替换为 Sanity / Contentlayer；本项目规模用「仓库内 Markdown + Git」更简洁。

---

## 二、项目结构

采用 Next.js App Router 约定，内容（数据）与代码分离。

```
portfolio/
├── app/
│   ├── layout.tsx              # 全局布局：星空背景、导航、页脚、字体、元数据
│   ├── page.tsx                # 首页 Hero
│   ├── about/page.tsx          # 个人介绍（简介 + 时间线 + 教育）
│   ├── projects/
│   │   ├── page.tsx            # 项目卡片列表
│   │   └── [slug]/page.tsx     # 项目详情
│   ├── blog/
│   │   ├── page.tsx            # 博客列表（标题/摘要/日期/标签）
│   │   └── [slug]/page.tsx     # 博客详情（Markdown + 代码高亮 + TOC）
│   ├── contact/page.tsx        # 联系页（邮箱复制 + 社交链接 + 表单）
│   └── api/
│       └── contact/route.ts    # POST 联系表单（校验 + 落库/发信）
├── components/
│   ├── Starfield.tsx           # Canvas 星空（粒子 + 闪烁 + 视差）
│   ├── Navbar.tsx              # 吸顶毛玻璃导航 + 移动端汉堡菜单
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── SkillCard.tsx
│   ├── ProjectCard.tsx
│   ├── BlogCard.tsx
│   ├── ContactForm.tsx         # 客户端组件：校验 + 提交 + 反馈
│   ├── Timeline.tsx            # 经历/教育时间线
│   └── markdown/
│       ├── MDXContent.tsx      # MDX 渲染容器
│       ├── CodeBlock.tsx       # Shiki 高亮代码块
│       └── TOC.tsx             # 目录
├── content/
│   ├── blog/*.md               # 博客正文（含 frontmatter）
│   ├── projects/*.md           # 项目正文（含 frontmatter）
│   └── data/
│       ├── skills.ts           # 技能分类 + 熟练度
│       ├── timeline.ts         # 经历 / 教育时间线
│       └── site.ts             # 站点配置：姓名/职位/强调色/社交链接
├── lib/
│   ├── posts.ts                # 读取 content/*.md、解析 frontmatter、排序
│   ├── markdown.ts             # remark/rehype + Shiki 统一配置
│   ├── validation.ts           # zod schema（联系表单）
│   └── db.ts                   # Supabase 客户端
├── styles/
│   └── globals.css             # CSS 变量（颜色/圆角/缓动）、深色主题基样
├── public/                     # 头像、封面图、favicon、OG 图
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

---

## 三、数据模型

### 3.1 博客文章（`content/blog/*.md` 的 frontmatter）

| 字段 | 类型 | 说明 |
|---|---|---|
| `slug` | string | 由文件名派生，唯一标识，用于路由 |
| `title` | string | 标题 |
| `summary` | string | 摘要（列表页显示） |
| `date` | date | 发布日期 |
| `tags` | string[] | 标签 |
| `draft` | boolean | 是否草稿（可选，生产环境过滤） |
| `content` | string | Markdown 正文 |

```yaml
---
title: "使用 Canvas 优化粒子动画"
summary: "从 60fps 到稳定 60fps 的优化记录"
date: "2026-10-18"
tags: ["Canvas", "性能"]
draft: false
---
```

### 3.2 项目（`content/projects/*.md` 的 frontmatter）

| 字段 | 类型 | 说明 |
|---|---|---|
| `slug` | string | 唯一标识 |
| `title` | string | 项目名 |
| `description` | string | 卡片描述 |
| `cover` | string | 封面图路径 |
| `tags` | string[] | 技术标签 |
| `repo` | string? | 仓库链接 |
| `demo` | string? | 在线演示链接 |
| `featured` | boolean | 是否置顶/精选 |
| `content` | string | 详情正文 |

### 3.3 技能（`content/data/skills.ts`，静态数据）

| 字段 | 类型 | 说明 |
|---|---|---|
| `category` | string | 分类（前端/后端/工具…） |
| `name` | string | 技能名 |
| `icon` | string | 图标标识 |
| `level` | number | 熟练度 0–100 |

### 3.4 经历 / 教育（`content/data/timeline.ts`，静态数据）

| 字段 | 类型 | 说明 |
|---|---|---|
| `type` | "experience" \| "education" | 类型 |
| `title` | string | 职位 / 学位 |
| `org` | string | 公司 / 学校 |
| `start` | date | 开始时间 |
| `end` | date \| null | 结束时间（null = 至今） |
| `description` | string | 描述 |

### 3.5 联系表单留言（Supabase 表 `contact_messages`）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | uuid (PK) | 主键 |
| `name` | text | 姓名 |
| `email` | text | 邮箱 |
| `message` | text | 留言内容 |
| `status` | text | 状态：`new` / `read`（默认 `new`） |
| `created_at` | timestamptz | 提交时间 |

> 站点级配置（姓名、职位、强调色、社交链接）集中在 `content/data/site.ts`，作为「强调色可配置」的唯一来源。

---

## 四、关键技术点

### 4.1 星空背景性能与动画（验收：移动端 ≥ 50fps）
- 使用原生 **Canvas 2D + `requestAnimationFrame`**，不引入 Three.js。
- **粒子数分级**：`>1024` 三列时约 150 粒子；`<640` 移动端降到约 50 粒子，控制绘制开销。
- **devicePixelRatio 处理**：Canvas 尺寸按 `dpr` 缩放，但 `dpr` 上限设为 2，避免高分屏过度绘制。
- **闪烁 + 视差**：闪烁用每粒子相位差 + 正弦透明度；视差监听 `scroll`/`pointermove`，用 `rAF` 节流，位移量按层级分档。
- **`prefers-reduced-motion: reduce`**：直接渲染静态星点或去掉闪烁/视差。
- 组件卸载时 `cancelAnimationFrame` 并移除事件监听，避免内存泄漏。

### 4.2 Markdown 渲染管线（博客详情 + TOC + 代码高亮）
- 用 `gray-matter` 解析 frontmatter；`remark`（`remark-gfm`）解析、`rehype`（`rehype-slug` + `rehype-autolink-headings`）生成标题 id。
- **Shiki** 做代码高亮，在服务端完成（SSR 输出 HTML），避免客户端引入高亮库的闪烁与体积问题。
- **TOC**：从渲染后的标题节点提取 id 生成目录，配合锚点滚动。
- **安全**：不直接 `dangerouslySetInnerHTML` 未清洗内容；启用 `rehype-sanitize` 防止 Markdown 注入 XSS。

### 4.3 「新增 MD 自动更新」的实现
- `lib/posts.ts` 用 `fs.readdir` 读取 `content/blog/*.md` 动态生成列表，而非硬编码。
- 使用 **ISR（Incremental Static Regeneration）**：`generateStaticParams` 生成静态页，设置 `revalidate`（如 60s），新增/修改 MD 后自动重建；也可用 `revalidatePath` 做按需更新。
- 博客列表按 `date` 降序排序，`draft: true` 在生产环境过滤。

### 4.4 强调色可配置 + 深色主题
- 在 `styles/globals.css` 的 `:root` 定义变量：`--bg`（#0B0F1A）、`--text`（#E6EAF2）、`--accent`（可改）。
- Tailwind 通过 `theme.extend.colors` 引用这些变量，改一处即可全站生效。
- 圆角（12–16px）与缓动曲线同样收敛为变量，保证动效统一。

### 4.5 响应式与无障碍（验收：375px 无横向滚动、AA 对比度、键盘可导航）
- 三档断点：`<640` 单列、`640–1024` 两列、`>1024` 三列；内容容器 `max-width: 1200px` 居中。
- 全局 `overflow-x: hidden` 兜底，并用 375px 视口回归检查横向滚动。
- 对比度按 WCAG AA 校验（深色背景下文字/强调色比值 ≥ 4.5:1）。
- 移动端汉堡菜单：`aria-expanded`、`aria-controls`、焦点陷阱（focus trap）、`Esc` 关闭；图片补全 `alt`。

### 4.6 联系表单：校验 + 提交 + 反馈
- 用 **zod** 定义 schema，前端即时校验 + 服务端二次校验（不信任客户端）。
- 通过 **Server Action 或 Route Handler** 提交到 Supabase `contact_messages` 表（Row Level Security 关闭匿名写入表之外的访问）。
- 返回成功/失败状态，前端展示明确反馈；失败保留已填内容。
- 防滥用：honeypot 隐藏字段 + 简单频率限制（同 IP 提交间隔）。

### 4.7 SEO 与元数据
- 使用 Next.js `Metadata` API 生成标题、描述、Open Graph；动态页（博客/项目）从 frontmatter 注入。
- 提供 `sitemap.ts` / `robots.ts`，提升收录。
