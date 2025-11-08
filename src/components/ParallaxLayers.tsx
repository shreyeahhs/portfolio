import { useEffect, useRef } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export const ParallaxLayers = () => {
  const backLayerRef = useRef<HTMLDivElement>(null);
  const midLayerRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!settings.parallax || prefersReducedMotion) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      
      if (backLayerRef.current) {
        backLayerRef.current.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
      
      if (midLayerRef.current) {
        midLayerRef.current.style.transform = `translateY(${scrolled * 0.6}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [settings.parallax, prefersReducedMotion]);

  if (!settings.parallax) return null;

  return (
    <>
      {/* Back grid layer */}
      <div
        ref={backLayerRef}
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{ zIndex: 0 }}
      >
        <div className="absolute inset-0 bg-grid-diagonal" />
      </div>

      {/* Mid glass haze layer */}
      <div
        ref={midLayerRef}
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{ zIndex: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--panel))] via-transparent to-[hsl(var(--bg))]" />
      </div>
    </>
  );
};
