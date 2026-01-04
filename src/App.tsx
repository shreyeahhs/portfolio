import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { SettingsProvider } from "./contexts/SettingsContext";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";
import { CommandLine } from "./components/CommandLine";
import { ParticleBackground } from "./components/ParticleBackground";
import { BootAnimation } from "./components/BootAnimation";
import { ParallaxLayers } from "./components/ParallaxLayers";
import { SystemStatusFooter } from "./components/SystemStatusFooter";
import { ASCIIConsole } from "./components/ASCIIConsole";
import { ConsoleDiscovery } from "./components/ConsoleDiscovery";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Experience from "./pages/Experience";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Dashboards from "./pages/Dashboards";
import Avatar3DPage from "./pages/Avatar3DPage";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};

const AppContent = () => {
  const [consoleOpen, setConsoleOpen] = useState(false);

  // Global keyboard shortcuts for console
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || e.key === '~') &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setConsoleOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <ScrollToTop />
      <BootAnimation />
      <ParallaxLayers />
      <ParticleBackground />
      <NavBar />
      <NavBar />
      <div className="hidden md:block">
        <CommandLine />
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/internships" element={<Experience />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboards" element={<Dashboards />} />
        <Route path="/avatar-3d" element={<Avatar3DPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <div className="hidden md:block">
        <SystemStatusFooter />
      </div>
      <ChatBot />
      <ASCIIConsole isOpen={consoleOpen} onClose={() => setConsoleOpen(false)} />
      <div className="hidden md:block">
        <ConsoleDiscovery onOpenConsole={() => setConsoleOpen(true)} />
      </div>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
