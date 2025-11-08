import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent";
  className?: string;
}

const Badge = ({ children, variant = "default", className }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium font-mono",
        variant === "default" && "bg-accent-muted border border-accent-dark/30 text-accent-glow",
        variant === "accent" && "bg-accent text-bg",
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
