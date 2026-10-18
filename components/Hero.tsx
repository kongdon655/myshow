import Link from "next/link";
import { site } from "@/content/data/site";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1200px] flex-col items-center justify-center px-6 py-20 text-center"
    >
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/40 text-xl font-bold text-background"
        aria-hidden="true"
      >
        {site.avatar}
      </div>

      <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">{site.name}</h1>
      <p className="mt-3 text-xl text-muted">{site.title}</p>
      <p className="mt-4 max-w-xl text-muted">{site.tagline}</p>

      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <Link
          href="/#projects"
          className="rounded-full bg-accent px-6 py-3 font-medium text-background transition-opacity hover:opacity-90"
        >
          看项目
        </Link>
        <a
          href="/resume.pdf"
          download
          className="rounded-full border border-line px-6 py-3 font-medium transition-colors hover:border-accent"
        >
          下载简历
        </a>
        <Link
          href="/#contact"
          className="rounded-full border border-line px-6 py-3 font-medium transition-colors hover:border-accent"
        >
          联系我
        </Link>
      </div>
    </section>
  );
}
