import { motion } from "framer-motion";
import { Briefcase, MapPin, Calendar } from "lucide-react";
import Badge from "@/components/Badge";
import internshipsData from "@/data/internships.json";
import { Internship } from "@/types/Internship";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const Internships = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

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
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.5 },
    },
  };

  return (
    <main className="min-h-screen bg-grid pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 terminal-prompt">
            $ grep -r "experience" ./career
          </h1>
          <p className="text-text-muted text-lg mb-12">
            Professional experience across data science, AI development, and full-stack engineering.
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-accent-muted" aria-hidden="true" />

          <div className="space-y-12">
            {internshipsData.map((internship: Internship, index) => (
              <motion.div
                key={`${internship.company}-${index}`}
                variants={itemVariants}
                className="relative pl-20"
              >
                {/* Timeline node */}
                <div className="absolute left-6 top-2 w-5 h-5 rounded-full bg-accent border-4 border-bg shadow-[0_0_12px_hsl(var(--accent-glow))]" />

                <div className="glass p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold font-mono mb-1">
                      {internship.role}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <Briefcase size={14} className="text-accent" />
                        {internship.company}
                      </span>
                      {internship.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-accent" />
                          {internship.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-accent" />
                        {internship.start} — {internship.end}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {internship.tools.map((tool) => (
                      <Badge key={tool} variant="default">
                        {tool}
                      </Badge>
                    ))}
                  </div>

                  <ul className="space-y-2 text-text-muted text-sm">
                    {internship.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-accent mt-1.5">▹</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Internships;
