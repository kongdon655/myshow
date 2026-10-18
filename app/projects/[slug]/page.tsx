import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";
import { Markdown } from "@/components/markdown/Markdown";

export const revalidate = 60;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.description };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const html = await renderMarkdown(project.content);

  return (
    <div className="mx-auto max-w-[820px] px-6 py-16">
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">{project.title}</h1>
        <p className="mt-3 text-muted">{project.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-surface px-3 py-1 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent"
            >
              仓库 ↗
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent"
            >
              演示 ↗
            </a>
          )}
        </div>
      </header>
      <article className="mt-10">
        <Markdown html={html} />
      </article>
    </div>
  );
}
