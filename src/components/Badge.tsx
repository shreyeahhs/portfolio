import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "outline";
  className?: string;
}

const Badge = ({ children, variant = "default", className }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium font-mono",
        variant === "default" && "bg-accent-muted border border-accent-dark/30 text-accent-glow",
        variant === "accent" && "bg-accent text-bg",
        variant === "outline" && "bg-transparent border border-white/20 text-text-muted hover:border-white/40 transition-colors",
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
