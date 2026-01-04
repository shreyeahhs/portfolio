import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import WindowCard from "@/components/WindowCard";
import Avatar3D from "@/components/Avatar3D";

const Avatar3DPage = () => {
    return (
        <main className="min-h-screen bg-grid py-20">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="mb-6">
                        <Link to="/" className="text-accent hover:text-accent-glow font-mono text-sm flex items-center gap-2 group w-fit">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>
                    </div>

                    <WindowCard title="avatar_renderer.sh">
                        <div className="space-y-6">
                            <div className="bg-bg/50 rounded-lg overflow-hidden border border-border-color/30">
                                <Avatar3D />
                            </div>

                            <div className="p-4 glass rounded-lg border border-border-color/30">
                                <h2 className="font-mono text-accent text-lg mb-2">&gt; 3D Avatar Inspector</h2>
                                <p className="text-text-muted text-sm leading-relaxed">
                                    This interactive 3D model is rendered using <span className="text-text-strong">React Three Fiber</span> and <span className="text-text-strong">Three.js</span>.
                                    The model is a custom glTF asset with responsive cursor tracking. Move your mouse around to see the avatar react!
                                </p>
                            </div>
                        </div>
                    </WindowCard>
                </motion.div>
            </div>
        </main>
    );
};

export default Avatar3DPage;
