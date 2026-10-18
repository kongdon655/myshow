"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getSupabase } from "@/lib/supabase";
import { site as staticSite } from "@/content/data/site";
import { skillGroups as staticSkills, type SkillGroup } from "@/content/data/skills";
import { timeline as staticTimeline, type TimelineItem } from "@/content/data/timeline";
import { loadLocalData } from "@/lib/local-store";

export type SocialLink = { label: string; href: string };
export type NavItem = { label: string; href: string };

export type SiteInfo = {
  name: string;
  title: string;
  tagline: string;
  email: string;
  avatar: string;
  accent: string;
  bio: string[];
  socials: SocialLink[];
  nav: NavItem[];
};

export type SiteData = {
  site: SiteInfo;
  skills: SkillGroup[];
  timeline: TimelineItem[];
};

const DEFAULT_DATA: SiteData = {
  site: {
    name: staticSite.name,
    title: staticSite.title,
    tagline: staticSite.tagline,
    email: staticSite.email,
    avatar: staticSite.avatar,
    accent: staticSite.accent,
    bio: [...staticSite.bio],
    socials: staticSite.socials.map((s) => ({ label: s.label, href: s.href })),
    nav: staticSite.nav.map((n) => ({ label: n.label, href: n.href })),
  },
  skills: staticSkills,
  timeline: staticTimeline,
};

const SiteDataContext = createContext<SiteData>(DEFAULT_DATA);

/**
 * 从 Supabase 拉取可编辑内容，覆盖静态默认值；未配置或拉取失败时保持默认。
 * 同时把强调色同步到 CSS 变量 --accent。
 */
export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(DEFAULT_DATA);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      // 本地降级：未配置 Supabase 时，从 localStorage 读取后台编辑的内容
      const local = loadLocalData();
      if (local) {
        setData((prev) => ({
          site: {
            ...prev.site,
            ...local.site,
            socials: local.socials?.length ? local.socials : prev.site.socials,
          },
          skills: local.skills?.length ? local.skills : prev.skills,
          timeline: local.timeline?.length ? local.timeline : prev.timeline,
        }));
      }
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [settings, socials, skills, timeline] = await Promise.all([
          sb.from("site_settings").select("*").eq("id", 1).maybeSingle(),
          sb.from("social_links").select("label,href").order("sort_order", { ascending: true }),
          sb.from("skills").select("category,name,icon,level").order("sort_order", { ascending: true }),
          sb.from("timeline_items")
            .select("type,title,org,start_date,end_date,description")
            .order("sort_order", { ascending: true }),
        ]);

        if (cancelled) return;

        setData((prev) => {
          const next: SiteData = { ...prev, site: { ...prev.site } };

          const s = settings.data as
            | { name: string; title: string; tagline: string; email: string; avatar: string; accent: string; bio: string[] }
            | null;
          if (s) {
            next.site = {
              ...next.site,
              name: s.name,
              title: s.title,
              tagline: s.tagline,
              email: s.email,
              avatar: s.avatar,
              accent: s.accent || next.site.accent,
              bio: Array.isArray(s.bio) && s.bio.length > 0 ? s.bio : next.site.bio,
            };
          }

          const socialRows = (socials.data ?? []) as { label: string; href: string }[];
          if (socialRows.length > 0) {
            next.site.socials = socialRows;
          }

          const skillRows = (skills.data ?? []) as {
            category: string;
            name: string;
            icon: string;
            level: number;
          }[];
          if (skillRows.length > 0) {
            const groups: SkillGroup[] = [];
            for (const row of skillRows) {
              const existing = groups.find((g) => g.category === row.category);
              if (existing) {
                existing.skills.push({ name: row.name, icon: row.icon, level: row.level });
              } else {
                groups.push({ category: row.category, skills: [{ name: row.name, icon: row.icon, level: row.level }] });
              }
            }
            next.skills = groups;
          }

          const timelineRows = (timeline.data ?? []) as {
            type: "experience" | "education";
            title: string;
            org: string;
            start_date: string;
            end_date: string | null;
            description: string;
          }[];
          if (timelineRows.length > 0) {
            next.timeline = timelineRows.map((r) => ({
              type: r.type,
              title: r.title,
              org: r.org,
              start: r.start_date,
              end: r.end_date ?? null,
              description: r.description,
            }));
          }

          return next;
        });
      } catch {
        // 拉取失败时静默回退到静态默认值，不影响展示
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.body.style.setProperty("--accent", data.site.accent);
  }, [data.site.accent]);

  return <SiteDataContext.Provider value={data}>{children}</SiteDataContext.Provider>;
}

export function useSiteData(): SiteData {
  return useContext(SiteDataContext);
}
