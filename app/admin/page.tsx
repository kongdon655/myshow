"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  adminVerify,
  adminIsConfigured,
  adminSetupPassword,
  adminLoadData,
  adminSaveSite,
  adminSaveSocials,
  adminSaveSkills,
  adminSaveTimeline,
  adminSetPassword,
  type AdminData,
} from "@/lib/admin";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3 py-2 text-foreground outline-none transition-colors focus:border-accent";
const btnPrimary =
  "rounded-full bg-accent px-5 py-2 font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50";
const btnGhost =
  "rounded-full border border-line px-4 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-foreground";
const cardCls = "rounded-2xl border border-line bg-surface p-5";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function Section({
  title,
  onSave,
  saving,
  children,
}: {
  title: string;
  onSave: () => void;
  saving: boolean;
  children: ReactNode;
}) {
  return (
    <section className={cardCls}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button type="button" className={btnPrimary} onClick={onSave} disabled={saving}>
          {saving ? "保存中…" : "保存"}
        </button>
      </div>
      {children}
    </section>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  // 首次配置：null=检测中，false=未设置密码（展示设置初始密码表单），true=已设置
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [setupPwd, setSetupPwd] = useState("");
  const [setupPwd2, setSetupPwd2] = useState("");

  const [savingSite, setSavingSite] = useState(false);
  const [savingSocials, setSavingSocials] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [savingTimeline, setSavingTimeline] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const ok = await adminIsConfigured();
        if (active) setConfigured(ok);
      } catch {
        // 未配置 Supabase 时按「已配置」处理，登录提交时会给出明确错误
        if (active) setConfigured(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function notify(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(""), 3000);
  }

  async function onLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const ok = await adminVerify(password);
      if (!ok) {
        setError("密码错误");
        return;
      }
      const loaded = await adminLoadData();
      setData(loaded);
      setAuthed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请确认已配置 Supabase 并执行了 schema.sql");
    } finally {
      setBusy(false);
    }
  }

  async function onSetup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (setupPwd.length < 6) {
      setError("密码至少 6 位");
      return;
    }
    if (setupPwd !== setupPwd2) {
      setError("两次输入的密码不一致");
      return;
    }
    setBusy(true);
    try {
      await adminSetupPassword(setupPwd);
      // 设置成功后直接用该密码进入后台
      const loaded = await adminLoadData();
      setData(loaded);
      setPassword(setupPwd);
      setConfigured(true);
      setAuthed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "设置失败，请确认已执行 schema.sql");
    } finally {
      setBusy(false);
    }
  }

  function patch(fn: (d: AdminData) => AdminData) {
    setData((d) => (d ? fn(d) : d));
  }

  async function saveSite() {
    if (!data) return;
    setSavingSite(true);
    try {
      await adminSaveSite(password, data.site);
      notify("基本信息已保存");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSavingSite(false);
    }
  }

  async function saveSocials() {
    if (!data) return;
    setSavingSocials(true);
    try {
      await adminSaveSocials(password, data.socials);
      notify("社交链接已保存");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSavingSocials(false);
    }
  }

  async function saveSkills() {
    if (!data) return;
    setSavingSkills(true);
    try {
      await adminSaveSkills(password, data.skills);
      notify("技能已保存");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSavingSkills(false);
    }
  }

  async function saveTimeline() {
    if (!data) return;
    setSavingTimeline(true);
    try {
      await adminSaveTimeline(password, data.timeline);
      notify("时间线已保存");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSavingTimeline(false);
    }
  }

  async function savePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newPassword) return;
    setSavingPwd(true);
    try {
      await adminSetPassword(password, newPassword);
      setNewPassword("");
      notify("密码已修改");
    } catch (err) {
      setError(err instanceof Error ? err.message : "修改密码失败");
    } finally {
      setSavingPwd(false);
    }
  }

  if (!authed) {
    if (configured === false) {
      // 首次使用：尚未设置后台密码
      return (
        <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-6 py-16">
          <form onSubmit={onSetup} className="w-full space-y-5">
            <h1 className="text-2xl font-semibold">首次设置后台密码</h1>
            <p className="text-sm text-muted">
              检测到尚未设置后台密码，请设置一个初始密码（至少 6 位）。
            </p>
            <Field label="新密码">
              <input
                type="password"
                className={inputCls}
                value={setupPwd}
                onChange={(e) => setSetupPwd(e.target.value)}
                autoFocus
              />
            </Field>
            <Field label="确认密码">
              <input
                type="password"
                className={inputCls}
                value={setupPwd2}
                onChange={(e) => setSetupPwd2(e.target.value)}
              />
            </Field>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" className={btnPrimary} disabled={busy || !setupPwd || !setupPwd2}>
              {busy ? "设置中…" : "设置并进入后台"}
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-6 py-16">
        <form onSubmit={onLogin} className="w-full space-y-5">
          <h1 className="text-2xl font-semibold">后台登录</h1>
          <Field label="后台密码">
            <input
              type="password"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </Field>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" className={btnPrimary} disabled={busy || !password}>
            {busy ? "验证中…" : "登录"}
          </button>
        </form>
      </div>
    );
  }

  if (!data) {
    return <div className="px-6 py-20 text-center text-muted">加载中…</div>;
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">内容管理</h1>
        <button
          type="button"
          className={btnGhost}
          onClick={() => {
            setAuthed(false);
            setPassword("");
            setData(null);
          }}
        >
          退出登录
        </button>
      </div>

      {flash && <p className="text-sm text-green-400">{flash}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* 基本信息 */}
      <Section title="基本信息" onSave={saveSite} saving={savingSite}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="姓名">
            <input className={inputCls} value={data.site.name} onChange={(e) => patch((d) => ({ ...d, site: { ...d.site, name: e.target.value } }))} />
          </Field>
          <Field label="职位">
            <input className={inputCls} value={data.site.title} onChange={(e) => patch((d) => ({ ...d, site: { ...d.site, title: e.target.value } }))} />
          </Field>
          <Field label="一句话介绍">
            <input className={inputCls} value={data.site.tagline} onChange={(e) => patch((d) => ({ ...d, site: { ...d.site, tagline: e.target.value } }))} />
          </Field>
          <Field label="邮箱">
            <input className={inputCls} value={data.site.email} onChange={(e) => patch((d) => ({ ...d, site: { ...d.site, email: e.target.value } }))} />
          </Field>
          <Field label="头像文字">
            <input className={inputCls} value={data.site.avatar} onChange={(e) => patch((d) => ({ ...d, site: { ...d.site, avatar: e.target.value } }))} />
          </Field>
          <Field label="强调色">
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-10 w-16 cursor-pointer rounded-lg border border-line bg-surface"
                value={data.site.accent}
                onChange={(e) => patch((d) => ({ ...d, site: { ...d.site, accent: e.target.value } }))}
              />
              <span className="text-sm text-muted">{data.site.accent}</span>
            </div>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="个人简介（每行一段）">
            <textarea
              className={inputCls}
              rows={5}
              value={data.site.bio.join("\n")}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  site: { ...d.site, bio: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) },
                }))
              }
            />
          </Field>
        </div>
      </Section>

      {/* 社交链接 */}
      <Section title="社交链接" onSave={saveSocials} saving={savingSocials}>
        <div className="space-y-3">
          {data.socials.map((s, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <input
                className={`${inputCls} flex-1 min-w-[120px]`}
                placeholder="名称"
                value={s.label}
                onChange={(e) => patch((d) => ({ ...d, socials: d.socials.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) }))}
              />
              <input
                className={`${inputCls} flex-[2] min-w-[180px]`}
                placeholder="链接 https://…"
                value={s.href}
                onChange={(e) => patch((d) => ({ ...d, socials: d.socials.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)) }))}
              />
              <button type="button" className={btnGhost} onClick={() => patch((d) => ({ ...d, socials: d.socials.filter((_, j) => j !== i) }))}>
                删除
              </button>
            </div>
          ))}
          <button type="button" className={btnGhost} onClick={() => patch((d) => ({ ...d, socials: [...d.socials, { label: "", href: "" }] }))}>
            + 添加链接
          </button>
        </div>
      </Section>

      {/* 技能 */}
      <Section title="技能" onSave={saveSkills} saving={savingSkills}>
        <div className="space-y-5">
          {data.skills.map((g, gi) => (
            <div key={gi} className="rounded-xl border border-line p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <input
                  className={`${inputCls} flex-1 min-w-[140px]`}
                  placeholder="分类（如 前端）"
                  value={g.category}
                  onChange={(e) => patch((d) => ({ ...d, skills: d.skills.map((x, j) => (j === gi ? { ...x, category: e.target.value } : x)) }))}
                />
                <button type="button" className={btnGhost} onClick={() => patch((d) => ({ ...d, skills: d.skills.filter((_, j) => j !== gi) }))}>
                  删除分类
                </button>
              </div>
              <div className="space-y-2">
                {g.skills.map((s, si) => (
                  <div key={si} className="flex flex-wrap items-center gap-2">
                    <input
                      className={`${inputCls} w-16`}
                      placeholder="图标"
                      value={s.icon}
                      onChange={(e) => patch((d) => ({ ...d, skills: d.skills.map((x, j) => (j === gi ? { ...x, skills: x.skills.map((y, k) => (k === si ? { ...y, icon: e.target.value } : y)) } : x)) }))}
                    />
                    <input
                      className={`${inputCls} flex-1 min-w-[140px]`}
                      placeholder="技能名"
                      value={s.name}
                      onChange={(e) => patch((d) => ({ ...d, skills: d.skills.map((x, j) => (j === gi ? { ...x, skills: x.skills.map((y, k) => (k === si ? { ...y, name: e.target.value } : y)) } : x)) }))}
                    />
                    <input
                      className={`${inputCls} w-24`}
                      type="number"
                      min={0}
                      max={100}
                      placeholder="熟练度"
                      value={s.level}
                      onChange={(e) => patch((d) => ({ ...d, skills: d.skills.map((x, j) => (j === gi ? { ...x, skills: x.skills.map((y, k) => (k === si ? { ...y, level: Number(e.target.value) || 0 } : y)) } : x)) }))}
                    />
                    <button type="button" className={btnGhost} onClick={() => patch((d) => ({ ...d, skills: d.skills.map((x, j) => (j === gi ? { ...x, skills: x.skills.filter((_, k) => k !== si) } : x)) }))}>
                      删除
                    </button>
                  </div>
                ))}
                <button type="button" className={btnGhost} onClick={() => patch((d) => ({ ...d, skills: d.skills.map((x, j) => (j === gi ? { ...x, skills: [...x.skills, { name: "", icon: "", level: 80 }] } : x)) }))}>
                  + 添加技能
                </button>
              </div>
            </div>
          ))}
          <button type="button" className={btnGhost} onClick={() => patch((d) => ({ ...d, skills: [...d.skills, { category: "", skills: [{ name: "", icon: "", level: 80 }] }] }))}>
            + 添加分类
          </button>
        </div>
      </Section>

      {/* 时间线 */}
      <Section title="经历 / 教育" onSave={saveTimeline} saving={savingTimeline}>
        <div className="space-y-4">
          {data.timeline.map((t, i) => (
            <div key={i} className="rounded-xl border border-line p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="类型">
                  <select
                    className={inputCls}
                    value={t.type}
                    onChange={(e) => patch((d) => ({ ...d, timeline: d.timeline.map((x, j) => (j === i ? { ...x, type: e.target.value as "experience" | "education" } : x)) }))}
                  >
                    <option value="experience">工作经历</option>
                    <option value="education">教育背景</option>
                  </select>
                </Field>
                <Field label="职位 / 学位">
                  <input className={inputCls} value={t.title} onChange={(e) => patch((d) => ({ ...d, timeline: d.timeline.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) }))} />
                </Field>
                <Field label="公司 / 学校">
                  <input className={inputCls} value={t.org} onChange={(e) => patch((d) => ({ ...d, timeline: d.timeline.map((x, j) => (j === i ? { ...x, org: e.target.value } : x)) }))} />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="开始（如 2023-06）">
                    <input className={inputCls} value={t.start} onChange={(e) => patch((d) => ({ ...d, timeline: d.timeline.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)) }))} />
                  </Field>
                  <Field label="结束（留空=至今）">
                    <input className={inputCls} value={t.end ?? ""} onChange={(e) => patch((d) => ({ ...d, timeline: d.timeline.map((x, j) => (j === i ? { ...x, end: e.target.value || null } : x)) }))} />
                  </Field>
                </div>
              </div>
              <div className="mt-3">
                <Field label="描述">
                  <input className={inputCls} value={t.description} onChange={(e) => patch((d) => ({ ...d, timeline: d.timeline.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) }))} />
                </Field>
              </div>
              <div className="mt-3">
                <button type="button" className={btnGhost} onClick={() => patch((d) => ({ ...d, timeline: d.timeline.filter((_, j) => j !== i) }))}>
                  删除此项
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className={btnGhost}
            onClick={() =>
              patch((d) => ({
                ...d,
                timeline: [...d.timeline, { type: "experience", title: "", org: "", start: "", end: null, description: "" }],
              }))
            }
          >
            + 添加经历
          </button>
        </div>
      </Section>

      {/* 修改密码 */}
      <section className={cardCls}>
        <h2 className="mb-4 text-lg font-semibold">修改后台密码</h2>
        <form onSubmit={savePassword} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <Field label="新密码">
              <input type="password" className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </Field>
          </div>
          <button type="submit" className={btnPrimary} disabled={savingPwd || !newPassword}>
            {savingPwd ? "修改中…" : "修改密码"}
          </button>
        </form>
      </section>
    </div>
  );
}
