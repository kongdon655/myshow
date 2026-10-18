import { Hero } from "@/components/Hero";
import { Skills } from "@/components/Skills";
import { Timeline } from "@/components/Timeline";
import { ProjectCard } from "@/components/ProjectCard";
import { BlogCard } from "@/components/BlogCard";
import { ContactForm } from "@/components/ContactForm";
import { CopyEmail } from "@/components/CopyEmail";
import { site } from "@/content/data/site";
import { skillGroups } from "@/content/data/skills";
import { timeline } from "@/content/data/timeline";
import { getProjects, getBlogPosts } from "@/lib/posts";

export const revalidate = 60;

export default function Home() {
  const projects = getProjects();
  const posts = getBlogPosts();
  const experiences = timeline.filter((t) => t.type === "experience");
  const education = timeline.filter((t) => t.type === "education");

  return (
    <>
      <Hero />

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
            <Skills groups={skillGroups} />
          </div>
        </div>
      </section>

      <section id="projects" className="scroll-mt-24 border-t border-line">
        <div className="mx-auto max-w-[1200px] px-6 py-20">
          <h2 className="text-2xl font-semibold sm:text-3xl">项目</h2>
          <p className="mt-3 text-muted">我做过的一些项目。</p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section id="blog" className="scroll-mt-24 border-t border-line">
        <div className="mx-auto max-w-[1200px] px-6 py-20">
          <h2 className="text-2xl font-semibold sm:text-3xl">博客</h2>
          <p className="mt-3 text-muted">记录技术思考与实践。</p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 border-t border-line">
        <div className="mx-auto max-w-[1200px] px-6 py-20">
          <h2 className="text-2xl font-semibold sm:text-3xl">联系我</h2>
          <p className="mt-3 text-muted">有问题或合作意向？欢迎给我留言。</p>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="max-w-xl">
              <ContactForm />
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-line bg-surface p-6">
                <h3 className="font-semibold">邮箱</h3>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-muted">
                  <span className="break-all">{site.email}</span>
                  <CopyEmail email={site.email} />
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-6">
                <h3 className="font-semibold">社交链接</h3>
                <ul className="mt-3 space-y-2">
                  {site.socials.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted transition-colors hover:text-accent"
                      >
                        {s.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
