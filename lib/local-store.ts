import { site as staticSite } from "@/content/data/site";
import { skillGroups as staticSkills, type SkillGroup } from "@/content/data/skills";
import { timeline as staticTimeline, type TimelineItem } from "@/content/data/timeline";

/**
 * 本地降级存储：未配置 Supabase 时，后台与站点改用浏览器 localStorage，
 * 默认后台密码为 123456。这样无需数据库也能本地预览后台改内容的效果。
 * 一旦配置 Supabase（lib/supabase.ts 的 getSupabase 返回非空），自动切换回数据库。
 */

export const DEFAULT_ADMIN_PASSWORD = "123456";

const DATA_KEY = "myshow_site_data";
const PASSWORD_KEY = "myshow_admin_password";

export type LocalSite = {
  name: string;
  title: string;
  tagline: string;
  email: string;
  avatar: string;
  accent: string;
  bio: string[];
};

export type LocalSocial = { label: string; href: string };

export type LocalData = {
  site: LocalSite;
  socials: LocalSocial[];
  skills: SkillGroup[];
  timeline: TimelineItem[];
};

export function defaultLocalData(): LocalData {
  return {
    site: {
      name: staticSite.name,
      title: staticSite.title,
      tagline: staticSite.tagline,
      email: staticSite.email,
      avatar: staticSite.avatar,
      accent: staticSite.accent,
      bio: [...staticSite.bio],
    },
    socials: staticSite.socials.map((s) => ({ label: s.label, href: s.href })),
    skills: staticSkills,
    timeline: staticTimeline,
  };
}

export function loadLocalData(): LocalData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DATA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalData>;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as LocalData;
  } catch {
    return null;
  }
}

export function saveLocalData(data: LocalData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
  } catch {
    // 存储失败时静默忽略（例如隐私模式）
  }
}

export function verifyLocalPassword(password: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = window.localStorage.getItem(PASSWORD_KEY);
    return password === (stored ?? DEFAULT_ADMIN_PASSWORD);
  } catch {
    return password === DEFAULT_ADMIN_PASSWORD;
  }
}

export function setLocalPassword(newPassword: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PASSWORD_KEY, newPassword);
  } catch {
    // 忽略
  }
}
