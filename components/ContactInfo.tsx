"use client";

import { useSiteData } from "@/lib/site-data";
import { CopyEmail } from "@/components/CopyEmail";

export function ContactInfo() {
  const { site } = useSiteData();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-surface p-6">
        <h3 className="font-semibold">邮箱</h3>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-muted">
          <span className="break-all">{site.email}</span>
          <CopyEmail email={site.email} />
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <h3 className="font-semibold">社交链接</h3>
        <ul className="mt-3 space-y-2">
          {site.socials.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted transition-colors hover:text-accent"
              >
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
