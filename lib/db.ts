import { createClient } from "@supabase/supabase-js";
import type { ContactInput } from "@/lib/validation";

/**
 * 静态站点没有后端路由，改为客户端直接向 Supabase 插入留言。
 * 需要配置：NEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 未配置时降级为仅日志（保证本地预览可用）。
 */
export async function submitContact(input: ContactInput): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.log("[contact] 未配置 Supabase，模拟落库:", input);
    return;
  }

  const supabase = createClient(url, anonKey);
  const { error } = await supabase.from("contact_messages").insert({
    name: input.name,
    email: input.email,
    message: input.message,
    status: "new",
  });
  if (error) {
    console.error("[contact] Supabase 写入失败:", error.message);
    throw error;
  }
}
