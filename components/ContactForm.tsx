"use client";

import { useState, type FormEvent } from "react";
import { contactSchema } from "@/lib/validation";
import { submitContact } from "@/lib/db";

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;
type Status = "idle" | "submitting" | "success" | "error";

const empty = { name: "", email: "", message: "", website: "" };

export function ContactForm() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  function setField(field: keyof typeof empty, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // honeypot：隐藏字段被机器人填写则静默丢弃
    if (values.website) return;

    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setStatus("idle");
      return;
    }

    setErrors({});
    setStatus("submitting");
    try {
      await submitContact(parsed.data);
      setValues(empty);
      setStatus("success");
      setFeedback("留言已发送，感谢你的联系！");
    } catch {
      setStatus("error");
      setFeedback("提交失败，请稍后重试。");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-foreground outline-none transition-colors focus:border-accent";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          姓名
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          className={inputClass}
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          邮箱
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className={inputClass}
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          留言
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className={inputClass}
          value={values.message}
          onChange={(e) => setField("message", e.target.value)}
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="mt-1 text-sm text-red-400">{errors.message}</p>}
      </div>

      {/* honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">网站</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => setField("website", e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-accent px-6 py-3 font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "submitting" ? "发送中…" : "发送留言"}
      </button>

      {feedback && (
        <p
          role="status"
          className={`text-sm ${status === "success" ? "text-green-400" : "text-red-400"}`}
        >
          {feedback}
        </p>
      )}
    </form>
  );
}
