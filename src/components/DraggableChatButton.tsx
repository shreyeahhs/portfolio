import { useState, useRef, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface DraggableChatButtonProps {
  onClick: () => void;
  hasUnread?: boolean;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const DraggableChatButton = ({
  onClick,
  hasUnread = false,
  isDragging: externalDragging,
  onDragStart,
  onDragEnd,
}: DraggableChatButtonProps) => {
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Load position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem("chatButtonPosition");
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        setPosition(parsed);
      } catch (e) {
        console.error("Failed to parse saved position", e);
      }
    }
  }, []);

  // If no saved position, place near the bottom-right on first mount
  useEffect(() => {
    const savedPosition = localStorage.getItem("chatButtonPosition");
    if (!savedPosition) {
      // Use layout viewport (clientWidth) to avoid scrollbar overlap
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const buttonSize = buttonRef.current?.offsetWidth || 56;
      const gap = 24;
      const FOOTER_H = 32;
      
      // Get safe area inset
      const safeAreaBottom = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0'
      );

      const defaultPos = {
        x: Math.max(gap, viewportWidth - buttonSize - gap),
        y: Math.max(gap, viewportHeight - buttonSize - FOOTER_H - gap - safeAreaBottom),
      };

      setPosition(defaultPos);
      // do not persist immediately; let user move it if desired
    }
  }, []);

  // Save position to localStorage
  const savePosition = (pos: { x: number; y: number }) => {
    localStorage.setItem("chatButtonPosition", JSON.stringify(pos));
  };

  // Snap to nearest edge
  const snapToEdge = (x: number, y: number) => {
    // Use layout viewport (clientWidth/clientHeight) to avoid scrollbar overlap
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const buttonSize = buttonRef.current?.offsetWidth || 56;
    const gap = 16;
    const FOOTER_H = 32;
    
    // Get safe area inset
    const safeAreaBottom = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0'
    );

    // Don't always force to edges. Only snap when released near an edge.
    const edgeSnapThreshold = 80; // px from edges to trigger snap

    let finalX = x;
    let finalY = Math.max(
      gap, 
      Math.min(y, viewportHeight - buttonSize - FOOTER_H - gap - safeAreaBottom)
    );

    // Snap to left
    if (x <= edgeSnapThreshold) {
      finalX = gap;
    }

    // Snap to right
    else if (x >= viewportWidth - buttonSize - edgeSnapThreshold) {
      finalX = viewportWidth - buttonSize - gap;
    } else {
      // Keep x but ensure within bounds
      finalX = Math.max(gap, Math.min(x, viewportWidth - buttonSize - gap));
    }

    return { x: finalX, y: finalY };
  };

  // Clamp position so the button never overlaps the scrollbar or goes off-screen
  const clampPosition = (x: number, y: number) => {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const buttonSize = buttonRef.current?.offsetWidth || 56;
    const gap = 12;
    const FOOTER_H = 32;
    
    // Get safe area inset
    const safeAreaBottom = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0'
    );

    const clampedX = Math.max(gap, Math.min(x, viewportWidth - buttonSize - gap));
    const clampedY = Math.max(
      gap, 
      Math.min(y, viewportHeight - buttonSize - FOOTER_H - gap - safeAreaBottom)
    );

    return { x: clampedX, y: clampedY };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const timer = setTimeout(() => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      onDragStart?.();
    }, 300);
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (isDragging) {
      const snapped = snapToEdge(position.x, position.y);
      setPosition(snapped);
      savePosition(snapped);
      setIsDragging(false);
      onDragEnd?.();
    } else {
      onClick();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const clamped = clampPosition(newX, newY);
    setPosition(clamped);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const timer = setTimeout(() => {
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
      onDragStart?.();
    }, 300);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (isDragging) {
      const snapped = snapToEdge(position.x, position.y);
      setPosition(snapped);
      savePosition(snapped);
      setIsDragging(false);
      onDragEnd?.();
    } else {
      onClick();
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;

    const clamped = clampPosition(newX, newY);
    setPosition(clamped);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, dragStart, position]);

  return (
    <button
      ref={buttonRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label="Open chat"
      role="button"
      className={cn(
        "fixed z-40 rounded-full glass flex items-center justify-center group",
        "focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "md:w-14 md:h-14 w-12 h-12",
        "transition-all duration-200",
        isDragging || externalDragging
          ? "shadow-2xl scale-[0.98] cursor-grabbing"
          : "shadow-lg hover:shadow-xl cursor-grab"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging
          ? "none"
          : prefersReducedMotion
          ? "none"
          : "box-shadow 0.2s ease, transform 0.2s ease",
      }}
    >
      <MessageCircle
        className={cn(
          "text-[hsl(var(--accent))]",
          "md:w-6 md:h-6 w-5 h-5",
          hasUnread && "animate-pulse"
        )}
      />
      {hasUnread && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[hsl(var(--accent-orange))] rounded-full animate-pulse" />
      )}
    </button>
  );
};

export default DraggableChatButton;
