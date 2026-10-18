---
title: "在 Next.js 中搭建 Markdown 博客"
summary: "用 gray-matter、unified 与 Shiki 构建一个支持代码高亮和目录的博客。"
date: "2026-10-15"
tags: ["Next.js", "Markdown"]
---

## 整体思路

博客正文以 Markdown 文件存放，服务端解析 frontmatter 并渲染为 HTML。

## 解析 frontmatter

使用 `gray-matter` 读取元数据：

```ts
import matter from "gray-matter";

const { data, content } = matter(raw);
// data.title、data.date、data.tags ...
```

## 渲染管线

通过 `unified` 组合 remark / rehype 插件，一次完成解析与高亮：

```ts
const html = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings)
  .use(rehypePrettyCode, { theme: "github-dark" })
  .use(rehypeStringify)
  .process(markdown);
```

## 目录与安全

### 自动生成目录

从渲染后的标题节点提取 `id`，配合锚点滚动生成侧边目录。

### 防止 XSS

渲染前启用 `rehype-sanitize`，禁止未清洗内容直接注入 HTML。

## 小结

这套方案无需数据库，新增 `.md` 文件即可自动更新列表，部署简单。
