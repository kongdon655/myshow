import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  draft?: boolean;
  content: string;
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  /** 封面视觉：emoji 或图片路径 */
  cover?: string;
  tags: string[];
  repo?: string;
  demo?: string;
  featured?: boolean;
  date?: string;
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

function listMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
}

function readMarkdownFile(filePath: string, slug: string) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { ...(data as Record<string, unknown>), slug, content };
}

export function getBlogPosts(): BlogPost[] {
  return listMarkdownFiles(BLOG_DIR)
    .map((file) => readMarkdownFile(path.join(BLOG_DIR, file), file.replace(/\.md$/, "")) as BlogPost)
    .filter((p) => !p.draft || process.env.NODE_ENV !== "production")
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return readMarkdownFile(filePath, slug) as BlogPost;
}

export function getProjects(): Project[] {
  return listMarkdownFiles(PROJECTS_DIR)
    .map((file) => readMarkdownFile(path.join(PROJECTS_DIR, file), file.replace(/\.md$/, "")) as Project)
    .sort((a, b) => {
      if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
      return +new Date(b.date ?? 0) - +new Date(a.date ?? 0);
    });
}

export function getProject(slug: string): Project | null {
  const filePath = path.join(PROJECTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return readMarkdownFile(filePath, slug) as Project;
}

export function formatDate(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(+d)) return date;
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}
