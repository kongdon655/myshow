import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { getSupabase } from "@/lib/db";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效的请求" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "校验失败", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { name, email, message } = parsed.data;

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase
      .from("contact_messages")
      .insert({ name, email, message, status: "new" });
    if (error) {
      console.error("[contact] Supabase 写入失败:", error.message);
      return NextResponse.json({ error: "提交失败" }, { status: 500 });
    }
  } else {
    // 未配置 Supabase：降级为仅日志，保证本地开发可用
    console.log("[contact] 未配置 Supabase，模拟落库:", { name, email, message });
  }

  return NextResponse.json({ ok: true });
}
