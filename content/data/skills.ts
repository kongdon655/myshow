export type Skill = { name: string; icon: string; level: number };
export type SkillGroup = { category: string; skills: Skill[] };

export const skillGroups: SkillGroup[] = [
  {
    category: "前端",
    skills: [
      { name: "TypeScript", icon: "🔷", level: 92 },
      { name: "React / Next.js", icon: "⚛️", level: 90 },
      { name: "Tailwind CSS", icon: "🎨", level: 88 },
      { name: "Vue", icon: "🟢", level: 75 },
    ],
  },
  {
    category: "后端",
    skills: [
      { name: "Node.js", icon: "🟩", level: 85 },
      { name: "PostgreSQL", icon: "🐘", level: 80 },
      { name: "GraphQL", icon: "🔺", level: 72 },
      { name: "Redis", icon: "🔴", level: 70 },
    ],
  },
  {
    category: "工具与工程化",
    skills: [
      { name: "Git / CI", icon: "🔧", level: 88 },
      { name: "Docker", icon: "🐳", level: 75 },
      { name: "Vite / Webpack", icon: "⚡", level: 82 },
    ],
  },
];
