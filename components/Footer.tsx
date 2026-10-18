"use client";

import { useSiteData } from "@/lib/site-data";

export function Footer() {
  const { site } = useSiteData();

  return (
    <footer className="relative z-10 border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} {site.name} · 保留所有权利
        </p>
        <div className="flex gap-5">
          {site.socials.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted transition-colors hover:text-accent"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
