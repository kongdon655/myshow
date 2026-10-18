import { getSupabase } from "@/lib/supabase";
import type { SiteInfo, SocialLink } from "@/lib/site-data";
import type { SkillGroup } from "@/content/data/skills";
import type { TimelineItem } from "@/content/data/timeline";
import { site as staticSite } from "@/content/data/site";
import { skillGroups as staticSkills } from "@/content/data/skills";
import { timeline as staticTimeline } from "@/content/data/timeline";
import {
  defaultLocalData,
  loadLocalData,
  saveLocalData,
  verifyLocalPassword,
  setLocalPassword,
  type LocalData,
} from "@/lib/local-store";

/**
 * 后台：所有写操作都通过 Supabase RPC（security definer）校验密码。
 * 未配置 Supabase 时降级为 localStorage（本地模式，默认密码 123456），
 * 便于无数据库也能预览后台改内容的效果。
 */

export async function adminVerify(password: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return verifyLocalPassword(password);
  const { data, error } = await sb.rpc("admin_verify", { p_password: password });
  if (error) throw error;
  return data === true;
}

/** 是否已设置后台密码（本地模式恒为 true，因有默认密码 123456） */
export async function adminIsConfigured(): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return true;
  const { data, error } = await sb.rpc("admin_is_configured");
  if (error) throw error;
  return data === true;
}

/** 仅在尚未设置密码时可用，用于首次配置后台密码 */
export async function adminSetupPassword(newPassword: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    setLocalPassword(newPassword);
    return;
  }
  const { error } = await sb.rpc("admin_setup_password", { p_new_password: newPassword });
  if (error) throw error;
}

export type SiteSettingsInput = Pick<
  SiteInfo,
  "name" | "title" | "tagline" | "email" | "avatar" | "accent" | "bio"
>;

export async function adminSaveSite(password: string, site: SiteSettingsInput): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    if (!verifyLocalPassword(password)) throw new Error("密码错误");
    const data = loadLocalData() ?? defaultLocalData();
    saveLocalData({ ...data, site: { ...data.site, ...site } });
    return;
  }
  const { error } = await sb.rpc("admin_save_site", {
    p_password: password,
    p_data: {
      name: site.name,
      title: site.title,
      tagline: site.tagline,
      email: site.email,
      avatar: site.avatar,
      accent: site.accent,
      bio: site.bio,
    },
  });
  if (error) throw error;
}

export async function adminSaveSocials(password: string, socials: SocialLink[]): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    if (!verifyLocalPassword(password)) throw new Error("密码错误");
    const data = loadLocalData() ?? defaultLocalData();
    saveLocalData({ ...data, socials: socials.map((s) => ({ label: s.label, href: s.href })) });
    return;
  }
  const { error } = await sb.rpc("admin_save_socials", {
    p_password: password,
    p_items: socials.map((s) => ({ label: s.label, href: s.href })),
  });
  if (error) throw error;
}

export async function adminSaveSkills(password: string, groups: SkillGroup[]): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    if (!verifyLocalPassword(password)) throw new Error("密码错误");
    const data = loadLocalData() ?? defaultLocalData();
    saveLocalData({ ...data, skills: groups });
    return;
  }
  const items = groups.flatMap((g) =>
    g.skills.map((s) => ({ category: g.category, name: s.name, icon: s.icon, level: s.level })),
  );
  const { error } = await sb.rpc("admin_save_skills", {
    p_password: password,
    p_items: items,
  });
  if (error) throw error;
}

export async function adminSaveTimeline(password: string, timeline: TimelineItem[]): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    if (!verifyLocalPassword(password)) throw new Error("密码错误");
    const data = loadLocalData() ?? defaultLocalData();
    saveLocalData({ ...data, timeline });
    return;
  }
  const items = timeline.map((t) => ({
    type: t.type,
    title: t.title,
    org: t.org,
    start_date: t.start,
    end_date: t.end ?? "",
    description: t.description,
  }));
  const { error } = await sb.rpc("admin_save_timeline", {
    p_password: password,
    p_items: items,
  });
  if (error) throw error;
}

export async function adminSetPassword(password: string, newPassword: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    if (!verifyLocalPassword(password)) throw new Error("密码错误");
    setLocalPassword(newPassword);
    return;
  }
  const { error } = await sb.rpc("admin_set_password", {
    p_password: password,
    p_new_password: newPassword,
  });
  if (error) throw error;
}

export type AdminData = {
  site: SiteSettingsInput;
  socials: SocialLink[];
  skills: SkillGroup[];
  timeline: TimelineItem[];
};

/** 读取当前可编辑内容用于后台表单；空表时回退到静态默认值。 */
export async function adminLoadData(): Promise<AdminData> {
  const sb = getSupabase();
  if (!sb) {
    const d: LocalData = loadLocalData() ?? defaultLocalData();
    return {
      site: { ...d.site },
      socials: d.socials,
      skills: d.skills,
      timeline: d.timeline,
    };
  }

  const [settings, socials, skills, timeline] = await Promise.all([
    sb.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    sb.from("social_links").select("label,href").order("sort_order", { ascending: true }),
    sb.from("skills").select("category,name,icon,level").order("sort_order", { ascending: true }),
    sb.from("timeline_items")
      .select("type,title,org,start_date,end_date,description")
      .order("sort_order", { ascending: true }),
  ]);

  const s = settings.data as
    | { name: string; title: string; tagline: string; email: string; avatar: string; accent: string; bio: string[] }
    | null;

  const site: SiteSettingsInput = s
    ? {
        name: s.name,
        title: s.title,
        tagline: s.tagline,
        email: s.email,
        avatar: s.avatar,
        accent: s.accent || staticSite.accent,
        bio: Array.isArray(s.bio) && s.bio.length > 0 ? s.bio : [...staticSite.bio],
      }
    : {
        name: staticSite.name,
        title: staticSite.title,
        tagline: staticSite.tagline,
        email: staticSite.email,
        avatar: staticSite.avatar,
        accent: staticSite.accent,
        bio: [...staticSite.bio],
      };

  const socialRows = (socials.data ?? []) as { label: string; href: string }[];
  const socialsData: SocialLink[] =
    socialRows.length > 0 ? socialRows : staticSite.socials.map((x) => ({ label: x.label, href: x.href }));

  const skillRows = (skills.data ?? []) as { category: string; name: string; icon: string; level: number }[];
  let skillsData: SkillGroup[];
  if (skillRows.length > 0) {
    const groups: SkillGroup[] = [];
    for (const row of skillRows) {
      const existing = groups.find((g) => g.category === row.category);
      if (existing) existing.skills.push({ name: row.name, icon: row.icon, level: row.level });
      else groups.push({ category: row.category, skills: [{ name: row.name, icon: row.icon, level: row.level }] });
    }
    skillsData = groups;
  } else {
    skillsData = staticSkills;
  }

  const timelineRows = (timeline.data ?? []) as {
    type: "experience" | "education";
    title: string;
    org: string;
    start_date: string;
    end_date: string | null;
    description: string;
  }[];
  const timelineData: TimelineItem[] =
    timelineRows.length > 0
      ? timelineRows.map((r) => ({
          type: r.type,
          title: r.title,
          org: r.org,
          start: r.start_date,
          end: r.end_date ?? null,
          description: r.description,
        }))
      : staticTimeline;

  return { site, socials: socialsData, skills: skillsData, timeline: timelineData };
}
