import Link from "next/link";
import { formatDate, type BlogPost } from "@/lib/posts";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent/50"
    >
      <time className="text-sm text-muted">{formatDate(post.date)}</time>
      <h3 className="mt-2 font-semibold transition-colors group-hover:text-accent">
        {post.title}
      </h3>
      <p className="mt-2 text-sm text-muted">{post.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span key={tag} className="text-xs text-accent">
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
