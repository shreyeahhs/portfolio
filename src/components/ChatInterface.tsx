import { useState, useRef, useEffect } from "react";
import { X, Minimize2, Maximize2, Send, Copy, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import TrafficLights from "./TrafficLights";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  error?: boolean;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatInterface = ({ isOpen, onClose }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content: "Hello! I'm your assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: "Thanks for your message! This is a demo response.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleClear = () => {
    setMessages([
      {
        id: "1",
        role: "bot",
        content: "Chat cleared. How can I help you?",
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Chat assistant"
        initial={
          prefersReducedMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.95, y: 20 }
        }
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={
          prefersReducedMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.95, y: 20 }
        }
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: prefersReducedMotion ? 0.1 : 0.2,
        }}
        className={cn(
          "fixed z-50 glass overflow-hidden shadow-2xl flex flex-col",
          "md:right-8 right-4 left-4",
          "md:w-[400px] w-auto",
          isMinimized ? "md:h-[72px] h-[64px]" : "md:h-[640px] h-[70vh]",
          "md:max-h-[72vh] max-h-[85vh]",
          "md:min-h-[440px]",
          "transition-all duration-300"
        )}
        style={{
          bottom: 'calc(32px + 12px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Header with traffic lights */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border-color))] bg-panel/40">
          <div className="flex items-center gap-3">
            <TrafficLights />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] animate-pulse" />
              <span className="text-sm font-mono text-text-strong">Assistant</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              aria-label={isMinimized ? "Maximize" : "Minimize"}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-text-muted" />
              ) : (
                <Minimize2 className="w-4 h-4 text-text-muted" />
              )}
            </button>
            <button
              onClick={onClose}
              aria-label="Close chat"
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages area */}
            <div 
              className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 relative"
              style={{
                paddingBottom: 'calc(32px + 12px + env(safe-area-inset-bottom, 0px))',
              }}
            >
              {/* Removed sticky top gradient (caused visible bar) */}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl p-3 relative group",
                      message.role === "user"
                        ? "bg-[hsl(var(--accent))]/20 border border-[hsl(var(--accent))]/40 text-text-strong"
                        : "bg-panel/60 text-text-strong",
                      message.error && "border-[hsl(var(--destructive))]/40"
                    )}
                  >
                    <p className="text-sm leading-relaxed font-mono whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span className="text-xs text-text-subtle">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <button
                        onClick={() => handleCopy(message.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                        aria-label="Copy message"
                      >
                        <Copy className="w-3 h-3 text-text-muted" />
                      </button>
                    </div>
                    {message.error && (
                      <button
                        className="absolute -bottom-6 right-0 text-xs text-[hsl(var(--accent))] hover:underline flex items-center gap-1"
                        onClick={() => {
                          /* Retry logic */
                        }}
                      >
                        <RotateCcw className="w-3 h-3" />
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="bg-panel/60 border border-white/10 rounded-xl p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-text-muted animate-pulse" />
                      <div
                        className="w-2 h-2 rounded-full bg-text-muted animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full bg-text-muted animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="p-4 border-t border-[hsl(var(--border-color))] bg-panel/30">
              <div className="flex items-center gap-2.5">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message... (Shift+Enter for newline)"
                  rows={1}
                  className="flex-1 resize-none outline-none"
                  style={{
                    display: 'block',
                    width: '100%',
                    minHeight: '44px',
                    maxHeight: '160px',
                    lineHeight: '1.5',
                    padding: '10px 12px',
                    font: '14px/1.5 "Inter", system-ui, sans-serif',
                    color: 'rgba(230, 230, 230, 0.92)',
                    background: 'rgba(10, 14, 20, 0.5)',
                    border: '1.5px solid rgba(52, 211, 153, 0.65)',
                    borderRadius: '14px',
                    verticalAlign: 'middle',
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    width: '44px',
                    height: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    background: '#16a34a',
                    color: '#0b0f14',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.35)',
                  }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatInterface;
