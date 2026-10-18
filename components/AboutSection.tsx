"use client";

import { useSiteData } from "@/lib/site-data";
import { Skills } from "@/components/Skills";
import { Timeline } from "@/components/Timeline";

export function AboutSection() {
  const { site, skills, timeline } = useSiteData();
  const experiences = timeline.filter((t) => t.type === "experience");
  const education = timeline.filter((t) => t.type === "education");

  return (
    <section id="about" className="scroll-mt-24 border-t border-line">
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <h2 className="text-2xl font-semibold sm:text-3xl">关于我</h2>
        <div className="mt-6 max-w-2xl space-y-4 text-muted">
          {site.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="mb-5 text-lg font-medium text-muted">工作经历</h3>
            <Timeline items={experiences} />
          </div>
          <div>
            <h3 className="mb-5 text-lg font-medium text-muted">教育背景</h3>
            <Timeline items={education} />
          </div>
        </div>

        <div className="mt-14">
          <h3 className="mb-6 text-lg font-medium text-muted">技能</h3>
          <Skills groups={skills} />
        </div>
      </div>
    </section>
  );
}
