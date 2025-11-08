import { ReactNode } from "react";
import TrafficLights from "./TrafficLights";
import { cn } from "@/lib/utils";

interface WindowCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

const WindowCard = ({ children, className, title }: WindowCardProps) => {
  return (
    <div className={cn("glass overflow-hidden", className)}>
      {/* Window header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-color/50 bg-panel/40">
        <TrafficLights />
        {title && (
          <span className="text-xs text-text-muted font-mono">{title}</span>
        )}
        <div className="w-[52px]" aria-hidden="true" /> {/* Spacer for centering */}
      </div>
      
      {/* Window content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default WindowCard;
