import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatDate, getBlogPost, getBlogPosts } from "@/lib/posts";
import { extractToc, renderMarkdown } from "@/lib/markdown";
import { Markdown } from "@/components/markdown/Markdown";
import { TOC } from "@/components/markdown/TOC";

export const revalidate = 60;

export function generateStaticParams() {
  return getBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.summary };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.content);
  const toc = extractToc(post.content);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12">
        <article className="max-w-[820px]">
          <header>
            <time className="text-sm text-muted">{formatDate(post.date)}</time>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{post.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs text-accent">
                  #{tag}
                </span>
              ))}
            </div>
          </header>
          <div className="mt-10">
            <Markdown html={html} />
          </div>
        </article>

        <aside className="mt-10 lg:mt-0">
          <div className="lg:sticky lg:top-24">
            <TOC items={toc} />
          </div>
        </aside>
      </div>
    </div>
  );
}
