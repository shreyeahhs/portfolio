import { Button } from "@/components/ui/button";
import { Mail, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface PlaceholderCardProps {
    description: string;
}

export function PlaceholderCard({ description }: PlaceholderCardProps) {
    return (
        <div className="relative overflow-hidden rounded-lg border border-border-color/50 bg-panel/30 p-6 flex flex-col h-full opacity-75 backdrop-blur-sm grayscale transition-all hover:grayscale-0 hover:opacity-100 hover:border-border-color hover:bg-panel p-6 border-dashed">
            <div className="flex items-center gap-2 mb-4 text-text-muted">
                <Clock className="h-5 w-5" />
                <span className="font-mono text-sm font-bold">Coming Soon</span>
            </div>

            <p className="text-text-muted text-sm mb-6 flex-grow">
                {description}
            </p>

            <div className="mt-auto pt-4 border-t border-border-color/20">
                <Button
                    variant="ghost"
                    className="w-full gap-2 text-text-subtle hover:text-accent hover:bg-accent/5"
                    asChild
                >
                    <Link to="/contact">
                        <Mail className="h-4 w-4" />
                        Suggest a Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    );
}
