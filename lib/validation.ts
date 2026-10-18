import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "请输入姓名").max(100, "姓名过长"),
  email: z.string().trim().email("请输入有效的邮箱地址"),
  message: z.string().trim().min(1, "请输入留言内容").max(2000, "内容过长"),
});

export type ContactInput = z.infer<typeof contactSchema>;
