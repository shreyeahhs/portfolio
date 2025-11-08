import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Terminal } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface CommandOutput {
  command: string;
  output: string;
  timestamp: string;
}

const commands = {
  'open projects': 'Navigate to Projects section',
  'about me': 'Navigate to About page',
  'contact shreyas': 'Navigate to Contact page',
  'theme dark': 'Switch to dark theme',
  'theme light': 'Switch to light theme',
  'theme neon': 'Switch to neon theme',
  'help': 'Show available commands',
  'clear': 'Clear terminal output',
  'version': 'Show site version',
};

export const CommandLine = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<CommandOutput[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { settings, updateSetting } = useSettings();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ';' && !isOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Autocomplete
  useEffect(() => {
    if (input) {
      const matches = Object.keys(commands).filter(cmd =>
        cmd.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 6);
      setSuggestions(matches);
      setSelectedSuggestion(0);
    } else {
      setSuggestions([]);
    }
  }, [input]);

  const addOutput = (command: string, text: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setOutput(prev => [...prev, { command, output: text, timestamp }]);
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    
    if (!trimmed) return;

    setHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    switch (trimmed) {
      case 'open projects':
        addOutput(cmd, 'Navigating to Projects...');
        setTimeout(() => navigate('/projects'), 300);
        break;
      
      case 'about me':
        addOutput(cmd, 'Opening About page...');
        setTimeout(() => navigate('/about'), 300);
        break;
      
      case 'contact shreyas':
        addOutput(cmd, 'Opening Contact page...');
        setTimeout(() => navigate('/contact'), 300);
        break;
      
      case 'theme dark':
        updateSetting('theme', 'dark');
        addOutput(cmd, 'Theme switched to dark ✓');
        break;
      
      case 'theme light':
        updateSetting('theme', 'light');
        addOutput(cmd, 'Theme switched to light ✓');
        break;
      
      case 'theme neon':
        updateSetting('theme', 'neon');
        addOutput(cmd, 'Theme switched to neon ✓');
        break;
      
      case 'help':
        const helpText = Object.entries(commands)
          .map(([c, desc]) => `  ${c.padEnd(20)} - ${desc}`)
          .join('\n');
        addOutput(cmd, `Available commands:\n${helpText}`);
        break;
      
      case 'clear':
        setOutput([]);
        break;
      
      case 'version':
        addOutput(cmd, 'ShreyasOS v1.0.0');
        break;
      
      default:
        addOutput(cmd, `Command not found: "${cmd}". Type "help" for available commands.`);
    }

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (suggestions.length > 0 && selectedSuggestion >= 0) {
        setInput(suggestions[selectedSuggestion]);
        setSuggestions([]);
      } else {
        executeCommand(input);
      }
    } else if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      setInput(suggestions[selectedSuggestion]);
      setSuggestions([]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedSuggestion(prev => Math.max(0, prev - 1));
      } else if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedSuggestion(prev => Math.min(suggestions.length - 1, prev + 1));
      } else if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    }
  };

  if (!settings.terminalMode || !isOpen) return null;

  return (
    <div
      className="fixed top-16 left-0 right-0 z-40 glass border-b border-[hsl(var(--border-color))]"
      role="dialog"
      aria-label="Command line"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 py-2 border-b border-[hsl(var(--border-color))]">
          <Terminal className="w-4 h-4 text-[hsl(var(--accent))]" />
          <span className="text-sm font-mono text-[hsl(var(--text-muted))]">Command Line</span>
          <button
            onClick={() => setIsOpen(false)}
            className="ml-auto p-1 rounded hover:bg-[hsl(var(--glass))] transition-colors"
            aria-label="Close command line"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {output.length > 0 && (
          <div
            ref={outputRef}
            className="max-h-40 overflow-y-auto py-2 space-y-1 text-xs font-mono scrollbar-hide"
          >
            {output.map((item, i) => (
              <div key={i} className={prefersReducedMotion ? '' : 'animate-fade-in'}>
                <div className="text-[hsl(var(--text-muted))]">
                  [{item.timestamp}] $ {item.command}
                </div>
                <div className="text-[hsl(var(--text-strong))] whitespace-pre-wrap pl-4">
                  {item.output}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="relative py-3">
          <div className="flex items-center gap-2">
            <span className="text-[hsl(var(--accent))] font-mono">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='type "help" for commands'
              className="flex-1 bg-transparent border-none outline-none text-[hsl(var(--text-strong))] font-mono text-sm placeholder:text-[hsl(var(--text-subtle))]"
            />
          </div>

          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 glass rounded-lg border border-[hsl(var(--border-color))] overflow-hidden">
              {suggestions.map((suggestion, i) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    setSuggestions([]);
                    inputRef.current?.focus();
                  }}
                  className={`w-full px-4 py-2 text-left text-sm font-mono transition-colors ${
                    i === selectedSuggestion
                      ? 'bg-[hsl(var(--accent-orange)_/_0.2)] text-[hsl(var(--accent-orange))]'
                      : 'text-[hsl(var(--text-muted))] hover:bg-[hsl(var(--glass))]'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CommandLineToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ';' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <button
      onClick={() => setIsOpen(prev => !prev)}
      className="glass p-2 rounded-lg hover:bg-[hsl(var(--glass)_/_0.8)] transition-all"
      aria-label="Toggle command line"
      title="Press ; to toggle"
    >
      <Terminal className="w-4 h-4 text-[hsl(var(--accent))]" />
    </button>
  );
};
