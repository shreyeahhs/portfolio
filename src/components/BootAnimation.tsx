import { useEffect, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const bootLines = [
  '> Initializing ShreyasOS v2.5.1',
  '> Loading data_science.modules ...',
  '> Mounting /projects directory',
  '> Starting FastAPI server ... ',
  '> Connecting to PostgreSQL database',
  '> Initializing machine learning pipeline',
  '> Portfolio ready at localhost:5173',
  '> Welcome to the system.',
];

export const BootAnimation = () => {
  const [currentLine, setCurrentLine] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { settings, updateSetting } = useSettings();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!settings.bootLog || settings.bootSeen) {
      setIsVisible(false);
      return;
    }

    const lineDelay = prefersReducedMotion ? 100 : 400;
    const finalDelay = prefersReducedMotion ? 300 : 800;

    const timer = setInterval(() => {
      setCurrentLine(prev => {
        if (prev < bootLines.length - 1) {
          return prev + 1;
        }
        clearInterval(timer);
        
        setTimeout(() => {
          setIsVisible(false);
          updateSetting('bootSeen', true);
        }, finalDelay);
        
        return prev;
      });
    }, lineDelay);

    return () => clearInterval(timer);
  }, [settings.bootLog, settings.bootSeen, updateSetting, prefersReducedMotion]);

  const handleSkip = () => {
    setIsVisible(false);
    updateSetting('bootSeen', true);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-[hsl(var(--bg))] z-[100] flex items-center justify-center">
      <div className="max-w-2xl w-full px-8">
        <div className="space-y-3 font-mono text-sm">
          {bootLines.slice(0, currentLine + 1).map((line, i) => (
            <div
              key={i}
              className={`text-[hsl(var(--accent))] ${
                prefersReducedMotion ? 'opacity-100' : 'animate-fade-in'
              }`}
              style={{
                animationDelay: prefersReducedMotion ? '0ms' : `${i * 50}ms`,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSkip}
        className="fixed bottom-8 right-8 text-xs text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-strong))] transition-colors font-mono"
      >
        Skip (Esc)
      </button>
    </div>
  );
};
