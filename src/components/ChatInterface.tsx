import { useState, useRef, useEffect } from "react";
import { X, Minimize2, Maximize2, Send, Copy, RotateCcw } from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";
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
  pending?: boolean;
  userId?: string;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatInterface = ({ isOpen, onClose }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    // Start with no messages — the initial assistant greeting will be fetched from the backend
  ]);
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [opensOnRight, setOpensOnRight] = useState(true);

  const scrollToBottom = () => {
    // Intentionally left blank to disable automatic scrolling on new messages.
  };

  // Determine which side the chat should open on based on the draggable button position
  useEffect(() => {
    const computeSide = () => {
      try {
        const saved = localStorage.getItem("chatButtonPosition");
        if (!saved) {
          setOpensOnRight(true);
          return;
        }
        const parsed = JSON.parse(saved);
        const vw = document.documentElement.clientWidth;
        setOpensOnRight(parsed.x > vw / 2);
      } catch (e) {
        setOpensOnRight(true);
      }
    };

    computeSide();
    window.addEventListener("resize", computeSide);
    return () => window.removeEventListener("resize", computeSide);
  }, []);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // When the chat is opened and there are no messages yet, request an AI-generated greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // special init token the backend recognises
      sendMessage("__init__");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  

  const handleSend = async () => {
    await sendMessage();
  };


  const sendMessage = async (text?: string) => {
    const messageText = text ?? input;
    if (!messageText.trim()) return;

    const isInit = messageText === "__init__";

    let userMessage: Message | null = null;
    if (!isInit) {
      userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };

      // Add user message and clear composer
      setMessages((prev) => [...prev, userMessage as Message]);
      setInput("");
    }

    // Mark typing for the assistant response
    setIsTyping(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
      // Build a compact history payload for the backend: map local roles to assistant roles
      const historyPayload = (isInit
        ? []
        : [...messages, ...(userMessage ? [userMessage] : [])].map((m) => ({
            role: m.role === "bot" ? "assistant" : "user",
            content: m.content,
          }))
      ).slice(-20); // keep the last 20 messages to limit request size

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, history: historyPayload }),
      });

      if (!res.ok) {
        const text = await res.text();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: `Error: ${res.status} ${text}`,
          timestamp: new Date(),
          error: true,
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
        return;
      }

      const data = await res.json();
      const botText = data?.response ?? JSON.stringify(data);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: botText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: `Network error: ${err?.message ?? String(err)}`,
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
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
            "md:right-8 right-4",
            "md:w-[400px] w-auto",
            "md:h-[640px] h-[70vh]",
            "md:max-h-[72vh] max-h-[85vh]",
            "md:min-h-[440px]",
            "transition-all duration-300"
          )}
          style={{
            bottom: 'calc(32px + 12px + env(safe-area-inset-bottom, 0px))',
            // position the panel on the same side as the draggable button
            ...(opensOnRight ? { right: '24px' } : { left: '24px' }),
            // Ensure the panel doesn't collapse to zero width on small viewports
            minWidth: '320px',
            maxWidth: '90vw',
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
              onClick={onClose}
              aria-label="Close chat"
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>
        </div>

            {/* Messages area */}
            <div 
              ref={messagesEndRef}
                className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 relative chat-messages chat-scrollbar"
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
                    data-message-id={message.id}
                    className={cn(
                      "max-w-[85%] rounded-xl p-2 relative group",
                      message.role === "user"
                        ? "bg-[hsl(var(--accent))]/20 border border-[hsl(var(--accent))]/40 text-text-strong"
                        : "bg-panel/60 text-text-strong",
                      message.error && "border-[hsl(var(--destructive))]/40"
                    )}
                  >
                    <div
                      className="text-sm leading-tight font-mono whitespace-pre-wrap markdown-content"
                      // Render sanitized HTML from Markdown. We sanitize to avoid XSS.
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(marked.parse(message.content || "")),
                      }}
                    />
                    <div className="flex items-center justify-between mt-1 gap-2">
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
                          // Retry: find the previous user message content
                          const idx = messages.findIndex((m) => m.id === message.id);
                          let userContent = "";
                          if (idx > 0) {
                            // look backwards for the nearest user message
                            for (let i = idx - 1; i >= 0; i--) {
                              if (messages[i].role === "user") {
                                userContent = messages[i].content;
                                break;
                              }
                            }
                          }
                          if (userContent) {
                            // sendMessage will append a new user message and attempt again
                            sendMessage(userContent);
                          }
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

              {/* removed stray end marker to avoid layout artifacts */}
            </div>

            {/* Composer (no top border to avoid visible divider) */}
            <div className="p-4 bg-panel/30">
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
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatInterface;
