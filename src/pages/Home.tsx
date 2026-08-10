import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import WindowCard from "@/components/WindowCard";
import GlassCard from "@/components/GlassCard";
import Badge from "@/components/Badge";
import SkillsShowcase from "@/components/SkillsShowcase";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import projectsData from "@/data/projects.json";
import { Project } from "@/types/Project";
// import Avatar3D from "@/components/Avatar3D";
import { Box } from "lucide-react";

const Home = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const featuredProjects = projectsData.filter((p: Project) => p.featured).slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.5 },
    },
  };

  return (
    <main className="min-h-screen bg-grid">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {/* Hero Section - Terminal Window */}
          <motion.section variants={itemVariants} className="max-w-4xl mx-auto">
            <WindowCard title="terminal.sh">
              <div className="space-y-10">
                <div>
                  <p className="terminal-prompt text-sm mb-4">$ ./render_avatar.sh</p>
                  <div className="relative group mb-4">
                    <img
                      src="/avatar.png"
                      alt="Avatar"
                      className="w-full max-w-[300px] md:max-w-[400px] mx-auto object-contain"
                    />
                    <div className="absolute bottom-4 right-4 md:right-1/4">
                      <Link to="/avatar-3d">
                        <button className="glass px-4 py-2 text-xs font-mono text-accent hover:bg-accent-muted transition-all flex items-center gap-2 group/btn">
                          <Box size={14} className="group-hover/btn:rotate-12 transition-transform" />
                          See in 3D
                        </button>
                      </Link>
                    </div>
                  </div>
                  <p className="terminal-prompt text-sm mb-2">$ whoami</p>
                  <h1 className="text-4xl md:text-6xl font-bold mb-2">
                    Shreyas Gowda
                  </h1>
                  <p className="text-text-muted text-lg">
                    MSc Data Science — University of Glasgow
                  </p>
                </div>

                <div>
                  <p className="terminal-prompt text-sm mb-3">$ cat bio.txt</p>
                  <p className="text-text-muted leading-relaxed">
                    Full-stack developer & data scientist building intelligent systems
                    with Python, TypeScript, and modern web technologies. Experienced in
                    AI/ML pipelines, real-time applications, and scalable backend architecture.
                  </p>
                </div>

                <div>
                  <p className="terminal-prompt text-sm mb-3 text-accent/80">$ ./show_skills.sh</p>
                  <SkillsShowcase />
                </div>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-border-color/30">
                  <Link to="/projects">
                    <button className="glass px-6 py-3 font-mono text-accent hover:bg-accent-muted transition-all flex items-center gap-2 group">
                      View Projects()
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <a href="/Shreyas's Resume.pdf" download="Shreyas_Resume.pdf">
                    <button className="glass px-6 py-3 font-mono text-text-strong hover:text-accent transition-colors flex items-center gap-2">
                      Resume()
                    </button>
                  </a>
                  <Link to="/contact">
                    <button className="glass px-6 py-3 font-mono text-text-strong hover:text-accent transition-colors">
                      Contact()
                    </button>
                  </Link>
                </div>
                <div className="pt-2">
                  <p className="text-[10px] font-mono text-text-subtle/60 leading-tight">
                    * Resume may be outdated. For the latest version, reach out or browse the portfolio (updated weekly).
                  </p>
                </div>
              </div>
            </WindowCard>
          </motion.section>

          {/* Featured Projects */}
          <motion.section variants={itemVariants} className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold terminal-prompt">
                $ ls ./featured-projects
              </h2>
              <Link
                to="/projects"
                className="text-accent hover:text-accent-glow font-mono text-sm flex items-center gap-2 group"
              >
                View all
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredProjects.map((project: Project) => (
                <GlassCard key={project.slug} hover>
                  <div className="space-y-4">
                    {project.cover && (
                      <div className="relative aspect-video overflow-hidden rounded-md border border-border-color/50 bg-panel/60 mb-2">
                        <img
                          src={project.cover}
                          alt={`${project.title} preview`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div>
                      <h3 className="font-mono font-semibold text-lg mb-2">
                        {project.title}
                      </h3>
                      <p className="text-text-muted text-sm">
                        {project.summary}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {project.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="default">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-border-color/50">
                      <p className="text-xs text-text-subtle font-mono">
                        {project.tech.join(" · ")}
                      </p>
                    </div>

                    {project.links && (project.links.live || project.links.repo) && (
                      <div className="flex gap-2">
                        {project.links.live && (
                          <a
                            href={project.links.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-accent-glow text-xs font-mono flex items-center gap-1"
                          >
                            <ExternalLink size={12} />
                            Live
                          </a>
                        )}
                        {project.links.repo && (
                          <a
                            href={project.links.repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-accent-glow text-xs font-mono flex items-center gap-1"
                          >
                            <ExternalLink size={12} />
                            Code
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.section>
        </motion.div>
      </div>
    </main>
  );
};

export default Home;
