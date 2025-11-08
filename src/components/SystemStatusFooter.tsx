import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface Stats {
  uptime: string;
  visitors: number;
  cpu: number;
  temp: number;
  memory?: number;
  network?: number;
}

const layouts = [
  (stats: Stats) => `$ uptime: ${stats.uptime} | visitors: ${stats.visitors} | cpu: ${stats.cpu.toFixed(1)}% | temp: ${stats.temp}°C`,
  (stats: Stats) => `$ mem: ${stats.memory?.toFixed(1)}GB | net: ${stats.network}Mbps | visitors: ${stats.visitors} | cpu: ${stats.cpu.toFixed(1)}%`,
  (stats: Stats) => `$ system: operational | uptime: ${stats.uptime} | temp: ${stats.temp}°C`,
];

export const SystemStatusFooter = () => {
  const [stats, setStats] = useState<Stats>({
    uptime: '00:00:00',
    visitors: 237,
    cpu: 3.7,
    temp: 42,
    memory: 4.2,
    network: 125,
  });
  const [layoutIndex, setLayoutIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings.statusFooter) return;

    const updateStats = () => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      
      setStats(prev => ({
        uptime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        visitors: prev.visitors + (Math.random() > 0.9 ? 1 : 0),
        cpu: Math.max(1, Math.min(15, prev.cpu + (Math.random() - 0.5) * 2)),
        temp: Math.max(38, Math.min(55, prev.temp + (Math.random() - 0.5) * 1)),
        memory: prev.memory ? Math.max(2, Math.min(8, prev.memory + (Math.random() - 0.5) * 0.5)) : undefined,
        network: prev.network ? Math.max(50, Math.min(500, prev.network + (Math.random() - 0.5) * 20)) : undefined,
      }));
    };

    updateStats();
    const interval = setInterval(updateStats, 10000);

    return () => clearInterval(interval);
  }, [startTime, settings.statusFooter]);

  if (!settings.statusFooter) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 glass border-t border-[hsl(var(--border-color))] z-30 hidden sm:block">
      <button
        onClick={() => setLayoutIndex((prev) => (prev + 1) % layouts.length)}
        className="w-full px-4 py-2 text-left font-mono text-xs text-[hsl(var(--text-muted))] hover:text-[hsl(var(--accent))] transition-colors cursor-pointer"
        title="Click to cycle layouts"
      >
        {layouts[layoutIndex](stats)}
      </button>
    </div>
  );
};
