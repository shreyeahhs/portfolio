import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

const GlassCard = ({ children, className, hover = false }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "glass p-6",
        hover && "glass-hover cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;
