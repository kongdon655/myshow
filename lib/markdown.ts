import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSanitize from "rehype-sanitize";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import type { Root, Heading } from "mdast";

export type TocItem = { id: string; text: string; depth: number };

/** 将 Markdown 渲染为安全的 HTML 字符串（含代码高亮）。 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSanitize)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypePrettyCode, { theme: "github-dark", keepBackground: false })
    .use(rehypeStringify)
    .process(markdown);
  return String(result);
}

/** 提取 h2 / h3 标题生成目录（id 与 rehype-slug 的算法一致）。 */
export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const items: TocItem[] = [];
  visit(tree, "heading", (node: Heading) => {
    if (node.depth >= 2 && node.depth <= 3) {
      const text = toString(node);
      items.push({ id: slugger.slug(text), text, depth: node.depth });
    }
  });
  return items;
}
