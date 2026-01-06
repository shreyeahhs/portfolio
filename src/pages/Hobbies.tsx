import { motion } from "framer-motion";
import WindowCard from "@/components/WindowCard";
import GlassCard from "@/components/GlassCard";
import { Utensils, Gamepad2, Book, Terminal, GraduationCap, ExternalLink } from "lucide-react";

const hobbies = [
    {
        title: "Cooking",
        icon: <Utensils className="w-6 h-6 text-accent" />,
        description: "Exploring the art of flavors and culinary creativity. From perfecting traditional recipes to experimenting with fusion dishes, I love the process of crafting a great meal.",
        details: ["Global Cuisine", "Baking", "Meal Prep", "Fusion"]
    },
    {
        title: "Vibe Coding",
        icon: <Terminal className="w-6 h-6 text-accent" />,
        description: "Exploring the intersection of AI, creativity, and rapid prototyping. Building tools and experiments where the 'vibe' and intuition drive the development flow. (Fun fact: **this portfolio is currently being vibe coded** haha!)",
        details: ["AI Agents", "Rapid Prototyping", "Creative Coding", "LLMs"]
    },
    {
        title: "Volunteer Tutor",
        icon: <GraduationCap className="w-6 h-6 text-accent" />,
        description: "Proudly volunteering at the **Inclusive Homework Club**, helping students grasp complex concepts in math, programming, and data science. Recognized as **Tutor of the Week** twice for my contributions.",
        details: ["Mentorship", "Public Speaking", "Instructional Design", "Python"],
        link: "https://www.linkedin.com/posts/shreyas-gowda-5316b51b1_supportrefugees-learning-community-activity-7401694866067357697-nNIW?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADFnN7UBgraLm0CVuRG1E71we2Oxvse2dhs"
    },
    {
        title: "Gaming",
        icon: <Gamepad2 className="w-6 h-6 text-accent" />,
        description: "Immersive gaming and strategic play. Currently exploring Teyvat in **Genshin Impact**, re-living the outlaw life in **RDR2**, and eagerly **waiting for GTA VI**. Passionate about complex roleplaying systems and competitive multiplayer.",
        details: ["RPG", "MMORPG", "PvP", "Roleplaying"]
    },
    {
        title: "Reading",
        icon: <Book className="w-6 h-6 text-accent" />,
        description: "Exploring diverse worlds through literature. Currently engrossed in the **Red Queen** series, **Red War**, and the legendary **Shiva Trilogy by Amish Tripathi**. Passionate about sci-fi, epic fantasy, and philosophical non-fiction.",
        details: ["Fantasy", "Mythology", "Sci-Fi", "Philosophy"]
    }
];

const Hobbies = () => {
    return (
        <main className="min-h-screen pt-24 pb-16 relative z-10">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 font-mono">
                        <span className="text-accent">&gt;</span> ./show_hobbies.sh
                    </h1>
                    <p className="text-lg text-text-muted leading-relaxed">
                        When I'm not coding or analyzing data, I'm exploring these interests that keep me creative and balanced.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {hobbies.map((hobby, index) => (
                        <motion.div
                            key={hobby.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <GlassCard hover className="h-full flex flex-col">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2 glass rounded-lg">
                                        {hobby.icon}
                                    </div>
                                    <h3 className="font-mono text-xl font-bold text-text-strong">
                                        {hobby.title}
                                    </h3>
                                </div>
                                <p className="text-text-muted text-sm leading-relaxed mb-6 flex-grow">
                                    {hobby.description.split('**').map((part, i) =>
                                        i % 2 === 1 ? <strong key={i} className="text-text-strong">{part}</strong> : part
                                    )}
                                </p>
                                {hobby.link && (
                                    <a
                                        href={hobby.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-xs font-mono text-accent hover:text-accent-glow mb-4 group/link"
                                    >
                                        <ExternalLink size={14} className="group-hover/link:scale-110 transition-transform" />
                                        View Recognition Post
                                    </a>
                                )}
                                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border-color/20">
                                    {hobby.details.map((detail) => (
                                        <span
                                            key={detail}
                                            className="text-[10px] font-mono text-accent/80 bg-accent/5 px-2 py-0.5 rounded border border-accent/10"
                                        >
                                            {detail}
                                        </span>
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-16 pt-8 border-t border-border-color/30 text-center"
                >
                    <p className="text-text-subtle font-mono text-sm">
                        // hobbies provide the balance needed for deep work
                    </p>
                </motion.div>
            </div>
        </main>
    );
};

export default Hobbies;
