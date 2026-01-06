import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Github, Search } from "lucide-react";
import { DashboardCard } from "@/components/DashboardCard";
import { PlaceholderCard } from "@/components/PlaceholderCard";

interface Dashboard {
    title: string;
    description: string;
    tags: string[];
    imageSrc: string;
    pbixLink: string;
    githubLink: string;
}

const dashboardsData: Dashboard[] = [
    {
        title: "SEN Pupils Analysis",
        description: "An in-depth study of Special Educational Needs (SEN) in England. \n\nReveals structural patterns, inequalities, and PRU risk factors affecting SEN support.",
        tags: ["Education", "Inequality", "Public Sector"],
        imageSrc: "/pbix screenshots/UK-SEN.png",
        pbixLink: "/pbix/UK-SEN-Stats.pbix",
        githubLink: "https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/UK-SEN-analysis"
    },
    {
        title: "Hospital Patient Analytics",
        description: "Exploratory and comparative analysis of hospital patient experience survey data.\n\nFocuses on physical/environmental needs and treatment effectiveness across multiple hospitals.",
        tags: ["Healthcare", "Patient Experience", "Public Sector"],
        imageSrc: "/pbix screenshots/Hospital-Stats.png",
        pbixLink: "/pbix/Hospital-Survey.pbix",
        githubLink: "https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/Hospital-analysis"
    },
    {
        title: "Sales Performance & Profitability",
        description: "Comprehensive analysis of retail sales and net profit distribution. \n\nExamines market-level performance, seasonal trends, and margin efficiency across product categories.",
        tags: ["Sales", "CRM", "Profitability"],
        imageSrc: "/pbix screenshots/Sales-Stats.png",
        pbixLink: "/pbix/Sales Performance Analysis.pbix",
        githubLink: "https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/Sales-analysis"
    },
    {
        title: "Pokemon Statistics Analysis",
        description: "An interactive analysis of Pokémon statistics across multiple generations. Explores type distributions, base stats, and legendary status.",
        tags: ["Gaming", "Statistics"],
        imageSrc: "/pbix screenshots/Pokemon-stats.png",
        pbixLink: "/pbix/pokemon.pbix",
        githubLink: "https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/Pokemon-stats"
    },
    {
        title: "Anime Ratings & Trends",
        description: "An interactive exploration of anime industry trends, ratings distribution, and genre popularity over time. \n\nAnalyzes seasonal shifts and viewer engagement across thousands of titles.",
        tags: ["Entertainment", "Trends"],
        imageSrc: "/pbix screenshots/Anime-Stats.png",
        pbixLink: "/pbix/Anime Ratings & Trends Dashboard.pbix",
        githubLink: "https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/Anime-analysis"
    },
    {
        title: "Harry Potter Statistics Analysis",
        description: "A comprehensive analytical study of the Harry Potter film series. \n\nUncovers patterns in financial performance (budget vs profit), narrative structure (chapters), and character prominence through dialogue distribution.",
        tags: ["Entertainment", "Financial analysis", "Narrative Analytics"],
        imageSrc: "/pbix screenshots/Harry-Stats.png",
        pbixLink: "/pbix/Harry Porter.pbix",
        githubLink: "https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/HarryPotter-stats"
    }
];

const Dashboards = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        dashboardsData.forEach((dashboard) => {
            dashboard.tags.forEach((tag) => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, []);

    const filteredDashboards = useMemo(() => {
        return dashboardsData.filter((dashboard) => {
            const matchesSearch =
                dashboard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dashboard.description.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesTag = !selectedTag || dashboard.tags.includes(selectedTag);

            return matchesSearch && matchesTag;
        });
    }, [searchTerm, selectedTag]);

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
                    <p className="text-lg text-text-muted leading-relaxed mb-8">
                        Open-access Power BI dashboards exploring public sector data, education metrics, and economic trends.
                        All dashboards are free to explore, download, and use under the MIT License.
                    </p>

                    {/* Search and Filter */}
                    <div className="space-y-4">
                        <div className="glass p-4 flex items-center gap-3">
                            <Search className="text-accent" size={20} />
                            <input
                                type="text"
                                placeholder="Search dashboards..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-text-strong placeholder:text-text-subtle font-mono"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedTag(null)}
                                className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${!selectedTag
                                    ? "bg-accent text-bg"
                                    : "bg-panel border border-border-color text-text-muted hover:text-text-strong"
                                    }`}
                            >
                                All
                            </button>
                            {allTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${selectedTag === tag
                                        ? "bg-accent text-bg"
                                        : "bg-panel border border-border-color text-text-muted hover:text-text-strong"
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDashboards.map((dashboard, index) => (
                        <motion.div
                            key={dashboard.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                        >
                            <DashboardCard
                                title={dashboard.title}
                                description={dashboard.description}
                                tags={dashboard.tags}
                                imageSrc={dashboard.imageSrc}
                                pbixLink={dashboard.pbixLink}
                                githubLink={dashboard.githubLink}
                            />
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: filteredDashboards.length * 0.05 }}
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
