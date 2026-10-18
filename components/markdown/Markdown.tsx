/**
 * 渲染已由 lib/markdown.ts 处理并清洗过的 HTML。
 * 仅在服务端使用，html 来自 renderMarkdown（已启用 rehype-sanitize）。
 */
export function Markdown({ html }: { html: string }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
