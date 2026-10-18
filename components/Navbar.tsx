"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteData } from "@/lib/site-data";

function sectionId(href: string): string {
  return href.replace(/^\/#/, "");
}

export function Navbar() {
  const { site } = useSiteData();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("hero");
  const pathname = usePathname();
  const isHome = pathname === "/";

  // 首页用滚动监听高亮当前区块；详情页按路径高亮
  useEffect(() => {
    if (!isHome) {
      if (pathname.startsWith("/projects")) setActive("projects");
      else if (pathname.startsWith("/blog")) setActive("blog");
      return;
    }

    const ids = site.nav.map((n) => sectionId(n.href));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [isHome, pathname, site.nav]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => sectionId(href) === active;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/70 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6"
        aria-label="主导航"
      >
        <Link
          href="/#hero"
          className="text-lg font-semibold tracking-tight"
          onClick={() => setOpen(false)}
        >
          {site.name}
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`text-sm transition-colors ${
                  isActive(item.href)
                    ? "font-medium text-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="rounded-full border border-line px-4 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-foreground"
          >
            登录
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "关闭菜单" : "打开菜单"}</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="border-t border-line bg-background/95 px-6 py-4 backdrop-blur-md md:hidden"
        >
          <ul className="flex flex-col gap-3">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block py-1 ${
                    isActive(item.href) ? "font-medium text-accent" : "text-muted"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
