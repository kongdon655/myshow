export type TimelineItem = {
  type: "experience" | "education";
  title: string;
  org: string;
  start: string;
  end: string | null;
  description: string;
};

export const timeline: TimelineItem[] = [
  {
    type: "experience",
    title: "高级前端工程师",
    org: "某科技公司",
    start: "2023-06",
    end: null,
    description: "负责核心 Web 应用的架构设计与性能优化，推动组件库与工程化落地。",
  },
  {
    type: "experience",
    title: "前端工程师",
    org: "某互联网公司",
    start: "2020-07",
    end: "2023-05",
    description: "参与多个业务线的迭代开发，负责数据可视化与移动端适配。",
  },
  {
    type: "education",
    title: "计算机科学与技术 · 学士",
    org: "某大学",
    start: "2016-09",
    end: "2020-06",
    description: "主修计算机基础、算法与 Web 开发，多次获得奖学金。",
  },
];
