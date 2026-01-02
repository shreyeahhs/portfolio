import { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

const SKILLS_DATA = {
    "Languages": [
        "Python", "SQL", "TypeScript", "JavaScript", "C", "Java"
    ],
    "Data Science & Analytics": [
        "Exploratory Data Analysis (EDA)", "Statistical Analysis", "Hypothesis Testing",
        "Feature Engineering", "Time Series Analysis", "Survey & Observational Data Analysis",
        "Data Visualisation", "Data Storytelling"
    ],
    "Machine Learning & AI": [
        "Supervised Learning", "Unsupervised Learning", "Classification & Regression",
        "Clustering", "Scikit-learn", "PyTorch (basics)", "TensorFlow / Keras (basics)",
        "Prompt Engineering"
    ],
    "Data Engineering": [
        "Data Modelling (Star / Snowflake schemas)", "ETL / ELT Pipelines", "PostgreSQL",
        "MySQL", "NoSQL fundamentals", "API Data Ingestion", "FastAPI"
    ],
    "BI & Visual Analytics": [
        "Power BI", "DAX", "Power Query", "Dashboard Design", "KPI Design",
        "Interactive Analytics", "Decomposition Trees", "Key Influencers Analysis"
    ],
    "Software, DevOps & Tooling": [
        "Git & GitHub", "React", "REST APIs", "JSON-based data exchange",
        "UI-driven analytics tools", "CI/CD concepts", "Linux", "Environment Management"
    ]
};

type Category = keyof typeof SKILLS_DATA;

const SkillsShowcase = () => {
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // Use a ref to keep track of the timeout so we can clear it properly
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!activeCategory) return;

        // Reset state for new typing session
        setDisplayedText("");
        setIsTyping(true);

        // Clear any existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        const fullText = SKILLS_DATA[activeCategory].join('\n');
        let currentIndex = 0;

        const typeChar = () => {
            if (currentIndex < fullText.length) {
                setDisplayedText(fullText.substring(0, currentIndex + 1));
                currentIndex++;
                // Randomize typing speed slightly for realism (30-70ms)
                const delay = 30 + Math.random() * 40;
                typingTimeoutRef.current = setTimeout(typeChar, delay);
            } else {
                setIsTyping(false);
            }
        };

        // Start typing
        typeChar();

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [activeCategory]);

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Left Column: Navigation */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
                <h2 className="text-xl font-mono font-bold text-text-strong">Skills</h2>
                <div className="grid grid-cols-1 gap-2">
                    {(Object.keys(SKILLS_DATA) as Category[]).map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={cn(
                                "px-4 py-3 text-left font-mono text-sm transition-all duration-200 border rounded-lg",
                                activeCategory === category
                                    ? "bg-accent/10 border-accent text-accent shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                                    : "bg-glass border-border-color/50 text-text-muted hover:bg-white/5 hover:text-text-strong hover:border-text-muted/50"
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Column: Terminal Output */}
            <div className="w-full md:w-2/3 flex flex-col">
                <div
                    className="flex-1 min-h-[300px] bg-black/40 border border-border-color/50 rounded-lg p-6 font-mono text-sm relative overflow-hidden"
                    style={{
                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                    }}
                >
                    {/* Scanline effect overlay (optional, keeping it simple as requested but adding subtleness) */}

                    {activeCategory ? (
                        <div className="relative z-10">
                            <div className="whitespace-pre-wrap leading-relaxed text-text-strong">
                                {displayedText}
                                {/* Blinking cursor */}
                                <span className="inline-block w-2 h-4 bg-accent ml-1 align-middle animate-pulse" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-text-muted/40 italic">
                            Select a category to initialize skill analysis module...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillsShowcase;
