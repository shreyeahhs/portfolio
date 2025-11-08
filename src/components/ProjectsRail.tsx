import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export interface RailItem {
  id: string;
  label: string;
}

interface ProjectsRailProps {
  items: RailItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  progressSegments?: number;
  scrollProgress?: number; // 0-1 progress within current slide
  className?: string;
}

/**
 * Factory.ai-style left rail navigator with capsule progress meter and numbered list.
 * Syncs with scroll-driven slide changes; clicking items jumps to that slide.
 */
const ProjectsRail = ({
  items,
  activeIndex,
  onSelect,
  progressSegments,
  scrollProgress = 0,
  className,
}: ProjectsRailProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const segments = progressSegments ?? items.length;

  return (
    <nav
      aria-label="Projects navigation"
      className={cn(
        "flex flex-col gap-6 sticky z-30",
        "top-[clamp(40px,6vh,100px)]",
        className
      )}
    >
      {/* Capsule progress meter - single border with partial fill */}
      <div
        className="h-[18px] inline-flex items-center rounded-full border border-white/25 bg-transparent gap-1 px-1 w-fit"
        role="group"
        aria-label={`Project ${activeIndex + 1} of ${segments}`}
      >
        {Array.from({ length: segments }).map((_, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              aria-label={`Go to ${items[index]?.label || `project ${index + 1}`}`}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-orange))] focus-visible:ring-offset-1 focus-visible:ring-offset-bg flex-shrink-0",
                isActive
                  ? "w-[30px] h-[10px] relative overflow-hidden"
                  : "w-[10px] h-[10px] bg-transparent border border-white/35"
              )}
              style={{
                transitionDuration: prefersReducedMotion ? "0ms" : "200ms",
                transitionTimingFunction: "ease-out",
                transitionProperty: "width, height",
              }}
            >
              {isActive && (
                <>
                  {/* Track */}
                  <div className="absolute inset-0 rounded-full bg-[rgba(255,122,26,0.15)] border border-[rgba(255,122,26,0.6)]" />
                  {/* Fill */}
                  <div
                    className="absolute inset-0 rounded-full bg-[#ff7a1a]"
                    style={{
                      clipPath: `inset(0 ${100 - scrollProgress * 100}% 0 0 round 9999px)`,
                      filter: "drop-shadow(0 0 6px rgba(255,122,26,0.6))",
                      transition: prefersReducedMotion ? "none" : "clip-path 200ms ease-out",
                    }}
                  />
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Numbered list */}
      <ul className="flex flex-col gap-6">
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const number = String(index + 1).padStart(2, "0");

          return (
            <li key={item.id}>
              <button
                onClick={() => onSelect(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(index);
                  }
                }}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 text-left transition-all duration-300 px-2 py-1 rounded-md",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-orange))] focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                  isActive ? "opacity-100" : "opacity-50 hover:opacity-75"
                )}
              >
                {/* Active indicator glow - left side blip */}
                {isActive && !prefersReducedMotion && (
                  <motion.div
                    layoutId="activeRailGlow"
                    className="absolute -left-4 w-2 h-8 rounded-full bg-[hsl(var(--accent-orange))] blur-[6px] opacity-80"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Number prefix */}
                <span
                  className={cn(
                    "font-['JetBrains_Mono',monospace] text-[13px] font-bold tracking-wide transition-all duration-300",
                    isActive
                      ? "text-[hsl(var(--accent-orange))] drop-shadow-[0_0_8px_rgba(255,122,26,0.5)]"
                      : "text-text-subtle opacity-60 group-hover:opacity-80"
                  )}
                >
                  {number}
                </span>

                {/* Divider slash */}
                <span
                  className={cn(
                    "text-xs transition-colors duration-300",
                    isActive
                      ? "text-text-muted"
                      : "text-text-subtle group-hover:text-text-muted"
                  )}
                >
                  /
                </span>

                {/* Label */}
                <span
                  className={cn(
                    "text-xs uppercase tracking-wider font-bold transition-colors duration-300 truncate",
                    isActive
                      ? "text-white"
                      : "text-text-muted opacity-60 group-hover:opacity-80"
                  )}
                >
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

/**
 * Mobile/tablet top pill navigator (horizontal layout for <1024px screens)
 */
export const ProjectsRailMobile = ({
  items,
  activeIndex,
  onSelect,
}: Pick<ProjectsRailProps, "items" | "activeIndex" | "onSelect">) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <nav
      aria-label="Projects navigation"
      className="sticky top-20 z-20 pb-4 bg-bg/80 backdrop-blur-md"
    >
      {/* Horizontal capsule container */}
      <div className="flex items-center justify-center px-4">
        <div
          className="h-[16px] inline-flex items-center rounded-full border border-white/25 bg-transparent gap-1 px-1 w-fit"
        >
          {items.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={item.id}
                onClick={() => onSelect(index)}
                aria-label={`Go to ${item.label}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-orange))] focus-visible:ring-offset-1 focus-visible:ring-offset-bg flex-shrink-0",
                  isActive
                    ? "w-[26px] h-[10px] relative overflow-hidden"
                    : "w-[10px] h-[10px] bg-transparent border border-white/35"
                )}
                style={{
                  transitionDuration: prefersReducedMotion ? "0ms" : "200ms",
                  transitionTimingFunction: "ease-out",
                }}
              >
                {isActive && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-[rgba(255,122,26,0.15)] border border-[rgba(255,122,26,0.6)]" />
                    <div className="absolute inset-0 rounded-full bg-[#ff7a1a]" style={{
                      filter: "drop-shadow(0 0 4px rgba(255,122,26,0.6))",
                    }} />
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default ProjectsRail;
