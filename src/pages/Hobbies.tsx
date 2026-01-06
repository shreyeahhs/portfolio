import { motion } from "framer-motion";
import WindowCard from "@/components/WindowCard";
import GlassCard from "@/components/GlassCard";
import { Camera, Gamepad2, Book, Music, Terminal, GraduationCap } from "lucide-react";

const hobbies = [
    {
        title: "Mobile Photography",
        icon: <Camera className="w-6 h-6 text-accent" />,
        description: "Capturing cinematic moments and everyday perspectives using just a smartphone. Exploring the limits of mobile sensors and computational photography.",
        details: ["Street", "Landscape", "Mobile Editing", "Composition"]
    },
    {
        title: "Vibe Coding",
        icon: <Terminal className="w-6 h-6 text-accent" />,
        description: "Exploring the intersection of AI, creativity, and rapid prototyping. Building tools and experiments where the 'vibe' and intuition drive the development flow.",
        details: ["AI Agents", "Rapid Prototyping", "Creative Coding", "LLMs"]
    },
    {
        title: "Volunteer Tutor",
        icon: <GraduationCap className="w-6 h-6 text-accent" />,
        description: "Sharing knowledge and empowering others through education. Helping students grasp complex concepts in math, programming, and data science.",
        details: ["Mentorship", "Public Speaking", "Instructional Design", "Python"]
    },
    {
        title: "Gaming",
        icon: <Gamepad2 className="w-6 h-6 text-accent" />,
        description: "Strategic and immersive gaming experiences. Enjoying RPGs, puzzle-solving, and competitive play.",
        details: ["Strategy", "RPGs", "Puzzle", "Esports"]
    },
    {
        title: "Reading",
        icon: <Book className="w-6 h-6 text-accent" />,
        description: "Exploring new worlds and ideas through literature. Focus on science fiction, non-fiction, and philosophy.",
        details: ["Sci-Fi", "Philosophy", "Tech Blogs", "Biographies"]
    },
    {
        title: "Music",
        icon: <Music className="w-6 h-6 text-accent" />,
        description: "Appreciating diverse genres and the art of sound. Occasional experimenting with digital music production.",
        details: ["Ambient", "Lo-fi", "Classical", "Digital Synth"]
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
                                    {hobby.description}
                                </p>
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
