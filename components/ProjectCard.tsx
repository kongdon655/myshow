import Link from "next/link";
import type { Project } from "@/lib/posts";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-accent/50"
    >
      <div
        className="flex h-40 items-center justify-center bg-gradient-to-br from-surface-2 to-surface text-4xl"
        aria-hidden="true"
      >
        {project.cover ?? "🖥️"}
      </div>
      <div className="p-5">
        <h3 className="font-semibold transition-colors group-hover:text-accent">{project.title}</h3>
        <p className="mt-2 text-sm text-muted">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
