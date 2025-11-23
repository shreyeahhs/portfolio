import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Mail, FileText, Github, Linkedin, Instagram, Send, Copy, Check } from "lucide-react";
import WindowCard from "@/components/WindowCard";
import GlassCard from "@/components/GlassCard";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { toast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText("gowdashreyas364@gmail.com");
    setEmailCopied(true);
    toast({
      title: "Email copied!",
      description: "Email address copied to clipboard.",
    });
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const API_BASE = (import.meta as any).env.VITE_API_BASE || "http://127.0.0.1:8000";
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        toast({
          title: "Send failed",
          description: `Server error: ${res.status} ${text}`,
          variant: "destructive",
        });
        return;
      }

      const data = await res.json();
      if (data?.ok) {
        toast({
          title: "Message sent!",
          description: "Thanks for reaching out. I'll get back to you soon.",
        });
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast({
          title: "Send failed",
          description: "Server responded but did not confirm delivery.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Network error",
        description: err?.message || String(err),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/shreyeahhs",
      icon: Github,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/shreyas-gowda-5316b51b1/",
      icon: Linkedin,
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/shreyeahhs/",
      icon: Instagram,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.5 },
    },
  };

  return (
    <main className="min-h-screen bg-grid pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 terminal-prompt">
            $ echo "Get in touch"
          </h1>
          <p className="text-text-muted text-lg">
            Let's discuss your project or just say hello.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-8"
        >
          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <WindowCard title="contact-info.sh">
              <div className="space-y-6">
                <div>
                  <p className="terminal-prompt text-sm mb-3">$ location --current</p>
                  <div className="flex items-center gap-3 text-text-muted">
                    <MapPin className="text-accent" size={20} />
                    <span>Glasgow, United Kingdom</span>
                  </div>
                </div>

                <div>
                  <p className="terminal-prompt text-sm mb-3">$ contact --email</p>
                  <div className="flex items-center gap-3">
                    <Mail className="text-accent" size={20} />
                    <span className="text-text-muted flex-1">gowdashreyas364@gmail.com</span>
                    <button
                      onClick={handleCopyEmail}
                      className="p-2 hover:bg-accent-muted rounded transition-colors"
                      aria-label="Copy email"
                    >
                      {emailCopied ? (
                        <Check className="text-accent" size={16} />
                      ) : (
                        <Copy className="text-text-muted hover:text-accent" size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="terminal-prompt text-sm mb-3">$ cat resume.pdf</p>
                  <button className="glass px-4 py-2 font-mono text-accent hover:bg-accent-muted transition-all flex items-center gap-2 group w-full justify-center">
                    <FileText size={18} />
                    Download Resume
                  </button>
                </div>

                <div>
                  <p className="terminal-prompt text-sm mb-3">$ ls ./social-links</p>
                  <div className="grid gap-3">
                    {socialLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass p-3 flex items-center gap-3 hover:bg-accent-muted transition-all group"
                      >
                        <link.icon className="text-accent" size={20} />
                        <span className="text-text-muted group-hover:text-text-strong transition-colors">
                          {link.name}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </WindowCard>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={itemVariants}>
            <GlassCard>
              <h2 className="text-2xl font-bold font-mono mb-6 terminal-prompt">
                $ send-message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-mono text-text-muted mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-panel border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-strong"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-mono text-text-muted mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-panel border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-strong"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-mono text-text-muted mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 bg-panel border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-strong resize-none"
                    placeholder="Your message..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full glass px-6 py-3 font-mono text-accent hover:bg-accent-muted transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
};

export default Contact;
