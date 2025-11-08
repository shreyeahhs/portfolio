import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  terminalMode: boolean;
  particles: boolean;
  parallax: boolean;
  asciiConsole: boolean;
  bootLog: boolean;
  statusFooter: boolean;
  theme: 'dark' | 'light' | 'neon';
  bootSeen: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetIntro: () => void;
}

const defaultSettings: Settings = {
  terminalMode: true,
  particles: true,
  parallax: true,
  asciiConsole: true,
  bootLog: true,
  statusFooter: true,
  theme: 'dark',
  bootSeen: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem('portfolio-settings');
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('portfolio-settings', JSON.stringify(settings));
    
    // Apply theme class to document
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetIntro = () => {
    updateSetting('bootSeen', false);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetIntro }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
