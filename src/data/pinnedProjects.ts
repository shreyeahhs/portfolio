import { PinnedProject } from "@/components/PinnedProjects";

export const pinnedProjectsData: PinnedProject[] = [
  {
    title: "Edudiagno - AI Interview Platform",
    slug: "edudiagno",
    summary:
      "AI-powered interview and assessment platform built during Shreyas's internship at Technobeez. Features real-time speech recognition, sentiment analysis, and automated scoring. ~80% of the system was developed by Shreyas.",
    tags: ["AI/ML", "Full-Stack", "Real-time"],
    tech: ["Python", "FastAPI", "React", "TypeScript", "WebRTC", "Gemini", "PostgreSQL"],
    links: {
      live: "https://edudiagno.com",
      repo: "",
    },
    theme: "dark",
  },
  {
    title: "NightOut Planner - AI Event Recommendation System",
    slug: "nightout-planner",
    summary:
      "Conversational AI event and venue planner built with React and FastAPI. Includes GPT-powered recommendations, live event data fetching, and a full chat-based planning workflow. Built for the GUTS × SAS Scotland Hackathon.",
    tags: ["AI/ML", "Full-Stack", "Conversational AI"],
    tech: ["React", "TypeScript", "FastAPI", "Python", "Gemini"],
    links: {
      repo: "https://github.com/shreyeahhs/GlasLet-sgow",
    },
    theme: "dark",
  },
  {
    title: "Glasgow Snow Prediction - 35-Year ML Forecast",
    slug: "glasgow-snow-prediction",
    summary:
      "35-year weather and climatology analysis predicting snow likelihood in Glasgow using Logistic Regression, Random Forest, and first-snow date modelling. Includes EDA, climatology insights, and ML evaluation.",
    tags: ["Machine Learning", "Time-Series", "Climate Analysis"],
    tech: ["Python", "Pandas", "Scikit-Learn", "Matplotlib"],
    links: {
      repo: "https://github.com/shreyeahhs/Glasgow-Snow-Prediction",
    },
    theme: "dark",
  },
  {
    title: "Twin Engine - Jet Engine RUL Digital Twin",
    slug: "twin-engine",
    summary:
      "Digital twin interface for turbofan Remaining Useful Life (RUL) prediction using NASA’s CMAPSS dataset. Provides P10/P90 uncertainty bounds and an interactive React dashboard visualizing engine health.",
    tags: ["Digital Twin", "Predictive Maintenance", "AI/ML"],
    tech: ["React", "TypeScript", "FastAPI", "Python", "Scikit-Learn"],
    links: {
      repo: "https://github.com/shreyeahhs/digital-twin-jet-engine",
    },
    theme: "dark",
  },
  {
    title: "JLR EV Launch Delay Impact Simulation",
    slug: "jlr-ev-delay",
    summary:
      "Simulation model analysing the impact of EV launch delays for Jaguar Land Rover. Includes revenue loss forecasting, competitor substitution modelling, and scenario outputs. Built with automotive market logic.",
    tags: ["Simulation", "Automotive", "Data Analysis"],
    tech: ["Python", "Pandas", "Matplotlib", "YAML"],
    links: {
      repo: "https://github.com/shreyeahhs/jlr-launch-delay-analysis",
    },
    theme: "dark",
  },
  {
    title: "YouTube AI Summarizer",
    slug: "youtube-summarizer",
    summary:
      "NLP-based YouTube summarization system that extracts transcripts and generates structured summaries, chapters, and insights using Gemini-based models.",
    tags: ["AI/ML", "NLP"],
    tech: ["Python", "FastAPI", "Gemini API", "LangChain"],
    links: {
      repo: "https://github.com/shreyeahhs/YouTube-Video-Summarizer",
    },
    theme: "dark",
  }
];
