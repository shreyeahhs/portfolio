/**
 * Every fact on this site lives here. Sourced from CONTENT.md.
 * Nothing in this file is invented. Figures come from real published records.
 *
 * Voice: Shreyas, first person, plain and relaxed. Short sentences, contractions,
 * no slogans, no neat three-part lists, no wrapping every paragraph up with a moral.
 */

export const profile = {
  name: "Shreyas",
  /** Shown in the hero only. Everywhere else he is just Shreyas. */
  fullName: "Shreyas Gowda Bettegowda",
  role: "Administrator, Centre for Data Science and AI",
  roleFrom: "Oct 2026",
  org: "University of Glasgow",
  city: "Glasgow",
  email: "gowdashreyas364@gmail.com",
  avatar: "/avatar.png",
  headline: "I don’t even know why I have a portfolio website at this point.",
  headlineAside: "Oh well.",
  standfirst:
    "I work at the Centre for Data Science and AI at the University of Glasgow, where I also did my MSc. This is where I keep the stuff I’ve made.",
};

/**
 * The rail across the foot of the first screen. Six facts, set in mono, that
 * between them say who he is before you have scrolled at all. Each one is
 * repeated in full somewhere below; this is the index, not the content.
 */
export const heroFacts = [
  "Glasgow",
  "Centre for Data Science and AI",
  "MSc Data Science",
  "Prompt Corpus",
  "Vele",
  "Juggle",
  "1:64 scale collector",
];

/** The at-a-glance list next to the bio. */
export const glance = [
  { key: "Based in", value: "Glasgow" },
  { key: "Work", value: "Centre for Data Science and AI, University of Glasgow" },
  { key: "Studied", value: "MSc Data Science at Glasgow, BE in AI and Data Science in Karnataka" },
  { key: "Writing", value: "Prompt Corpus, a free course on prompting" },
  { key: "Building", value: "Vele, a calendar that takes instructions, and Juggle, a gateway for AI keys" },
  { key: "Collecting", value: "Hot Wheels" },
];

export const bio = [
  "I did my engineering degree in AI and data science in Karnataka, then moved to Glasgow for my MSc and stayed. These days I work at the university’s Centre for Data Science and AI, on the admin side.",
  "Before this, most of my jobs were about data. I analysed carbon footprint data at Publicis Sapient, cleaned up map data at GraphGeo, and spent most of 2025 building the backend for an AI interview platform.",
  "Outside work I’m building Vele, a calendar you can talk to, and Juggle, a gateway that juggles my AI keys. I also write about how AI models actually work, and buy more Hot Wheels than I have space for.",
];

export const links = {
  corpus: "https://prompt-corpus.vercel.app",
  /**
   * Vele goes live before this site does. Put its URL here when it is up and the
   * panel swaps its "launching soon" line for a real button. Nothing else to change.
   */
  vele: "",
  juggle: "https://github.com/shreyeahhs/juggle",
  /**
   * His own deployment. The landing page is public and explains the thing, but the
   * dashboard behind it is single-owner and password-gated: there is no sign-up and
   * no demo account. So this is somewhere to read, not something a visitor can
   * drive, and the link is labelled accordingly.
   */
  juggleLive: "https://juggle.onrender.com",
  github: "https://github.com/shreyeahhs",
  linkedin: "https://www.linkedin.com/in/shreyas-gowda-5316b51b1/",
  instagram: "https://www.instagram.com/shreyeahhs/",
  powerbi: "https://github.com/shreyeahhs/powerbi-projects-showcase",
};

/* --------------------------------------------------------------------------
   Making: the argument, and the two things that carry it
   -------------------------------------------------------------------------- */

export const argument = {
  claim: "Better prompts, not bigger models.",
  body: [
    "When an AI model gives a bad answer, most people’s first move is to try a bigger one. That costs more money and more energy, and a lot of the time it barely helps.",
    "Usually the problem is the question. If you tell the model who the answer is for, what format you want and what to avoid, an ordinary model will beat a bigger one that got a vague prompt. That’s why I think getting better at prompting is the more sustainable way to use AI.",
  ],
};

export const corpus = {
  title: "Prompt Corpus",
  url: links.corpus,
  description:
    "A free course I wrote on prompt engineering. It starts with how these models actually work, so the techniques make sense instead of feeling like tricks you have to memorise.",
  aside:
    "No videos, no prompt packs to buy. Just the lessons, written out in full, and where every claim came from.",
  stats: [
    { value: "60", label: "lessons" },
    { value: "98", label: "sources cited" },
    { value: "6h", label: "of reading" },
  ],
  tracks: [
    { id: "00", name: "Foundations", count: 12, note: "How language models work, and why prompting works at all." },
    { id: "01", name: "Beginner", count: 8, note: "What a good prompt looks like, and the mistakes almost everyone makes." },
    { id: "02", name: "Intermediate", count: 7, note: "Roles, system messages, step-by-step reasoning and structured output." },
    { id: "03", name: "Advanced", count: 9, note: "Chaining prompts, agents and tools, and defending against prompt injection." },
    { id: "04", name: "Model Playbooks", count: 6, note: "What’s actually different between Claude, GPT, Gemini and the rest." },
    { id: "05", name: "For Students", count: 7, note: "Using AI for coursework without letting it do your thinking." },
    { id: "06", name: "At Work", count: 5, note: "Practical guides for writing, code, analysis and research." },
    { id: "07", name: "Cost of a Prompt", count: 6, note: "What a prompt really costs in tokens, money and energy." },
  ],
};

/**
 * The other one. Vele is a calendar with an assistant sitting in the margin, and
 * it is the argument above running as software: the model reads the sentence,
 * a plain scheduling engine works out every actual time.
 */
export const vele = {
  title: "Vele",
  url: links.vele,
  description:
    "You write it a sentence — “lunch with mom, 1 to 3 on Saturday” — and it pencils the event in. Anything with other people in it, or a clash, or a repeat, stays in pencil until you say yes.",
  aside:
    "The model only reads the sentence. Every actual time comes from a plain scheduling engine that knows my hours, my buffers and my lunch. It is the argument above, in code.",
  stats: [
    { value: "5", label: "calendar views" },
    { value: "2", label: "ways to ask" },
    { value: "0", label: "guessed times" },
  ],
  /** What the engine weighs before it offers you anything. */
  weighs: [
    "Working hours",
    "Buffers",
    "Lunch",
    "Focus time",
    "Notice",
    "Daily limits",
    "Time zones",
  ],
  /**
   * A made-up week for the miniature on the portfolio: seven days, eight working
   * hours each. 0 is free, 1 to 6 pick one of Vele's calendar inks, and 9 is an
   * event pencilled in and still waiting to be confirmed. Runs of the same digit
   * are one event. Sample data, and the caption says so.
   */
  week: ["11000220", "01110030", "00110220", "11003330", "01100222", "00009900", "00000000"],
  weekNote: "A sample week. The dashed one is pencilled in, waiting on a yes.",
  /** Shown in place of the button until `links.vele` has a URL in it. */
  status: "Launching soon",
  /** Vele's own line for itself, from its README. */
  motto: "Your diary, where Vele writes in pencil and only you turn it into ink.",
  /** Heading for its section here. Its own claim, in his voice. */
  claim: "A calendar that takes instructions.",
};

/**
 * The third of the things he keeps working on. Juggle is a personal tool he open
 * sourced: a self-hosted gateway that holds your own provider keys and cycles
 * through them so a rate limit never reaches your application.
 *
 * Everything here is checked against the repo or against Juggle's own copy. No
 * latency figures, no request volumes, no users — it has none of those, and
 * saying otherwise would be a lie. The stats are deliberately structural rather
 * than a line or test count: the published repo changes, and a number that rots
 * is worse than no number once there is a link sitting next to it. Every number
 * here is one the brief itself gave: a single endpoint, and keys never stored.
 */
export const juggle = {
  title: "Juggle",
  url: links.juggle,
  live: links.juggleLive,
  claim: "A gateway that juggles your API keys.",
  description:
    "Free-tier AI keys are rate limited, so you end up holding a handful of them and swapping between them by hand. Juggle makes that a piece of infrastructure instead of a chore: your keys go in its environment, your app points at one OpenAI-compatible endpoint, and nothing else changes.",
  aside:
    "It moves to a different key on every request rather than waiting for one to fail, so a throttled key is usually out of the way before it matters. Your app gets one clean response instead of a 429.",
  stats: [
    { value: "1", label: "endpoint" },
    { value: "0", label: "keys stored" },
    { value: "MIT", label: "licence" },
  ],
  stack: ["Next.js 16", "React 19", "Drizzle", "Postgres", "Zod 4"],
  /** Gemini is the only adapter today, and the page says so rather than implying more. */
  providers: "Gemini today. A provider is an adapter behind one interface, so the rest is mostly error mapping.",
};

/* --------------------------------------------------------------------------
   Work
   -------------------------------------------------------------------------- */

export type Project = {
  title: string;
  year: number;
  blurb: string;
  stack: string[];
  repo: string;
  live?: string;
  image?: string;
};

export const projects: Project[] = [
  {
    title: "Living Ecosystem Simulator",
    year: 2026,
    blurb:
      "A small wildlife sim that runs in the browser. Grass grows, rabbits eat it, foxes eat the rabbits and hawks circle overhead. Nothing is scripted, so sometimes it balances out and sometimes everything dies.",
    stack: ["TypeScript", "Vite", "Canvas 2D"],
    repo: "https://github.com/shreyeahhs/Living-Ecosystem-Simulator",
    live: "https://living-ecosystem-simulator.onrender.com/",
    image: "/project-previews/living-ecosystem-simulator.png",
  },
  {
    title: "Twin Engine",
    year: 2024,
    blurb:
      "Predicts how long a jet engine has left before it needs work, using NASA’s turbofan dataset. It gives you a range rather than a single guess.",
    stack: ["React", "FastAPI", "Scikit-Learn"],
    repo: "https://github.com/shreyeahhs/digital-twin-jet-engine",
  },
  {
    title: "Glasgow Snow Prediction",
    year: 2024,
    blurb:
      "Will it snow in Glasgow this winter, and when? I pulled 35 years of weather data to find out when the first snow usually turns up, then trained a couple of models to predict it.",
    stack: ["Python", "Pandas", "Scikit-Learn"],
    repo: "https://github.com/shreyeahhs/Glasgow-Snow-Prediction",
  },
  {
    title: "NightOut Planner",
    year: 2024,
    blurb:
      "A chatbot that suggests events and places for a night out, pulling in live listings. Built over a weekend at the GUTS and SAS Scotland hackathon.",
    stack: ["React", "FastAPI", "Gemini"],
    repo: "https://github.com/shreyeahhs/GlasLet-sgow",
  },
  {
    title: "JLR EV Launch Delay",
    year: 2025,
    blurb:
      "What happens to Jaguar Land Rover if an electric car launches late? A model of the lost revenue and the customers who go elsewhere, built on made-up but realistic data.",
    stack: ["Python", "Pandas", "YAML"],
    repo: "https://github.com/shreyeahhs/jlr-launch-delay-analysis",
  },
  {
    title: "YouTube Summarizer",
    year: 2024,
    blurb:
      "Give it a long YouTube video and it gives you back a proper summary with chapters, so you don’t have to sit through the whole thing.",
    stack: ["Python", "FastAPI", "LangChain"],
    repo: "https://github.com/shreyeahhs/YouTube-Video-Summarizer",
  },
];

export type Dashboard = {
  title: string;
  subject: string;
  image: string;
  pbix: string;
  repo: string;
};

export const dashboards: Dashboard[] = [
  {
    title: "SEN Pupils in England",
    subject: "Special educational needs across England, and the patterns in who ends up in pupil referral units.",
    image: "/pbix screenshots/UK-SEN.png",
    pbix: "/pbix/UK-SEN-Stats.pbix",
    repo: "https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/UK-SEN-analysis",
  },
  {
    title: "Hospital Patient Survey",
    subject: "Patient survey results from several hospitals, comparing how comfortable people were with how well their treatment worked.",
    image: "/pbix screenshots/Hospital-Stats.png",
    pbix: "/pbix/Hospital-Survey.pbix",
    repo: "https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/Hospital-analysis",
  },
  {
    title: "Sales and Profit",
    subject: "Retail sales and profit, broken down by market, season and product category.",
    image: "/pbix screenshots/Sales-Stats.png",
    pbix: "/pbix/Sales Performance Analysis.pbix",
    repo: "https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/Sales-analysis",
  },
  {
    title: "Harry Potter, by the Numbers",
    subject: "Budgets against box office, how the stories are structured, and which characters talk the most.",
    image: "/pbix screenshots/Harry-Stats.png",
    pbix: "/pbix/Harry Porter.pbix",
    repo: "https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/HarryPotter-stats",
  },
  {
    title: "Anime Ratings",
    subject: "Ratings and genre popularity across a few thousand anime, and how they’ve changed over the years.",
    image: "/pbix screenshots/Anime-Stats.png",
    pbix: "/pbix/Anime Ratings & Trends Dashboard.pbix",
    repo: "https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/Anime-analysis",
  },
  {
    title: "Pokémon Stats",
    subject: "Base stats and types for every Pokémon, across every generation.",
    image: "/pbix screenshots/Pokemon-stats.png",
    pbix: "/pbix/pokemon.pbix",
    repo: "https://github.com/shreyeahhs/powerbi-projects-showcase/tree/main/Pokemon-stats",
  },
];

/* --------------------------------------------------------------------------
   History
   -------------------------------------------------------------------------- */

export type Role = {
  org: string;
  title: string;
  place: string;
  from: string;
  to: string;
  stage?: "next" | "current";
  notes: string[];
  tools: string[];
};

export const roles: Role[] = [
  {
    org: "University of Glasgow",
    title: "Administrator, Centre for Data Science and AI",
    place: "Glasgow",
    from: "Oct 2026",
    to: "",
    stage: "current",
    notes: ["Admin work for the university’s data science and AI centre."],
    tools: [],
  },
  {
    org: "University of Glasgow",
    title: "Reach Out Ambassador, James McCune Smith Learning Hub",
    place: "Glasgow",
    from: "Mar 2026",
    to: "Oct 2026",
    notes: ["Helped students and staff around the learning hub. I moved here from the IT ambassador job in March."],
    tools: ["Student support", "Events"],
  },
  {
    org: "University of Glasgow",
    title: "Reach Out IT Student Ambassador",
    place: "Glasgow",
    from: "Jan 2026",
    to: "Mar 2026",
    notes: [
      "Helped students and staff with IT problems.",
      "Showed people what the university’s IT services could actually do for them.",
    ],
    tools: ["IT support", "Events"],
  },
  {
    org: "Inclusive Homework Club",
    title: "Volunteer Tutor",
    place: "Glasgow",
    from: "Oct 2025",
    to: "Sep 2026",
    notes: [
      "Spent a year helping students with English and maths.",
      "Got tutor of the week twice.",
    ],
    tools: ["Tutoring"],
  },
  {
    org: "Technobeez Solutions",
    title: "Lead Developer, EduDiagno",
    place: "Remote",
    from: "Jan 2025",
    to: "Sep 2025",
    notes: [
      "Led the backend and AI work on EduDiagno, a platform that runs job interviews with AI.",
      "Built the live speech-to-text and sentiment analysis, which ran across more than 1,000 interviews.",
      "Set the backend up to handle 50 or more video interviews at the same time.",
    ],
    tools: ["FastAPI", "React", "WebRTC", "PostgreSQL"],
  },
  {
    org: "Publicis Sapient",
    title: "Data Analyst Intern, Sustainability",
    place: "Bangalore",
    from: "Sep 2024",
    to: "Dec 2024",
    notes: [
      "Worked with large sustainability and operations datasets for client projects.",
      "Built KPI dashboards so different teams could actually see their numbers.",
    ],
    tools: ["Python", "SQL", "Power BI", "Snowflake"],
  },
  {
    org: "Publicis Sapient",
    title: "AI Engineering Intern",
    place: "Bangalore",
    from: "Nov 2023",
    to: "Dec 2023",
    notes: [
      "Went through carbon footprint data for clients and found ways to cut their emissions by 10 to 15 percent.",
      "Built data pipelines that handled over 100,000 metrics a day.",
      "Made dashboards that cut manual reporting time by more than half.",
    ],
    tools: ["Python", "SQL", "Tableau", "AWS"],
  },
  {
    org: "GraphGeo Analytics",
    title: "Data Analyst Intern",
    place: "Bangalore",
    from: "Jun 2023",
    to: "Aug 2023",
    notes: [
      "Cleaned up and checked more than 10,000 map data records.",
      "Wrote scripts that cut tagging mistakes by about 40 percent.",
    ],
    tools: ["Python", "PostGIS", "QGIS"],
  },
];

export const education = [
  {
    award: "MSc Data Science",
    school: "University of Glasgow",
    place: "Glasgow",
    years: "2025 to 2026",
    note: "Machine learning, statistics and working with big datasets, finished off with a dissertation.",
  },
  {
    award: "BE Artificial Intelligence and Data Science",
    school: "SDM Institute of Technology",
    place: "Karnataka",
    years: "2021 to 2025",
    note: "Machine learning, deep learning, data analysis and software engineering, mostly learned by building projects.",
  },
];

/* --------------------------------------------------------------------------
   Outside work
   -------------------------------------------------------------------------- */

export type Interest = {
  title: string;
  body: string;
  span: "wide" | "tall" | "unit";
  tint?: boolean;
};

export const interests: Interest[] = [
  {
    title: "Hot Wheels",
    body:
      "I collect Hot Wheels, the little 1:64 ones. The shelf filled up a while ago. I’m still buying them.",
    span: "wide",
    tint: true,
  },
  {
    title: "Vibe coding",
    body:
      "I build a lot of small apps just by prompting AI. Most of them get thrown away, and that’s fine. A few turn into something.",
    span: "tall",
  },
  {
    title: "Cooking",
    body: "I cook a lot. Traditional recipes, strange fusion experiments, and some baking when I’m in the mood.",
    span: "unit",
  },
  {
    title: "Reading",
    body: "Right now it’s the Shiva Trilogy by Amish Tripathi. Usually fantasy, sci-fi or a bit of philosophy.",
    span: "unit",
  },
  {
    title: "Gaming",
    body: "Genshin Impact and Red Dead Redemption 2 at the moment. Very ready for GTA VI.",
    span: "unit",
  },
  {
    title: "Tutoring",
    body: "I tutored English and maths at the Inclusive Homework Club for a year, and got tutor of the week twice.",
    span: "unit",
  },
];

export const skills = [
  { group: "Languages", items: ["Python", "SQL", "TypeScript", "JavaScript", "C", "Java"] },
  { group: "Analysis", items: ["Exploratory analysis", "Hypothesis testing", "Time series", "Feature engineering"] },
  { group: "Machine learning", items: ["Scikit-learn", "PyTorch", "TensorFlow", "Classification", "Clustering", "Prompting"] },
  { group: "Data engineering", items: ["Data pipelines", "PostgreSQL", "MySQL", "Data modelling", "FastAPI"] },
  { group: "Dashboards", items: ["Power BI", "DAX", "Power Query", "Tableau"] },
  { group: "Other tools", items: ["Git", "React", "REST APIs", "Linux"] },
];
