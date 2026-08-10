import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ExternalLink, Github } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import Badge from "@/components/Badge";
import PinnedProjects from "@/components/PinnedProjects";
import { pinnedProjectsData } from "@/data/pinnedProjects";
import projectsData from "@/data/projects.json";
import { Project } from "@/types/Project";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projectsData.forEach((project: Project) => {
      project.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  const filteredProjects = useMemo(() => {
    return projectsData.filter((project: Project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tech.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTag = !selectedTag || project.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [searchTerm, selectedTag]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.4 },
    },
  };

  const handleSlideChange = (index: number) => {
    console.log("Slide changed to:", index);
  };

  const handleSlideClick = (slug: string) => {
    console.log("Slide clicked:", slug);
    // Navigate to project detail or open modal
  };

  return (
    <main className="min-h-screen">
      {/* Pinned Projects Section - Factory.ai style */}
      <PinnedProjects
        projects={pinnedProjectsData}
        enableProgressBar
        enableParallax
        onSlideChange={handleSlideChange}
        onSlideClick={handleSlideClick}
      />

      {/* Traditional Projects Grid */}
      <div className="bg-grid pt-24 pb-16">
        <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 terminal-prompt">
            $ cat projects.log
          </h1>
          <p className="text-text-muted text-lg mb-8">
            A collection of projects showcasing full-stack development, AI/ML, and data engineering work.
          </p>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="glass p-4 flex items-center gap-3">
              <Search className="text-accent" size={20} />
              <input
                type="text"
                placeholder="Search projects, technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent outline-none text-text-strong placeholder:text-text-subtle font-mono"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                  !selectedTag
                    ? "bg-accent text-bg"
                    : "bg-panel border border-border-color text-text-muted hover:text-text-strong"
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                    selectedTag === tag
                      ? "bg-accent text-bg"
                      : "bg-panel border border-border-color text-text-muted hover:text-text-strong"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project: Project) => (
              <motion.div key={project.slug} variants={itemVariants}>
                <GlassCard hover className="h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    {project.cover && (
                      <div className="relative aspect-video overflow-hidden rounded-md border border-border-color/50 bg-panel/60">
                        <img
                          src={project.cover}
                          alt={`${project.title} preview`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-mono font-semibold text-lg">
                          {project.title}
                        </h3>
                        <span className="text-xs text-text-subtle font-mono">
                          {project.year}
                        </span>
                      </div>
                      <p className="text-text-muted text-sm">
                        {project.summary}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-border-color/50">
                      <p className="text-xs text-text-subtle font-mono mb-3">
                        Tech: {project.tech.join(", ")}
                      </p>

                      {project.links && (project.links.live || project.links.repo) && (
                        <div className="flex gap-3">
                          {project.links.live && (
                            <a
                              href={project.links.live}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:text-accent-glow text-sm font-mono flex items-center gap-1.5 group"
                            >
                              <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                              Live Demo
                            </a>
                          )}
                          {project.links.repo && (
                            <a
                              href={project.links.repo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:text-accent-glow text-sm font-mono flex items-center gap-1.5 group"
                            >
                              <Github size={14} className="group-hover:scale-110 transition-transform" />
                              Source
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-muted font-mono">
                No projects found matching your criteria.
              </p>
            </div>
          )}
        </motion.div>
      </div>
      </div>
    </main>
  );
};

export default Projects;
