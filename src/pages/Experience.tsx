import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ExternalLink, Github, FileText, X, ChevronRight } from "lucide-react";
import Badge from "@/components/Badge";
import internshipsData from "@/data/internships.json";
import { Internship } from "@/types/Internship";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const Experience = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleRows, setVisibleRows] = useState<Set<number>>(new Set());
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Sort experiences by start date (newest first)
  const sortedExperiences = [...internshipsData].sort((a, b) => {
    if (b.start !== a.start) return b.start.localeCompare(a.start);
    if (b.end !== a.end) return b.end.localeCompare(a.end);
    return a.company.localeCompare(b.company);
  });

  // Format date range
  const formatDateRange = (start: string, end: string) => {
    const formatMonth = (dateStr: string) => {
      if (dateStr.toLowerCase() === "present") return "present";
      return dateStr.replace("-", ".");
    };
    return `${formatMonth(start)}–${formatMonth(end)}`;
  };

  // Scroll reveal effect
  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleRows(new Set(sortedExperiences.map((_, i) => i)));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"));
          if (entry.isIntersecting) {
            setVisibleRows((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );

    rowRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [sortedExperiences.length, prefersReducedMotion]);

  // Toggle expansion
  const toggleExpand = (company: string, index: number) => {
    const newId = expandedId === company ? null : company;
    setExpandedId(newId);
    
    // Store in localStorage
    if (newId) {
      localStorage.setItem("experience-expanded", newId);
    } else {
      localStorage.removeItem("experience-expanded");
    }
  };

  // Restore last opened on mount
  useEffect(() => {
    const lastOpened = localStorage.getItem("experience-expanded");
    if (lastOpened && sortedExperiences.some((exp) => exp.company === lastOpened)) {
      setExpandedId(lastOpened);
    }
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown" && index < sortedExperiences.length - 1) {
      e.preventDefault();
      rowRefs.current[index + 1]?.focus();
    } else if (e.key === "ArrowUp" && index > 0) {
      e.preventDefault();
      rowRefs.current[index - 1]?.focus();
    } else if (e.key === "Escape" && expandedId) {
      e.preventDefault();
      setExpandedId(null);
      rowRefs.current[index]?.focus();
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -12, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.4,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.96, y: prefersReducedMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: prefersReducedMotion ? {
        duration: 0.12,
      } : {
        type: "spring" as const,
        stiffness: 400,
        damping: 28,
      },
    },
    exit: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.96,
      y: prefersReducedMotion ? 0 : 8,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.2,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <main
      className="min-h-screen pt-24 pb-16 relative"
      style={{
        backgroundColor: "#0B0F14",
        backgroundImage: `
          radial-gradient(1000px circle at 50% -20%, rgba(255,255,255,0.08), transparent 60%),
          repeating-linear-gradient(
            -45deg,
            rgba(255,255,255,0.06) 0px,
            rgba(255,255,255,0.06) 1px,
            transparent 1px,
            transparent 12px
          )
        `,
      }}
      role="region"
      aria-label="Experience"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.5 }}
          className="mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3 font-mono">
            <span className="text-[hsl(var(--accent))] drop-shadow-[0_0_8px_hsl(var(--accent-glow))]">$</span>{" "}
            <span className="text-foreground">grep -r "experience" ./career</span>
          </h1>
          <p className="text-text-muted text-base md:text-lg">
            Professional work across data science, AI, and engineering.
          </p>
        </motion.div>

        {/* Experience list */}
        <div className="space-y-0 relative">
          {/* Vertical rule */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-border-color/30 hidden md:block"
            aria-hidden="true"
          />

          {sortedExperiences.length === 0 ? (
            <div className="font-mono text-sm text-text-muted">
              <span className="text-[hsl(var(--accent))]">$</span> grep -r "experience" ./career
              <br />
              <span className="text-muted-foreground/60">0 matches</span>
            </div>
          ) : (
            sortedExperiences.map((exp, index) => {
              const isExpanded = expandedId === exp.company;
              const isVisible = visibleRows.has(index);

              return (
                <div key={`${exp.company}-${index}`} className="relative">
                  {/* Row */}
                  <motion.button
                    ref={(el) => (rowRefs.current[index] = el)}
                    data-index={index}
                    variants={rowVariants}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                    onClick={() => toggleExpand(exp.company, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    aria-expanded={isExpanded}
                    aria-controls={`exp-card-${exp.company}`}
                    className="w-full text-left py-3 md:py-4 md:pl-8 group transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-lg"
                    style={{
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                      e.currentTarget.style.backdropFilter = "blur(8px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.backdropFilter = "none";
                    }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                      {/* Date */}
                      <span className="font-mono text-xs md:text-sm text-text-muted/70 min-w-[140px] shrink-0">
                        {formatDateRange(exp.start, exp.end)}
                      </span>

                      {/* Role & Company */}
                      <div className="flex-1 flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm md:text-base text-foreground group-hover:text-[hsl(var(--accent))] transition-colors">
                          {exp.role}
                        </span>
                        <span className="text-text-muted text-sm">—</span>
                        <span className="text-sm md:text-base text-[hsl(var(--accent))]/90 group-hover:text-[hsl(var(--accent))] transition-colors">
                          {exp.company}
                        </span>
                      </div>

                      {/* Tags preview or chevron */}
                      <div className="flex items-center gap-2 shrink-0">
                        {exp.tools?.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="hidden md:inline-block px-2 py-0.5 text-xs rounded-full bg-panel/60 border border-border-color/40 text-text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                        <ChevronRight
                          size={16}
                          className={`text-text-muted/60 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </motion.button>

                  {/* Expanded card */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        id={`exp-card-${exp.company}`}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="my-4 md:ml-8 p-6 md:p-8 space-y-5"
                        style={{
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "16px",
                          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
                        }}
                        role="region"
                        aria-live="polite"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl md:text-2xl font-bold mb-1 text-foreground">
                              {exp.role}
                            </h3>
                            <p className="text-[hsl(var(--accent))] font-medium mb-2">
                              {exp.company}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                              {exp.location && (
                                <span className="flex items-center gap-1.5">
                                  <MapPin size={14} className="text-[hsl(var(--accent))]/70" />
                                  {exp.location}
                                </span>
                              )}
                              <span className="font-mono text-xs">
                                {formatDateRange(exp.start, exp.end)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setExpandedId(null)}
                            className="shrink-0 p-2 rounded-lg hover:bg-panel/60 transition-colors text-text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                            aria-label="Close details"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        {/* Highlights */}
                        {exp.highlights && exp.highlights.length > 0 && (
                          <ul className="space-y-2 text-sm text-text-muted">
                            {exp.highlights.map((item, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-[hsl(var(--accent))] mt-1 shrink-0">▹</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Tags */}
                        {exp.tools && exp.tools.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {exp.tools.map((tag, i) => (
                              <Badge key={i} variant="default">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Links (if available) */}
                        {(exp as any).links && (
                          <div className="flex flex-wrap gap-3 pt-2 border-t border-border-color/30">
                            {(exp as any).links.live && (
                              <a
                                href={(exp as any).links.live}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--accent))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
                              >
                                <ExternalLink size={14} />
                                Live
                              </a>
                            )}
                            {(exp as any).links.repo && (
                              <a
                                href={(exp as any).links.repo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--accent))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
                              >
                                <Github size={14} />
                                Repo
                              </a>
                            )}
                            {(exp as any).links.case && (
                              <a
                                href={(exp as any).links.case}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--accent))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
                              >
                                <FileText size={14} />
                                Case Study
                              </a>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
};

export default Experience;
