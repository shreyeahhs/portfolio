import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ExternalLink, Github, FileText, X, ChevronRight } from "lucide-react";
import Badge from "@/components/Badge";
import internshipsData from "@/data/internships.json";
import { Internship } from "@/types/Internship";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

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
      if (!dateStr) return "";
      if (dateStr.toLowerCase() === "present") return "present";
      // Convert YYYY-MM to YYYY.MM
      return dateStr.replace("-", ".");
    };
    return `${formatMonth(start)} — ${formatMonth(end)}`;
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
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
    );

    rowRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [sortedExperiences.length, prefersReducedMotion]);

  // Toggle expansion
  const toggleExpand = (company: string) => {
    const newId = expandedId === company ? null : company;
    setExpandedId(newId);

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
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.5,
        ease: "easeOut" as any,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, height: 0, marginTop: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      marginTop: 16,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2, delay: 0.1 },
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      marginTop: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.1 },
      }
    },
  };

  return (
    <main
      className="min-h-screen pt-24 pb-24 relative overflow-hidden"
      style={{ backgroundColor: "#0B0F14" }}
    >
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-grid-diagonal" />
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        {/* Header - Aligned with timeline dot center (approx 160px from left on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 md:pl-[142px]" // 130px (date) + 12px (space)
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-4 font-mono tracking-tight">
            <span className="text-[hsl(var(--accent))] accent-glow">$</span>{" "}
            grep -r <span className="text-text-muted">"experience"</span> ./career
          </h1>
          <p className="text-text-muted text-lg font-mono">
            {">"} Professional journey in Data Science & AI.
          </p>
        </motion.div>

        {/* Experience List Container */}
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div
            className="absolute left-0 md:left-[130px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[hsl(var(--accent))/0.5] via-border-color/20 to-transparent hidden md:block"
            aria-hidden="true"
          />

          <div className="space-y-2">
            {sortedExperiences.map((exp, index) => {
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
                    onClick={() => toggleExpand(exp.company)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={cn(
                      "w-full text-left p-3 md:p-5 rounded-xl transition-all duration-300 group mb-2",
                      "bg-white/[0.015] border border-white/15 hover:border-white/30 hover:bg-white/[0.04]",
                      isExpanded && "bg-white/[0.05] border-[hsl(var(--accent))]/40 shadow-xl shadow-[hsl(var(--accent))]/5"
                    )}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Date Column (fixed width on desktop) */}
                      <div className="md:w-[130px] shrink-0 font-mono text-[12px] text-text-muted/60 group-hover:text-text-muted transition-colors">
                        {formatDateRange(exp.start, exp.end)}
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          <h2 className="text-base md:text-lg font-semibold text-text-strong group-hover:text-[hsl(var(--accent))] transition-colors">
                            {exp.role}
                          </h2>
                          <span className="text-text-muted/40 hidden md:inline">—</span>
                          <span className="text-[hsl(var(--accent))] text-sm font-medium opacity-80 group-hover:opacity-100">
                            {exp.company}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {exp.tools?.map((tool, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded border border-white/5 bg-white/5 text-text-muted/70"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Interaction hint */}
                      <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-white/5 opacity-40 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                        <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-90")} />
                      </div>
                    </div>
                  </motion.button>

                  {/* Details Card */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="overflow-hidden md:ml-[150px]"
                      >
                        <div className="p-6 md:p-8 glass bg-panel/40 space-y-6">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-1">
                              <h3 className="text-xl font-bold text-text-strong">{exp.role}</h3>
                              <p className="text-[hsl(var(--accent))] font-mono">{exp.company}</p>
                              {exp.location && (
                                <p className="text-sm text-text-muted flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-[hsl(var(--accent))]/60" />
                                  {exp.location}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                              className="p-2 hover:bg-white/10 rounded-lg self-start transition-colors"
                            >
                              <X className="w-5 h-5 text-text-muted" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-text-muted/60 border-b border-white/5 pb-2">Key Contributions</h4>
                            <ul className="space-y-3">
                              {exp.highlights?.map((point, i) => (
                                <li key={i} className="flex gap-3 text-sm text-text-muted/90 leading-relaxed">
                                  <span className="text-[hsl(var(--accent))] shrink-0 mt-1">▹</span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {exp.tools?.map((tool, i) => (
                              <Badge key={i} variant="outline" className="font-mono text-[10px] bg-transparent border-white/20">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Experience;
