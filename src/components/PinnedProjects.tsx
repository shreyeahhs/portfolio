import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ExternalLink, Github, FileText } from "lucide-react";
import Badge from "./Badge";
import TrafficLights from "./TrafficLights";
import ProjectsRail, { ProjectsRailMobile, RailItem } from "./ProjectsRail";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export interface PinnedProject {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  tech: string[];
  media?: {
    image?: string;
    video?: string;
    code?: string;
  };
  links?: {
    live?: string;
    repo?: string;
    case?: string;
  };
  theme?: "light" | "dark";
}

interface PinnedProjectsProps {
  projects: PinnedProject[];
  slidesPerView?: number;
  easing?: string;
  snapStrength?: number;
  parallaxAmount?: number;
  padding?: string;
  enableProgressBar?: boolean;
  enableParallax?: boolean;
  onSlideChange?: (index: number) => void;
  onSlideClick?: (slug: string) => void;
}

const PinnedProjects = ({
  projects,
  slidesPerView = 1,
  snapStrength = 0.5,
  parallaxAmount = 48,
  enableProgressBar = true,
  enableParallax = true,
  onSlideChange,
  onSlideClick,
}: PinnedProjectsProps) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const [unpinnedTop, setUnpinnedTop] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const scrollProgress = useMotionValue(0);
  const slideProgress = useTransform(scrollProgress, [0, 1], [0, projects.length - 1]);
  const [currentSlideProgress, setCurrentSlideProgress] = useState(0);
  const lastSlideChangeRef = useRef<number>(0);

  // Calculate scroll progress and active slide
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !pinnedRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Determine if section is pinned
    const isInPinnedZone = rect.top <= 0 && rect.bottom > windowHeight;
    setIsPinned(isInPinnedZone);

    // Calculate unpinned top offset so the pinned element sits at the bottom
    // of the section when scrolling past the last slide (avoids blank gap)
    if (rect.top > 0) {
      // Before pinning starts - keep it at the section top
      setUnpinnedTop(0);
    } else if (rect.bottom <= windowHeight) {
      // After pinned zone - position the element at the bottom of the container
      const totalScroll = container.offsetHeight - windowHeight;
      setUnpinnedTop(totalScroll);
    } else {
      // While pinned - not applicable
      setUnpinnedTop(null);
    }

    if (isInPinnedZone) {
      // Calculate progress through the pinned section (0 to 1)
      const scrolled = Math.abs(rect.top);
      const totalScroll = container.offsetHeight - windowHeight;
      const total = Math.min(Math.max(scrolled / totalScroll, 0), 1);
      
      scrollProgress.set(total);

      // Calculate active slide index - only advance when fill reaches 100%
      const seg = 1 / projects.length;
      const newActiveIndex = Math.min(projects.length - 1, Math.floor(total / seg + 1e-6));
      
      // Calculate progress within current slide (0-1)
      const start = newActiveIndex * seg;
      const end = start + seg;
      const localProgress = projects.length > 1 
        ? Math.min(Math.max((total - start) / seg, 0), 1)
        : 0;
      
      setCurrentSlideProgress(localProgress);
      
      if (newActiveIndex !== activeSlide) {
        const now = Date.now();
        // Throttle slide changes to avoid rapid swaps causing duplicated visuals
        if (now - (lastSlideChangeRef.current || 0) > 200) {
          lastSlideChangeRef.current = now;
          setActiveSlide(newActiveIndex);
          onSlideChange?.(newActiveIndex);
        }
      }
    }
  }, [activeSlide, projects.length, onSlideChange, scrollProgress]);

  useEffect(() => {
    // Throttled scroll handler for performance
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    
    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPinned) return;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          if (activeSlide < projects.length - 1) {
            const nextSlide = activeSlide + 1;
            scrollToSlide(nextSlide);
          }
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          if (activeSlide > 0) {
            const prevSlide = activeSlide - 1;
            scrollToSlide(prevSlide);
          }
          break;
        case "Home":
          e.preventDefault();
          scrollToSlide(0);
          break;
        case "End":
          e.preventDefault();
          scrollToSlide(projects.length - 1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPinned, activeSlide, projects.length]);

  const scrollToSlide = (index: number) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const windowHeight = window.innerHeight;
    const totalScroll = container.offsetHeight - windowHeight;
    const targetProgress = index / (projects.length - 1);
    const targetScroll = container.offsetTop + (totalScroll * targetProgress);
    
    window.scrollTo({
      top: targetScroll,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  const jumpToSlide = (index: number) => {
    setActiveSlide(index);
    scrollToSlide(index);
  };

  // Generate rail items from project data
  const railItems: RailItem[] = projects.map((project) => ({
    id: project.slug,
    label: project.title.split(/[\s—]+/)[0].toUpperCase(), // Extract first word as label
  }));

  return (
    <section
      ref={containerRef}
      role="region"
      aria-label="Projects"
      className="relative"
      style={{
        // Create enough scroll distance: ~400-500vh for smooth progression
        height: `${400 + projects.length * 50}vh`,
      }}
    >
      {/* Pinned viewport - stays fixed while content changes */}
      <div
        ref={pinnedRef}
        className={cn("transition-all duration-300", isPinned ? "fixed left-0 right-0" : "absolute left-0 right-0")}
        style={{ height: "100vh", top: isPinned ? 0 : unpinnedTop ?? 0 }}
      >
        <div className="h-full relative overflow-hidden" style={{
          backgroundColor: "#0B0F14",
          backgroundImage: `
            radial-gradient(800px circle at 30% -20%, rgba(255,255,255,${prefersReducedMotion ? 0.024 : 0.06}), transparent 60%),
            repeating-linear-gradient(-45deg, rgba(255,255,255,${prefersReducedMotion ? 0.012 : 0.03}) 0, rgba(255,255,255,${prefersReducedMotion ? 0.012 : 0.03}) 1px, transparent 1px, transparent 12px)
          `,
          backgroundBlendMode: "overlay",
          backgroundSize: "auto, 16px 16px",
        }}>
          {/* Mobile rail (top pill) - visible < 1024px */}
          <div className="lg:hidden">
            <ProjectsRailMobile
              items={railItems}
              activeIndex={activeSlide}
              onSelect={jumpToSlide}
            />
          </div>

          {/* Desktop layout: 12-column grid */}
          <div className="container mx-auto px-4 h-full">
            <div className="grid grid-cols-12 gap-8 h-full items-center">
              {/* Left rail navigator - sticky, visible >= 1024px, spans 3 cols */}
              <div className="hidden lg:block col-span-3 xl:w-[280px] lg:w-[240px]">
                <ProjectsRail
                  items={railItems}
                  activeIndex={activeSlide}
                  onSelect={jumpToSlide}
                  progressSegments={projects.length}
                  scrollProgress={currentSlideProgress}
                  className="top-[clamp(56px,8vh,104px)]"
                />
              </div>

              {/* Slides container - remaining cols with left gutter */}
              <div className="relative z-10 pointer-events-auto col-span-12 lg:col-span-9 lg:pl-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: parallaxAmount }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                    style={{ willChange: "transform, opacity" }}
                    className="max-w-4xl"
                  >
                    <ProjectSlide
                      project={projects[activeSlide]}
                      onSlideClick={onSlideClick}
                      enableParallax={enableParallax && !prefersReducedMotion}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Progress dots navigation */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-50">
            {projects.map((project, index) => (
              <button
                key={project.slug}
                onClick={() => jumpToSlide(index)}
                aria-label={`Go to project ${index + 1}: ${project.title}`}
                aria-current={index === activeSlide ? "true" : undefined}
                className={cn(
                  "group relative w-3 h-3 rounded-full transition-all duration-300",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-orange))] focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                  index === activeSlide
                    ? "bg-[hsl(var(--accent-orange))] scale-125 shadow-[0_0_12px_hsl(var(--accent-orange-glow))]"
                    : "bg-border-color hover:bg-text-subtle"
                )}
              >
                {index === activeSlide && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 rounded-full bg-[hsl(var(--accent-orange))] blur-md opacity-60"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="sr-only">
                  Project {index + 1} of {projects.length}: {project.title}
                </span>
              </button>
            ))}
          </div>

          {/* Slide counter */}
          <div className="absolute bottom-12 right-8 font-mono text-sm text-text-subtle">
            <span className="text-[hsl(var(--accent-orange))]">{String(activeSlide + 1).padStart(2, "0")}</span>
            {" / "}
            <span>{String(projects.length).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// Individual project slide component
const ProjectSlide = ({
  project,
  onSlideClick,
  enableParallax,
}: {
  project: PinnedProject;
  onSlideClick?: (slug: string) => void;
  enableParallax: boolean;
}) => {
  return (
    <section
      aria-roledescription="slide"
      aria-label={`Project: ${project.title}`}
      className="grid lg:grid-cols-2 gap-8 items-center"
    >
      {/* Content panel */}
      <motion.div
        initial={enableParallax ? { x: -24, opacity: 0 } : { opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-4xl md:text-5xl font-bold mb-2 terminal-prompt">
            $ {project.slug}
          </h2>
          <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-text-strong">
            {project.title}
          </h3>
          <p className="text-text-muted text-lg leading-relaxed">
            {project.summary}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        {/* Tech stack */}
        <div className="pt-4 border-t border-border-color/50">
          <p className="text-xs text-text-subtle font-mono mb-3">
            Tech Stack: {project.tech.join(" • ")}
          </p>

          {/* Action links */}
          {project.links && (
            <div className="flex gap-4">
              {project.links.live && (
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-glow font-mono flex items-center gap-2 group transition-colors"
                >
                  <ExternalLink
                    size={16}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                  Live Demo
                </a>
              )}
              {project.links.repo && (
                <a
                  href={project.links.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-glow font-mono flex items-center gap-2 group transition-colors"
                >
                  <Github
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  Source
                </a>
              )}
              {project.links.case && (
                <a
                  href={project.links.case}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-glow font-mono flex items-center gap-2 group transition-colors"
                >
                  <FileText
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  Case Study
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Media panel with window chrome */}
      <motion.div
        initial={enableParallax ? { x: 24, opacity: 0 } : { opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="glass overflow-hidden cursor-pointer group"
        onClick={() => onSlideClick?.(project.slug)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSlideClick?.(project.slug);
          }
        }}
        aria-label={`View details for ${project.title}`}
      >
        {/* Window header with traffic lights */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-color/50 bg-panel/40">
          <TrafficLights />
          <span className="text-xs text-text-muted font-mono">
            {project.slug}.preview
          </span>
          <div className="w-[52px]" aria-hidden="true" />
        </div>

        {/* Media content */}
        <div className="aspect-video bg-panel/60 flex items-center justify-center relative overflow-hidden transition-transform duration-500 group-hover:scale-105">
          {project.media?.image ? (
            <img
              src={project.media.image}
              alt={`${project.title} preview`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : project.media?.video ? (
            <video
              src={project.media.video}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <div className="text-center p-8">
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
                <FileText className="w-12 h-12 text-accent" />
              </div>
              <p className="text-text-muted font-mono text-sm">
                {project.slug}
              </p>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors duration-300 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="text-text-strong font-mono text-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Click to explore →
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default PinnedProjects;
