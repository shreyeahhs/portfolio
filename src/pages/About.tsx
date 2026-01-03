import { motion } from "framer-motion";
import { GraduationCap, Download } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const About = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  const education = [
    {
      degree: "MSc Data Science",
      institution: "University of Glasgow",
      location: "Glasgow, UK",
      period: "2025 - 2026",
      details: "Advanced postgraduate training in machine learning, statistical modelling, and scalable data analysis, with strong emphasis on applied problem-solving, programming, and real-world data projects. Includes an independent MSc dissertation focused on delivering actionable insights using modern data science techniques.",
    },
    {
      degree: "BE Artificial Intelligence & Data Science",
      institution: "Sri Dharmasthala Manjunatheshwara Institute of Technology",
      location: "Karnataka, India",
      period: "2021 - 2025",
      details: "Engineering degree focused on building intelligent, data-driven systems, covering machine learning, deep learning, data analytics, and software engineering. Strong hands-on exposure through projects involving model development, data pipelines, and applied AI solutions.",
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
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 terminal-prompt">
              $ whoami --verbose
            </h1>
            <p className="text-text-muted text-lg">
              Data scientist and full-stack developer passionate about building intelligent,
              scalable systems.
            </p>
          </motion.div>

          {/* Bio */}
          <motion.div variants={itemVariants}>
            <GlassCard>
              <h2 className="text-2xl font-bold font-mono mb-4 text-accent">
                About Me
              </h2>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  I'm a graduate student pursuing my MSc in Data Science at the University of Glasgow,
                  with a strong foundation in artificial intelligence and software engineering.
                  My journey in tech spans full-stack development, machine learning, and data engineering.
                </p>
                <p>
                  I've worked on diverse projects ranging from real-time AI interview platforms to
                  geospatial metadata analysis systems. I enjoy solving complex problems with clean,
                  efficient code and scalable architectures.
                </p>
                <p>
                  When I'm not writing code, I'm usually exploring new AI breakthroughs, contributing to
                  open-source tools, or analysing the most random, unnecessary datasets for fun.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Education */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold font-mono mb-6 terminal-prompt flex items-center gap-2">
              <GraduationCap className="text-accent" />
              Education
            </h2>
            <div className="space-y-6">
              {education.map((edu, index) => (
                <GlassCard key={index}>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold font-mono">{edu.degree}</h3>
                    <p className="text-accent font-medium">{edu.institution}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                      <span>{edu.location}</span>
                      <span>•</span>
                      <span>{edu.period}</span>
                    </div>
                    <p className="text-text-muted text-sm pt-2">{edu.details}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>

          {/* Resume Download */}
          <motion.div variants={itemVariants}>
            <a
              href="/Shreyas Gowda Resume.pdf"
              download="Shreyas_Gowda_Resume.pdf"
              className="block w-full md:w-auto"
            >
              <button className="glass px-6 py-3 font-mono text-accent hover:bg-accent-muted transition-all flex items-center gap-2 group w-full md:w-auto justify-center">
                <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                Download Resume (PDF)
              </button>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
};

export default About;
