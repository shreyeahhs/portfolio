import { PinnedProject } from "@/components/PinnedProjects";

export const pinnedProjectsData: PinnedProject[] = [
  {
    title: "Edudiagno — AI Interview Platform",
    slug: "edudiagno",
    summary: "Real-time AI-powered interview system with speech recognition, sentiment analysis, and instant feedback. Built with FastAPI backend and React frontend, processing 1000+ interviews monthly.",
    tags: ["AI/ML", "Full-Stack", "Real-time"],
    tech: ["Python", "FastAPI", "React", "TypeScript", "WebRTC", "Transformers"],
    links: {
      repo: "https://github.com/shreyas-gowda",
      live: "https://edudiagno.com",
    },
    theme: "dark",
  },
  {
    title: "GraphGeo Metadata Cleanup",
    slug: "graphgeo-metadata",
    summary: "Geospatial metadata standardization tool processing 10K+ records. Automated data quality checks and normalization pipelines with 99.7% accuracy rate.",
    tags: ["Data Engineering", "Geospatial"],
    tech: ["Python", "Pandas", "PostGIS", "SQL", "ETL"],
    links: {
      case: "https://github.com/shreyas-gowda",
    },
    theme: "dark",
  },
  {
    title: "YouTube AI Summarizer",
    slug: "youtube-summarizer",
    summary: "Extract and summarize YouTube video transcripts using NLP. Generate key insights and chapter breakdowns automatically with GPT-4 powered analysis.",
    tags: ["AI/ML", "NLP"],
    tech: ["Python", "OpenAI API", "LangChain", "FastAPI", "Redis"],
    links: {
      live: "https://yt-summarizer.example.com",
      repo: "https://github.com/shreyas-gowda",
    },
    theme: "dark",
  },
  {
    title: "Buzzlink Marketplace",
    slug: "buzzlink-marketplace",
    summary: "E-commerce platform with real-time inventory management, payment integration, and admin dashboard. Handles 500+ transactions daily with 99.9% uptime.",
    tags: ["Full-Stack", "E-commerce"],
    tech: ["React", "Node.js", "MongoDB", "Stripe", "Redis"],
    links: {
      repo: "https://github.com/shreyas-gowda",
    },
    theme: "dark",
  },
  {
    title: "Smart Campus Navigation",
    slug: "campus-nav",
    summary: "Indoor navigation system using Bluetooth beacons and pathfinding algorithms for university campus. Serves 5000+ students with sub-meter accuracy.",
    tags: ["Mobile", "IoT"],
    tech: ["React Native", "BLE", "Firebase", "A* Algorithm"],
    links: {
      case: "https://github.com/shreyas-gowda",
    },
    theme: "dark",
  },
  {
    title: "Expense Tracker Pro",
    slug: "expense-tracker",
    summary: "Personal finance management app with budget forecasting, category analysis, and export capabilities. ML-powered spending predictions with 85% accuracy.",
    tags: ["Full-Stack", "Finance", "ML"],
    tech: ["Vue.js", "Python", "PostgreSQL", "Chart.js", "scikit-learn"],
    links: {
      live: "https://expense-tracker.example.com",
      repo: "https://github.com/shreyas-gowda",
    },
    theme: "dark",
  },
];
