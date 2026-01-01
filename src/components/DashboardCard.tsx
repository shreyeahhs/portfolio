import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Download, Github, LayoutDashboard } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface DashboardCardProps {
  title: string;
  description: string;
  tags: string[];
  imageSrc?: string;
  pbixLink?: string;
  githubLink?: string;
}

export function DashboardCard({
  title,
  description,
  tags,
  imageSrc,
  pbixLink,
  githubLink,
}: DashboardCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border-color bg-panel transition-all hover:border-accent hover:shadow-lg flex flex-col h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-mono text-xl font-bold text-text-strong group-hover:text-accent transition-colors">
              {title}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-accent/10 text-accent border-accent/20"
                >
                  {tag}
                </Badge>
              ))}
              <Badge variant="outline" className="border-traffic-green/30 text-traffic-green">
                Available Now
              </Badge>
            </div>
          </div>
          <LayoutDashboard className="h-6 w-6 text-text-muted group-hover:text-accent transition-colors" />
        </div>

        {imageSrc && (
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative w-full aspect-video overflow-hidden rounded-md border border-border-color/50 mb-6 cursor-pointer group/image">
                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors z-10 flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                  <span className="text-white font-mono text-xs bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Click to expand</span>
                </div>
                <img
                  src={imageSrc}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto bg-transparent border-none p-0 shadow-none">
              <img
                src={imageSrc}
                alt={title}
                className="w-full h-full object-contain rounded-lg shadow-2xl"
              />
            </DialogContent>
          </Dialog>
        )}

        <p className="flex-grow text-text-muted mb-6 text-sm leading-relaxed whitespace-pre-line">
          {description}
        </p>

        <div className="flex gap-2 mt-auto pt-4 border-t border-border-color/20">
          {pbixLink && (
            <Button
              className="flex-1 gap-2 bg-accent hover:bg-accent-dark text-white font-mono"
              onClick={() => window.open(pbixLink, '_blank')}
            >
              <Download className="h-4 w-4" />
              Download .pbix
            </Button>
          )}
          {githubLink && (
            <Button
              variant="outline"
              className="flex-1 gap-2 border-border-color hover:border-accent hover:text-accent hover:bg-accent/5"
              onClick={() => window.open(githubLink, '_blank')}
            >
              <Github className="h-4 w-4" />
              View Project
            </Button>
          )}
        </div>

        <Badge
          variant="secondary"
          className="mt-6 w-fit text-[10px] text-text-subtle bg-panel border-border-color"
        >
          MIT License • Free to Use
        </Badge>
      </div>
    </div>
  );
}
