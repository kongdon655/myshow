// 站点级配置的唯一来源：姓名、职位、强调色、社交链接、导航等。
// 修改这里的值即可全局生效（强调色通过 layout 注入到 --accent 变量）。

export type Social = { label: string; href: string };
export type NavItem = { label: string; href: string };

export const site = {
  name: "陈墨",
  title: "全栈开发工程师",
  tagline: "用代码构建优雅、高性能的 Web 体验，专注前端工程与用户体验。",
  email: "hello@example.com",
  /** 头像首字母（在圆形渐变中展示） */
  avatar: "陈墨",
  /** 强调色（十六进制），全站可配置 */
  accent: "#6c8cff",
  bio: [
    "我是一名热爱 Web 的全栈开发工程师，拥有多年的前端工程与 Node.js 服务端经验，参与过多个从 0 到 1 的产品落地。",
    "我喜欢把复杂的交互做得简洁，把性能优化做到细节里。工作之外，我会写博客记录技术思考，也喜欢开源社区。",
  ],
  socials: [
    { label: "GitHub", href: "https://github.com" },
    { label: "X / Twitter", href: "https://twitter.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
  ],
  nav: [
    { label: "首页", href: "/#hero" },
    { label: "关于", href: "/#about" },
    { label: "项目", href: "/#projects" },
    { label: "博客", href: "/#blog" },
    { label: "联系", href: "/#contact" },
  ],
} as const;
