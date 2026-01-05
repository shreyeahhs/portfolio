import { motion } from "framer-motion";
import { Github } from "lucide-react";
import { DashboardCard } from "@/components/DashboardCard";
import { PlaceholderCard } from "@/components/PlaceholderCard";

const Dashboards = () => {
    return (
        <div className="min-h-screen pt-24 pb-16 relative z-10">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 font-mono">
                        <span className="text-accent">&gt;</span> dashboard_gallery
                    </h1>
                    <p className="text-lg text-text-muted leading-relaxed">
                        Open-access Power BI dashboards exploring public sector data, education metrics, and economic trends.
                        All dashboards are free to explore, download, and use under the MIT License.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="md:col-span-2 lg:col-span-1"
                    >
                        <DashboardCard
                            title="SEN Pupils Analysis"
                            description="An in-depth study of Special Educational Needs (SEN) in England. 
              
              Reveals structural patterns, inequalities, and PRU risk factors affecting SEN support."
                            tags={["Education", "Inequality", "Public Sector", "Power BI"]}
                            imageSrc="/pbix screenshots/UK-SEN.png"
                            pbixLink="/pbix/UK-SEN-Stats.pbix"
                            githubLink="https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/UK-SEN-analysis"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="md:col-span-1 lg:col-span-1"
                    >
                        <DashboardCard
                            title="Hospital Patient Analytics"
                            description="Exploratory and comparative analysis of hospital patient experience survey data.
                            
                            Focuses on physical/environmental needs and treatment effectiveness across multiple hospitals."
                            tags={["Healthcare", "Patient Experience", "Public Sector", "Power BI"]}
                            imageSrc="/pbix screenshots/Hospital-Stats.png"
                            pbixLink="/pbix/Hospital-Survey.pbix"
                            githubLink="https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/Hospital-analysis"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <DashboardCard
                            title="Sales Performance & Profitability"
                            description="Comprehensive analysis of retail sales and net profit distribution. 
                            
                            Examines market-level performance, seasonal trends, and margin efficiency across product categories."
                            tags={["Sales", "CRM", "Profitability", "Power BI"]}
                            imageSrc="/pbix screenshots/Sales-Stats.png"
                            pbixLink="/pbix/Sales Performance Analysis.pbix"
                            githubLink="https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/Sales-analysis"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                    >
                        <DashboardCard
                            title="Pokemon Statistics Analysis"
                            description="An interactive analysis of Pokémon statistics across multiple generations. Explores type distributions, base stats, and legendary status."
                            tags={["Gaming", "Data Analysis", "Statistics", "Power BI"]}
                            imageSrc="/pbix screenshots/Pokemon-stats.png"
                            pbixLink="/pbix/pokemon.pbix"
                            githubLink="https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/Pokemon-stats"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <DashboardCard
                            title="Anime Ratings & Trends"
                            description="An interactive exploration of anime industry trends, ratings distribution, and genre popularity over time. 
                            
                            Analyzes seasonal shifts and viewer engagement across thousands of titles."
                            tags={["Entertainment", "Trends", "Data Analysis", "Power BI"]}
                            imageSrc="/pbix screenshots/Anime-Stats.png"
                            pbixLink="/pbix/Anime Ratings & Trends Dashboard.pbix"
                            githubLink="https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/Anime-analysis"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.35 }}
                    >
                        <PlaceholderCard
                            description="Sustainable energy consumption tracker monitoring renewable adoption across major cities."
                        />
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-16 pt-8 border-t border-border-color/30 text-center space-y-4"
                >
                    <div className="flex flex-col items-center gap-2">
                        <a
                            href="https://github.com/shreyeahhs/powerbi-projects-showcase"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline font-mono inline-flex items-center gap-2"
                        >
                            <Github className="h-4 w-4" />
                            View all dashboard projects on GitHub
                        </a>
                        <p className="text-text-subtle text-sm max-w-2xl mx-auto">
                            All dashboard designs and logic are provided under the <span className="text-text-strong">MIT License</span>.
                            <br />
                            <span className="italic text-xs opacity-70">Note: Underlying public datasets remain subject to their original source licenses.</span>
                        </p>
                    </div>

                    <p className="text-text-subtle font-mono text-sm pt-4">
                        // additional dashboards are currently in development
                        <br />
                        // check back soon for updates
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboards;
