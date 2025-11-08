import { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const HINTS = [
  '[system] unauthorized access prompt detected — press / to investigate',
  '[log] shell interface inactive — awaiting user input (/)',
  '[tip] press / or ~ to initiate manual override',
  '[debug] latent CLI detected in memory... trigger: /',
  '[hint] there\'s a hidden terminal layer under this UI',
  '[sys] whisper mode enabled — \'/\' key opens gateway',
  '[console] experimental shell available (use / to toggle)',
];

export const ConsoleDiscovery = ({ onOpenConsole }: { onOpenConsole: () => void }) => {
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [showFlash, setShowFlash] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Compute a bottom offset so the hint/button doesn't overlap the status footer
  const FOOTER_H = 32; // matches SystemStatusFooter
  const safeAreaBottom = typeof window !== 'undefined'
    ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0')
    : 0;
  const bottomOffset = FOOTER_H + 16 + safeAreaBottom; // px
  useEffect(() => {
    const consoleSeen = localStorage.getItem('consoleSeen') === 'true';
    const hintFlashed = localStorage.getItem('hintFlashed') === 'true';

    if (consoleSeen) return;

    // Initial delay before first hint
    const initialDelay = setTimeout(() => {
      // Flash the "/" key on first hint
      if (!hintFlashed) {
        setShowFlash(true);
        localStorage.setItem('hintFlashed', 'true');
        setTimeout(() => setShowFlash(false), 600);
      }

      // Show hint rotation
      const showRandomHint = () => {
        const hint = HINTS[Math.floor(Math.random() * HINTS.length)];
        setCurrentHint(hint);
        setShowHint(true);

        // Hide after 5-7s
        setTimeout(() => {
          setShowHint(false);
        }, 5000 + Math.random() * 2000);
      };

      showRandomHint();

      // Rotate hints every 45-60s
      const interval = setInterval(() => {
        if (localStorage.getItem('consoleSeen') !== 'true') {
          showRandomHint();
        } else {
          clearInterval(interval);
        }
      }, 45000 + Math.random() * 15000);

      return () => clearInterval(interval);
    }, 8000);

    return () => clearTimeout(initialDelay);
  }, []);

  const consoleSeen = localStorage.getItem('consoleSeen') === 'true';

  return (
    <>
      {/* System hint */}
      {showHint && !consoleSeen && (
        <div
          className={`fixed left-4 z-50 glass px-4 py-2 rounded-lg border border-[hsl(var(--border-color)_/_0.3)] ${
            prefersReducedMotion ? '' : 'animate-fade-in'
          }`}
          style={{ opacity: 0.5, bottom: `${bottomOffset}px` }}
        >
          <p className="font-mono text-xs text-[hsl(var(--text-muted))]">
            {currentHint.split('/').map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span
                    className={showFlash && i === 0 ? 'text-[hsl(var(--accent))] animate-pulse' : ''}
                    style={
                      showFlash && i === 0
                        ? {
                            textShadow: '0 0 8px hsl(var(--accent))',
                            animation: 'pulse 600ms ease-out',
                          }
                        : {}
                    }
                  >
                    /
                  </span>
                )}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Console trigger button */}
      {/* Show either the hint or the trigger button to avoid duplicate-looking UI */}
      {!showHint && (
        <button
          onClick={onOpenConsole}
          className="fixed left-4 z-40 glass p-3 rounded-lg hover:bg-[hsl(var(--glass)_/_0.8)] transition-all group border border-[hsl(var(--border-color)_/_0.3)] hidden sm:flex items-center gap-2"
          aria-label="Open hidden console"
          title="Open console (/ or ~)"
          style={{ bottom: `${bottomOffset}px` }}
        >
          <Terminal className="w-4 h-4 text-[hsl(var(--accent))] group-hover:scale-110 transition-transform" />
          
        </button>
      )}
    </>
  );
};
