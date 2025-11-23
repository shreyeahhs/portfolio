import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Copy, Check } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import TrafficLights from './TrafficLights';
import projectsData from '@/data/projects.json';
import internshipsData from '@/data/internships.json';

const quotes = [
  'The only way to do great work is to love what you do. — Steve Jobs',
  'Innovation distinguishes between a leader and a follower. — Steve Jobs',
  'The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt',
  'Data is the new oil. — Clive Humby',
  'In God we trust. All others must bring data. — W. Edwards Deming',
];

const commands = {
  whoami: 'Display bio and current location',
  projects: 'List all projects in a table',
  'open <idx|slug>': 'Navigate to specific project',
  'search <term>': 'Search projects and experience',
  'skills [--top|--all]': 'List skills with usage counts',
  'theme <dark|light|neon>': 'Switch color theme',
  'particles <on|off>': 'Toggle particle background',
  'parallax <on|off>': 'Toggle parallax layers',
  status: 'Show current system status',
  uptime: 'Display session uptime',
  contact: 'Show contact information',
  resume: 'Download CV/resume',
  history: 'Show command history (history -c to clear)',
  'echo "<text>"': 'Print text to console',
  version: 'Show app version',
  fortune: 'Show a random motivational quote',
  'sudo hire shreyas': 'Grant access to contact',
  clear: 'Clear console output',
  help: 'Show available commands',
};

interface Output {
  text: string;
  type: 'normal' | 'success' | 'error';
  timestamp: string;
}

const SESSION_START = Date.now();

export const ASCIIConsole = ({ isOpen: externalOpen, onClose }: { isOpen?: boolean; onClose?: () => void } = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = onClose ? (value: boolean) => { if (!value) onClose(); } : setInternalOpen;
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<Output[]>([]);
  const [showContactCTA, setShowContactCTA] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [userNavigatedMenu, setUserNavigatedMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { settings, updateSetting } = useSettings();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Open with Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // Mark console as seen
      localStorage.setItem('consoleSeen', 'true');
    }
  }, [isOpen]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Autocomplete - only show base commands, no templates
  useEffect(() => {
    if (input) {
      const baseCmd = input.toLowerCase().split(' ')[0];
      const matches = Object.keys(commands).filter(cmd => {
        // Extract base command without arguments
        const cmdBase = cmd.split(' ')[0];
        return cmdBase.toLowerCase().includes(baseCmd);
      }).slice(0, 6);
      
      setSuggestions(matches);
      setSelectedSuggestion(-1); // Don't auto-select
      setUserNavigatedMenu(false); // Reset navigation flag
    } else {
      setSuggestions([]);
      setSelectedSuggestion(-1);
      setUserNavigatedMenu(false);
    }
  }, [input]);

  const addOutput = (text: string, type: Output['type'] = 'normal') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setOutput(prev => [...prev, { text, type, timestamp }]);
  };

  const getUptime = () => {
    const elapsed = Date.now() - SESSION_START;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const scrollToProject = (slug: string) => {
    navigate('/projects');
    setTimeout(() => {
      const element = document.querySelector(`[data-project-slug="${slug}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    const lower = trimmed.toLowerCase();
    
    if (!trimmed) return;

    // Add to history
    setCmdHistory(prev => {
      const updated = [...prev, trimmed];
      const stored = JSON.parse(localStorage.getItem('consoleStats') || '{}');
      localStorage.setItem('consoleStats', JSON.stringify({
        ...stored,
        commandCount: (stored.commandCount || 0) + 1,
        lastCommand: trimmed
      }));
      return updated;
    });
    setHistoryIndex(-1);

    // Parse command and args
    const parts = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const baseCmd = parts[0]?.toLowerCase() || '';
    const args = parts.slice(1);

    switch (baseCmd) {
      case 'whoami':
        addOutput('Shreyas Gowda B — MSc Data Science (UofG). Building AI products with FastAPI + React.', 'normal');
        break;
      
      case 'projects':
        const projectTable = projectsData.map((p, i) => 
          `${String(i + 1).padStart(2)} ${p.slug.padEnd(20)} ${p.year} ${p.summary.substring(0, 50)}...`
        ).join('\n');
        addOutput(`IDX SLUG                 YEAR SUMMARY\n${projectTable}`, 'normal');
        break;
      
      case 'open':
        if (args.length === 0) {
          addOutput('Usage: open <idx|slug>', 'error');
        } else {
          const target = args[0];
          const idx = parseInt(target);
          const project = isNaN(idx) 
            ? projectsData.find(p => p.slug === target)
            : projectsData[idx - 1];
          
          if (project) {
            addOutput(`Opening ${project.title}...`, 'success');
            scrollToProject(project.slug);
            setIsOpen(false);
          } else {
            addOutput(`Project not found: ${target}`, 'error');
          }
        }
        break;
      
      case 'search':
        if (args.length === 0) {
          addOutput('Usage: search <term>', 'error');
        } else {
          const term = args.join(' ').replace(/"/g, '').toLowerCase();
          const projectMatches = projectsData
            .map((p, i) => ({ ...p, idx: i + 1, type: 'project' as const }))
            .filter(p => 
              p.title.toLowerCase().includes(term) || 
              p.summary.toLowerCase().includes(term) ||
              p.tags.some(t => t.toLowerCase().includes(term))
            );
          
          const expMatches = internshipsData
            .map((e, i) => ({ ...e, idx: i + 1, type: 'experience' as const }))
            .filter(e => 
              e.role.toLowerCase().includes(term) || 
              e.company.toLowerCase().includes(term)
            );
          
          const results: Array<typeof projectMatches[0] | typeof expMatches[0]> = [...projectMatches, ...expMatches].slice(0, 5);
          
          if (results.length === 0) {
            addOutput(`No results found for "${term}"`, 'normal');
          } else {
            const resultText = results.map(r => {
              if (r.type === 'project') {
                const proj = r as typeof projectMatches[0];
                return `[${r.type}] ${r.idx}. ${proj.title}`;
              } else {
                const exp = r as typeof expMatches[0];
                return `[${r.type}] ${r.idx}. ${exp.role} @ ${exp.company}`;
              }
            }).join('\n');
            addOutput(`Search results for "${term}":\n${resultText}`, 'normal');
          }
        }
        break;
      
      case 'skills':
        const showAll = args.includes('--all');
        const skillCounts = new Map<string, number>();
        
        projectsData.forEach(p => {
          p.tech.forEach(t => {
            skillCounts.set(t, (skillCounts.get(t) || 0) + 1);
          });
        });
        
        const sorted = Array.from(skillCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, showAll ? undefined : 10);
        
        const skillText = sorted.map(([skill, count]) => `${skill} (${count})`).join(', ');
        addOutput(`Skills: ${skillText}`, 'normal');
        break;
      
      case 'theme':
        if (args.length === 0 || !['dark', 'light', 'neon'].includes(args[0])) {
          addOutput('Usage: theme <dark|light|neon>', 'error');
        } else {
          updateSetting('theme', args[0] as 'dark' | 'light' | 'neon');
          addOutput(`Theme switched to ${args[0]} ✓`, 'success');
        }
        break;
      
      case 'particles':
        if (args.length === 0 || !['on', 'off'].includes(args[0])) {
          addOutput('Usage: particles <on|off>', 'error');
        } else {
          updateSetting('particles', args[0] === 'on');
          addOutput(`Particles ${args[0]} ✓`, 'success');
        }
        break;
      
      case 'parallax':
        if (args.length === 0 || !['on', 'off'].includes(args[0])) {
          addOutput('Usage: parallax <on|off>', 'error');
        } else {
          updateSetting('parallax', args[0] === 'on');
          addOutput(`Parallax ${args[0]} ✓`, 'success');
        }
        break;
      
      case 'status':
        const uptime = getUptime();
        const visitors = Math.floor(Math.random() * 100) + 200;
        const cpu = (Math.random() * 5 + 1).toFixed(1);
        const temp = Math.floor(Math.random() * 10) + 38;
        addOutput(`$ uptime: ${uptime} | visitors: ${visitors} | cpu: ${cpu}% | temp: ${temp}°C`, 'normal');
        break;
      
      case 'uptime':
        addOutput(`Session uptime: ${getUptime()}`, 'normal');
        break;
      
      case 'contact':
        addOutput(
          'Email: gowdashreyas364@gmail.com\nGitHub: https://github.com/shreyeahhs\nLinkedIn: https://www.linkedin.com/in/shreyas-gowda-5316b51b1/\nInstagram: https://www.instagram.com/shreyeahhs/',
          'normal'
        );
        setShowContactCTA(true);
        break;
      
      case 'resume':
        addOutput('Resume dispatched → downloading CV...', 'success');
        // Trigger download logic here
        break;
      
      case 'history':
        if (args[0] === '-c') {
          setCmdHistory([]);
          addOutput('Command history cleared', 'success');
        } else {
          const last10 = cmdHistory.slice(-10);
          if (last10.length === 0) {
            addOutput('No command history', 'normal');
          } else {
            const histText = last10.map((c, i) => `${i + 1}. ${c}`).join('\n');
            addOutput(`Recent commands:\n${histText}`, 'normal');
          }
        }
        break;
      
      case 'echo':
        const text = args.join(' ').replace(/^"|"$/g, '');
        addOutput(text || '', 'normal');
        break;
      
      case 'version':
        addOutput('ShreyasOS v1.0.0 — Built 2024-11-08', 'normal');
        break;
      
      case 'fortune':
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        addOutput(quote, 'normal');
        break;
      
      case 'sudo':
        if (args.join(' ').toLowerCase() === 'hire shreyas') {
          addOutput('Access granted ✅', 'success');
          setShowContactCTA(true);
        } else {
          addOutput(`sudo: ${args.join(' ')}: command not found`, 'error');
        }
        break;
      
      case 'clear':
        setOutput([]);
        setShowContactCTA(false);
        break;
      
      case 'help':
        const helpText = Object.entries(commands)
          .map(([c, desc]) => `  ${c.padEnd(30)} - ${desc}`)
          .join('\n');
        addOutput(`Available commands:\n${helpText}`, 'normal');
        break;
      
      default:
        addOutput(`Command not found: "${baseCmd}". Type "help" for available commands.`, 'error');
    }

    setInput('');
    setSuggestions([]);
  };

  const handleCopyQuote = () => {
    const lastOutput = output[output.length - 1];
    if (lastOutput) {
      navigator.clipboard.writeText(lastOutput.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContactClick = () => {
    setIsOpen(false);
    navigate('/contact');
  };

  if (!settings.asciiConsole || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center"
      onClick={() => setIsOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[hsl(var(--bg)_/_0.9)] backdrop-blur-sm" />

      {/* Console window */}
      <div
        className="relative glass max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="ASCII Console"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border-color))]">
          <div className="flex items-center gap-3">
            <TrafficLights />
            <span className="text-sm font-mono text-[hsl(var(--text-muted))]">$ ascii-console</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-[hsl(var(--glass))] transition-colors"
            aria-label="Close console"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Output area */}
        <div ref={outputRef} className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-sm scrollbar-hide">
          {output.map((item, i) => (
            <div key={i} className={prefersReducedMotion ? '' : 'animate-fade-in'}>
              <div className="text-[hsl(var(--text-muted))] text-xs mb-1">
                [{item.timestamp}]
              </div>
              <div
                className={`whitespace-pre-wrap select-text ${
                  item.type === 'success'
                    ? 'text-[hsl(var(--accent))]'
                    : item.type === 'error'
                    ? 'text-[hsl(var(--traffic-red))]'
                    : 'text-[hsl(var(--text-strong))]'
                }`}
              >
                {item.text}
              </div>
            </div>
          ))}

          {showContactCTA && (
            <div className={prefersReducedMotion ? '' : 'animate-fade-in'}>
              <button
                onClick={handleContactClick}
                className="glass px-4 py-2 rounded-lg hover:bg-[hsl(var(--accent)_/_0.2)] border border-[hsl(var(--accent))] text-[hsl(var(--accent))] transition-all focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
              >
                → Contact Shreyas
              </button>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-[hsl(var(--border-color))] p-4">
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="text-[hsl(var(--accent))] font-mono text-lg">❯</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  // Ignore during IME composition
                  if (e.nativeEvent.isComposing) return;

                  if (e.key === 'Enter') {
                    // Only commit suggestion if user explicitly navigated menu
                    if (suggestions.length > 0 && userNavigatedMenu && selectedSuggestion >= 0) {
                      e.preventDefault();
                      setInput(suggestions[selectedSuggestion]);
                      setSuggestions([]);
                      setUserNavigatedMenu(false);
                    } else {
                      // Always execute typed text
                      executeCommand(input);
                    }
                  } else if (e.key === 'Tab' && suggestions.length > 0) {
                    // Tab commits suggestion
                    e.preventDefault();
                    if (selectedSuggestion >= 0) {
                      setInput(suggestions[selectedSuggestion]);
                    } else if (suggestions.length > 0) {
                      setInput(suggestions[0]);
                    }
                    setSuggestions([]);
                    setUserNavigatedMenu(false);
                  } else if (e.key === 'ArrowRight' && suggestions.length > 0 && selectedSuggestion >= 0) {
                    // Right arrow commits suggestion
                    e.preventDefault();
                    setInput(suggestions[selectedSuggestion]);
                    setSuggestions([]);
                    setUserNavigatedMenu(false);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (suggestions.length > 0) {
                      setUserNavigatedMenu(true);
                      setSelectedSuggestion(prev => {
                        if (prev <= 0) return suggestions.length - 1;
                        return prev - 1;
                      });
                    } else if (cmdHistory.length > 0) {
                      const newIndex = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
                      setHistoryIndex(newIndex);
                      setInput(cmdHistory[newIndex]);
                    }
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (suggestions.length > 0) {
                      setUserNavigatedMenu(true);
                      setSelectedSuggestion(prev => {
                        if (prev < 0) return 0;
                        if (prev >= suggestions.length - 1) return 0;
                        return prev + 1;
                      });
                    } else if (historyIndex >= 0) {
                      const newIndex = historyIndex + 1;
                      if (newIndex >= cmdHistory.length) {
                        setHistoryIndex(-1);
                        setInput('');
                      } else {
                        setHistoryIndex(newIndex);
                        setInput(cmdHistory[newIndex]);
                      }
                    }
                  } else if (e.key === 'Escape') {
                    // Close suggestions
                    if (suggestions.length > 0) {
                      setSuggestions([]);
                      setUserNavigatedMenu(false);
                      setSelectedSuggestion(-1);
                    }
                  }
                }}
                placeholder="Type a command..."
                className="flex-1 bg-transparent border-none outline-none text-[hsl(var(--text-strong))] font-mono placeholder:text-[hsl(var(--text-subtle))]"
              />
              {output.length > 0 && (
                <button
                  onClick={handleCopyQuote}
                  className="p-2 rounded hover:bg-[hsl(var(--glass))] transition-colors"
                  aria-label="Copy last output"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[hsl(var(--accent))]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[hsl(var(--text-muted))]" />
                  )}
                </button>
              )}
            </div>

            {/* Autocomplete dropdown */}
            {suggestions.length > 0 && (
              <div 
                className="absolute bottom-full left-0 right-0 mb-1 rounded-md border overflow-hidden max-h-[240px] overflow-y-auto scrollbar-hide z-[100]"
                style={{
                  background: 'rgba(10, 14, 20, 0.95)',
                  backdropFilter: 'blur(4px)',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                }}
                role="listbox"
              >
                {suggestions.map((suggestion, i) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      setSuggestions([]);
                      setUserNavigatedMenu(false);
                      setSelectedSuggestion(-1);
                      inputRef.current?.focus();
                    }}
                    role="option"
                    aria-selected={i === selectedSuggestion}
                    className={`w-full px-3 py-1.5 text-left font-mono transition-all duration-100 ${
                      i === selectedSuggestion
                        ? 'bg-[rgba(34,197,94,0.15)] text-[#34d399] border-l-2 border-[#22c55e]'
                        : 'text-[rgba(240,240,240,0.92)] hover:bg-[rgba(34,197,94,0.15)] hover:text-[#34d399] hover:border-l-2 hover:border-[#22c55e] border-l-2 border-transparent'
                    }`}
                    style={{
                      fontSize: '13px',
                      lineHeight: '1.6',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {suggestion.split(' ')[0]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
