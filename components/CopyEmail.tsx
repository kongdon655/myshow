"use client";

import { useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板不可用时的降级：无操作
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="text-sm text-accent transition-opacity hover:opacity-80"
    >
      {copied ? "已复制 ✓" : "复制"}
    </button>
  );
}
