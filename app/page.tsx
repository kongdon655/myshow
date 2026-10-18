import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { ProjectCard } from "@/components/ProjectCard";
import { BlogCard } from "@/components/BlogCard";
import { ContactForm } from "@/components/ContactForm";
import { ContactInfo } from "@/components/ContactInfo";
import { getProjects, getBlogPosts } from "@/lib/posts";

export default function Home() {
  const projects = getProjects();
  const posts = getBlogPosts();

  return (
    <>
      <Hero />
      <AboutSection />

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
            <ContactInfo />
          </div>
        </div>
      </section>
    </>
  );
}
