# Content inventory

Everything the old site held, extracted before the rebuild. This is the source of truth for the new build — nothing here should be lost, and nothing not here should be invented.

Captured 2026-09-17 from `src/data/*.json`, `src/pages/*`, `backend/app/routes/chatbot.py`, and `prompt-corpus.vercel.app`.

---

## 1. Identity

| Field | Value |
|---|---|
| Display name | **Shreyas** |
| Full name | Shreyas Gowda Bettegowda |
| Retired form | ~~Shreyas Gowda B~~ — do not use in display copy |
| Current role | Administrator, Centre for Data Science and AI, University of Glasgow (from Oct 2026) |
| Location | Glasgow, United Kingdom |
| Email | gowdashreyas364@gmail.com |
| GitHub | https://github.com/shreyeahhs |
| LinkedIn | https://www.linkedin.com/in/shreyas-gowda-5316b51b1/ |
| Instagram | https://www.instagram.com/shreyeahhs/ |
| Second site | https://prompt-corpus.vercel.app |

**Confirmed by Shreyas, 17 Sep 2026:** joined Reach Out IT as a student ambassador Jan 2026, moved to the Reach Out JMSLH ambassador post Mar 2026; that post ends 11 Oct 2026, after which the Centre for Data Science and AI administrator post begins. Volunteering at the Inclusive Homework Club ran a full year and ended Sep 2026.

**Still open:** exact wording of the administrator job title;  whether the MSc is formally conferred.

---

## 2. The position

> Prompt engineering is the future of sustainable AI.

The argument Shreyas advocates: you get more out of the models that already exist by prompting them deliberately, rather than by demanding larger ones. A constraint is cheaper than a parameter count.

This is not a slogan on the site — two things carry it. **Prompt Corpus** writes the argument down. **Vele** runs on it: the model reads the sentence, a deterministic engine decides every actual time. On the site they get a section each, and each is shown wearing its own design system: Prompt Corpus's near-black and amber with Literata, Vele's paper and ink with Libre Franklin. Neither reads as the other's footnote.

### Prompt Corpus — https://prompt-corpus.vercel.app

A free written course in prompt engineering, taught from the mechanism up. Its own framing: *"Most material on this subject is a list of tricks with no stated reason. That works until a trick stops working, and then you have nothing to reason from. Everything here is taught as a consequence of the mechanism underneath it, so it survives the model changing under you."*

- **60 lessons**, all written in full, nothing a placeholder
- **98 sources cited**, primary material only — original papers and official provider docs, not blog summaries
- **~6 hours** of reading · free · account required
- Reading surface is designed, not decorated: 68ch measure, 1.68 line height, Literata body, 8.4:1 dark contrast, 9.4:1 light contrast, per-reader theme

**Tracks:**

| № | Track | Lessons | Covers |
|---|---|---|---|
| 00 | Foundations | 12 | Tokens, transformers, training, inference, history, hardware, why prompting works at all |
| 01 | Beginner | 8 | Anatomy of a prompt, common mistakes, zero/one/few-shot, reading output critically, first prompt library |
| 02 | Intermediate | 7 | Roles, system vs user messages, delimiters and XML tags, chain-of-thought, structured output, context engineering, debugging checklist |
| 03 | Advanced | 9 | Tree-of-thought, self-consistency, chain-of-verification, meta-prompting, prompt chains, agent/tool use, injection defence, evaluation, token economics |
| 04 | Model Playbooks | 6 | Claude, GPT, Gemini, open-weight, image models, which model for which task |
| 05 | For Students | 7 | Using AI without outsourcing thinking, research without fabrication, academic integrity |
| 06 | At Work | 5 | Writing, maintainable code, data and analysis, research briefings, team consistency |
| 07 | Cost of a Prompt | 6 | Token and compute economics |

---

### Vele — link pending, launching before this site

A personal calendar with an assistant sitting in the margin. Shreyas built it for his own
calendar. You write it a sentence — "lunch with mom, 1 to 3 on Saturday" — and it pencils
the event in; anything involving other people, a clash or a repeat stays in pencil until he
confirms it. Booking links let other people take time that is already free.

Its own framing: *"Your diary, where Vele writes in pencil and only you turn it into ink."*

Why it belongs beside Prompt Corpus: the language model interprets and orchestrates but
never decides availability. A deterministic, tested scheduling engine — pure TypeScript,
no I/O — computes every free slot from real events, working hours, buffers, blocked and
focus time, and reports why it rejected the rest. That is the argument in section 2,
implemented.

- **5 calendar views** — day, 3-day, week, month, list
- **2 ways to ask** — the web app and Telegram, both hitting the same agent (WhatsApp Business prepared, not live)
- **0 guessed times** — the model is never the source of a time, a date or an email address
- What the engine weighs: working hours, buffers, lunch, focus time, minimum notice, daily limits, time zones
- Built with Next.js 16, React 19, PostgreSQL + Prisma, Better Auth, Gemini, Luxon and rrule

**Verified 24 Sep 2026**, running locally end to end: typecheck clean, lint clean, 124 tests
passing (4 skipped are the opt-in live-Gemini checks), migrations applied, demo account
seeded, booking flow computing real slots.

**Not yet true, do not write as if it were:** there is no public URL (`links.vele` in
`src/data/content.ts` is empty on purpose, and the site shows a "Launching soon" badge in
place of the button until it is filled in), no users, no uptime, no reviews, no press. The
sample week drawn on the portfolio is invented and is labelled as sample data.

### Juggle — github.com/shreyeahhs/juggle, MIT

A self-hosted, open-source **bring-your-own-key AI gateway**. Your provider API keys go in
the deployment's environment; your applications call one OpenAI-compatible endpoint and
change nothing else. It cycles through the keys on every request and absorbs rate limits,
so the application gets one clean response instead of a 429.

The chore it replaces: free-tier AI keys are rate limited, so you end up holding several
and swapping between them by hand.

Its own framing: *"One API. Your keys. Automatic failover."*

**The engineering worth writing about**, in roughly the order it mattered:

- **One table decides everything.** Every upstream failure is normalised into a kind —
  rate limited, invalid key, permission denied, overloaded, timeout — and a single
  reviewable table sets the retry behaviour and the key's health for each. Getting that
  classification right matters more than anything else in the system.
- **Rotation, not failover.** It moves to a different key on every request rather than
  waiting for a failure, so a throttled key is usually already skipped.
- **Cooldowns learned from the provider docs.** A per-minute limit waits a minute; an
  exhausted daily quota waits for the provider's actual reset; a provider-supplied retry
  delay is used instead of a guess.
- **Scoped per model**, because providers meter quota per model, so a key spent on one
  model keeps serving another.
- **Quota groups.** Gemini meters per Google Cloud project, not per key. Keys can declare
  their project inline and the whole group is parked together.
- **Keys are never stored.** They live only in the environment. The database holds a keyed
  HMAC fingerprint so statistics survive a redeploy, and there is deliberately no column
  that could hold a prompt or a response.
- **A stream that fails still delivers** already-streamed chunks: the provider stream is a
  typed event union.
- **Bounded everywhere:** attempts, deadlines, jittered backoff and a circuit breaker, so
  it can never retry-storm a provider.

**Verified against the public repo, 1 Oct 2026:** Next.js 16.3.5, React 19.2.8,
TypeScript 6.0.3, Tailwind 4.3.3, Drizzle 0.45.2 with Postgres 3.4.9 (PGlite 0.5.8 in
dev), Zod 4.6.5. MIT licensed. **One endpoint, no key column in the schema.** Gemini is
the only provider adapter today; the provider layer is an interface with pluggable
adapters. (`ERROR_POLICY` in `src/server/gateway/policy.ts` has 11 failure kinds. That
count is true and deliberately unprinted: it is not a number his brief gave, and the
brief's rule is that only its own numbers go on the page.)

**Two numbers were retired on 1 Oct 2026 and must not come back.** The site used to print
*8,588 lines of source* and *139 test cases across 7 files*. Both went stale inside a day:
the source is now 8,933 lines, and commit `ee23c13` ("Strip the repo to what production
needs; rewrite the README") deleted all 7 test files and the vitest config before the repo
was published, so **the public repo has no test suite and `vitest` is not a dependency**.
The tests were real and were written during development, but the site cannot claim them,
because the link next to the claim lets anyone check. The stats on the page are
*1 endpoint · 0 keys stored · MIT licence*: structural, so they do not rot, and both
numbers come from the brief. Do not reintroduce a line count. If the tests are ever put
back in the public repo, *139 tests* can come back with them.

**Links.** `links.juggle` is the repo. `links.juggleLive` is
`https://juggle.onrender.com`, his own instance: the landing page is public and explains
the project, but its dashboard is single-owner and password-gated (*"Enter the password
from its OWNER_PASSWORD setting"*), so there is **no sign-up, no demo account and nothing
a visitor can drive**. The page links it as "Live site", never as a demo. Note the repo's GitHub *homepage* field still points at `juggle-snowy.vercel.app`,
which returns `DEPLOYMENT_NOT_FOUND` — a stale link on the repo page, not something this
site references.

**Still not true, do not write as if it were:** no users, no uptime, no latency figures, no
scale. It is a personal tool, open sourced. The key rotation diagram on the portfolio is an
explanation, not a recording.

The engineering notes above are kept here on purpose even though the site no longer
prints them: the Juggle section is deliberately short, and the diagram carries the
explanation. This is the record, not the page.

---

## 3. Education

**MSc Data Science** — University of Glasgow, Glasgow UK, 2025–2026
Advanced postgraduate training in machine learning, statistical modelling and scalable data analysis, with emphasis on applied problem-solving, programming and real-world data projects. Includes an independent MSc dissertation focused on delivering actionable insights using modern data science techniques.

**BE Artificial Intelligence & Data Science** — Sri Dharmasthala Manjunatheshwara Institute of Technology (SDMIT), Karnataka India, 2021–2025
Engineering degree focused on building intelligent, data-driven systems: machine learning, deep learning, data analytics and software engineering, with hands-on exposure through model development, data pipelines and applied AI projects.

---

## 4. Experience

Six roles, newest first. All figures below are as previously published and should be treated as real.

### University of Glasgow - Administrator, Centre for Data Science and AI
Glasgow, UK · Oct 2026 onwards · **Current**
- Begins once the Reach Out ambassador post finishes on 11 October 2026. The site launches 15 October, so present tense is correct on the live page.

### University of Glasgow - Reach Out Ambassador, James McCune Smith Learning Hub
Glasgow, UK · Mar 2026 to Oct 2026 · *Student support, Events* · Ended 11 Oct 2026
- Moved across from the IT ambassador post in March 2026
- Ends 11 October 2026

### University of Glasgow - Reach Out IT Student Ambassador
Glasgow, UK · Jan 2026 to Mar 2026 · *IT Support, Communication, Event Management*
- Representing IT services at the University of Glasgow, assisting students and staff with technical queries
- Promoting digital literacy and IT resources across the university campus

### Inclusive Homework Club - Volunteer Tutor
Glasgow, UK · Oct 2025 to Sep 2026 · *English Teaching, Mathematics, Mentoring* · **Ended after one year**
- Providing academic support in English and Mathematics to students at the Inclusive Homework Club
- Facilitating an inclusive and supportive learning environment for diverse learners
- Named **Tutor of the Week twice**
- Recognition post: https://www.linkedin.com/posts/shreyas-gowda-5316b51b1_supportrefugees-learning-community-activity-7401694866067357697-nNIW

### Technobeez Solutions — AI Interviewer Lead Developer (EduDiagno)
Remote · 2025-01 → 2025-09 · *FastAPI, React, Gemini, WebRTC, PostgreSQL*
- Led backend and AI development for EduDiagno, an AI-powered interview and assessment platform
- Implemented real-time speech-to-text and sentiment analysis workflows used across 1000+ interviews
- Architected a scalable backend handling 50+ concurrent WebRTC video interview sessions
- Designed assessment scoring logic and analytics pipelines enabling automated candidate evaluation

### Publicis Sapient — Data Analyst Intern, Sustainability Division
Bangalore, India · 2024-09 → 2024-12 · *Python, SQL, Power BI, Snowflake, Excel*
- Worked with large-scale sustainability and operations datasets to produce actionable insights for ongoing client programmes
- Designed KPI dashboards that improved data visibility across business units
- Collaborated with domain experts to validate analytical models and sustainability benchmarks

### Publicis Sapient — AI Engineering Intern
Bangalore, India · 2023-11 → 2023-12 · *Python, SQL, Tableau, AWS, Power BI*
- Supported sustainability analytics for enterprise clients by analysing carbon footprint datasets, uncovering 10–15% emission reduction opportunities
- Built automated ETL workflows processing over 100K sustainability and operational metrics daily
- Developed interactive dashboards for leadership insights, cutting manual reporting time by more than 50%

### GraphGeo Analytics — Data Analyst Intern
Bangalore, India · 2023-06 → 2023-08 · *Python, PostGIS, SQL, QGIS, Pandas*
- Cleaned, standardised and validated more than 10,000 geospatial metadata records
- Developed automated QA scripts reducing geospatial tagging errors by approximately 40%
- Worked with the GIS team on spatial visualisation workflows for location intelligence

### Also on record (from the old chatbot prompt, not in the structured data)
- **NSS (National Service Scheme) Leader** — head of the unit for 3 years. Led operations, volunteer coordination and event execution; supervised a 7-day Swachh Bharat environmental awareness camp in Pajiradka; reached 200+ community members; featured in a local newspaper for leadership and community impact.

---

## 5. Projects

Eleven, all with live repositories.

| Project | Year | Tech | Links |
|---|---|---|---|
| **Living Ecosystem Simulator** | 2026 | TypeScript, Vite, Canvas 2D API | [live](https://living-ecosystem-simulator.onrender.com/) · [repo](https://github.com/shreyeahhs/Living-Ecosystem-Simulator) |
| **NightOut Planner** | 2024 | React, TypeScript, FastAPI, Python, Gemini | [repo](https://github.com/shreyeahhs/GlasLet-sgow) |
| **Glasgow Snow Prediction** | 2024 | Python, Pandas, Scikit-Learn, Matplotlib | [repo](https://github.com/shreyeahhs/Glasgow-Snow-Prediction) |
| **Twin Engine — Jet Engine Digital Twin** | 2024 | React, TypeScript, FastAPI, Python, Scikit-Learn | [repo](https://github.com/shreyeahhs/digital-twin-jet-engine) |
| **JLR EV Launch Delay Simulation** | 2025 | Python, Pandas, Matplotlib, YAML | [repo](https://github.com/shreyeahhs/jlr-launch-delay-analysis) |
| **YouTube AI Summarizer** | 2024 | Python, Gemini API, LangChain, FastAPI | [repo](https://github.com/shreyeahhs/YouTube-Video-Summarizer) |

**Full summaries:**

- **Living Ecosystem Simulator** — Browser-based top-down pixel-art wildlife simulation built with TypeScript and the Canvas 2D API. Grass grows, rabbits graze, foxes hunt, hawks patrol, and weather, fire and disease all emerge from local rules. Cover image: `public/project-previews/living-ecosystem-simulator.png`.
- **NightOut Planner — AI Event Recommendation System** — AI-driven event and venue recommendation app with conversational planning mode, live data-fetching, and a React + FastAPI architecture. Built for the GUTS × SAS Scotland Hackathon.
- **Glasgow Snow Prediction — 35-Year Climate & ML Analysis** — 35-year climatology analysis using Open-Meteo archives to predict snow likelihood in Glasgow with Logistic Regression, Random Forest, and first-snow-date distribution modelling.
- **Twin Engine — Jet Engine Digital Twin (RUL Predictor)** — Digital twin dashboard predicting Remaining Useful Life of turbofan engines using the NASA CMAPSS dataset. Includes confidence intervals (P10/P90), feature explanations, and a React interface.
- **JLR EV Launch Delay Impact Simulation** — Strategic simulation modelling EV launch delays for Jaguar Land Rover: revenue impact, competitor substitution modelling, scenario analysis and visualisation outputs. Synthetic but industry-grounded datasets.
- **YouTube AI Summarizer** — NLP tool extracting transcripts and generating structured summaries, chapter breakdowns and key insights for long-form video.

### Power BI dashboards

All open-access, MIT licensed, downloadable `.pbix`. Underlying public datasets remain under their original source licences. Showcase repo: https://github.com/shreyeahhs/powerbi-projects-showcase

| Dashboard | Screenshot | .pbix | Subject |
|---|---|---|---|
| SEN Pupils Analysis | `/pbix screenshots/UK-SEN.png` | `/pbix/UK-SEN-Stats.pbix` | Special Educational Needs in England — structural patterns, inequalities, PRU risk factors |
| Hospital Patient Analytics | `/pbix screenshots/Hospital-Stats.png` | `/pbix/Hospital-Survey.pbix` | Patient experience survey data — physical/environmental needs, treatment effectiveness |
| Sales Performance & Profitability | `/pbix screenshots/Sales-Stats.png` | `/pbix/Sales Performance Analysis.pbix` | Retail sales and net profit across global markets, seasons, categories |
| Pokémon Statistics | `/pbix screenshots/Pokemon-stats.png` | `/pbix/pokemon.pbix` | Type distributions, base stats, legendary status across generations |
| Anime Ratings & Trends | `/pbix screenshots/Anime-Stats.png` | `/pbix/Anime Ratings & Trends Dashboard.pbix` | Industry trends, ratings distribution, genre popularity over time |
| Harry Potter Statistics | `/pbix screenshots/Harry-Stats.png` | `/pbix/Harry Porter.pbix` | Budget vs profit, narrative structure, character dialogue distribution |

Repo subfolders: `UK-SEN-analysis`, `Hospital-analysis`, `Sales-analysis`, `Pokemon-stats`, `Anime-analysis`, `HarryPotter-stats`.

---

## 6. The person

Carried forward and updated. The user's emphasis: **vibe coding apps and experimenting with prompts**, and **collecting Hot Wheels**.

- **Hot Wheels** — collects 1:64 scale die-cast. *Specific castings owned are unknown — ask Shreyas or keep the copy generic. Do not invent models.*
- **Vibe coding** — builds apps and experiments by prompting; rapid prototyping where intuition drives the flow. The old site noted the previous portfolio was itself vibe-coded. Interests: AI agents, rapid prototyping, creative coding, LLMs.
- **Cooking** — global cuisine, baking, meal prep, fusion. "From perfecting traditional recipes to experimenting with fusion dishes."
- **Gaming** — Genshin Impact, Red Dead Redemption 2, waiting for GTA VI. Likes complex roleplaying systems and competitive multiplayer.
- **Reading** — the Red Queen series, Red War, and the Shiva Trilogy by Amish Tripathi. Sci-fi, epic fantasy, philosophical non-fiction.
- **Tutoring** — Inclusive Homework Club (see Experience). Tutor of the Week twice.

---

## 7. Skills

| Group | Items |
|---|---|
| Languages | Python, SQL, TypeScript, JavaScript, C, Java |
| Data science & analytics | EDA, statistical analysis, hypothesis testing, feature engineering, time-series analysis, survey & observational data analysis, data visualisation, data storytelling |
| Machine learning & AI | Supervised/unsupervised learning, classification & regression, clustering, Scikit-learn, PyTorch (basics), TensorFlow/Keras (basics), prompt engineering |
| Data engineering | Data modelling (star/snowflake), ETL/ELT pipelines, PostgreSQL, MySQL, NoSQL fundamentals, API data ingestion, FastAPI |
| BI & visual analytics | Power BI, DAX, Power Query, dashboard design, KPI design, interactive analytics, decomposition trees, key influencers |
| Software, DevOps & tooling | Git & GitHub, React, REST APIs, JSON data exchange, CI/CD concepts, Linux, environment management |

---

## 8. Systems to keep

### Contact / email
`POST /api/contact` → FastAPI → Brevo transactional API. Sends two emails: an owner notification to `CONTACT_TO_EMAIL` and an acknowledgement to the visitor. Env: `BREVO_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_FROM_NAME`, `CONTACT_TO_EMAIL`. Validation via Pydantic `EmailStr`, name ≤100 chars, message ≤1000 chars.

Carried-over defects to fix in the rebuild:
- `contact.message.replace('\\n', '<br/>')` matches a literal backslash-n, so real newlines never become line breaks
- `name` and `message` are interpolated into the email HTML unescaped
- no rate limiting on a public endpoint spending a Brevo quota

### Chatbot
`POST /api/chat` → FastAPI → Gemini `generateContent` (`GEMINI_MODEL`, currently `gemini-2.5-flash`). Accepts `{message, history}`; `__init__` requests an opening greeting. Returns `{response}`. Frontend renders markdown through `marked` → `DOMPurify.sanitize`.

Required changes: the system prompt must say **Shreyas**, third person, and must be rewritten against this document — the old prompt lists projects and roles that disagree with the real data. No rate limiting currently.

### Assets in `public/` — keep all
`avatar.png`, `preview.png`, `favicon.svg`, `project-previews/living-ecosystem-simulator.png`, `pbix/*.pbix` (6), `pbix screenshots/*.png` (6), `Meshy_AI_Animation_Walking_withSkin.gltf` + `baseColor.png` + `buffer.bin`, `robots.txt`, `_redirects`, `placeholder.svg`.

Note: `index.html` referenced `/favicon.ico`, which does not exist — a guaranteed 404 to drop or fix.

---

## 9. Explicitly retired

Rejected by the user as "cringe" / superseded. Deleted in the rebuild, recorded here so the decision is traceable.

- The terminal / ShreyasOS identity: boot log animation, `$ whoami` headings, fake system status footer with invented uptime/CPU/temp/visitor numbers
- The hidden ASCII console (`/` or `~`) and its 18 commands, including `sudo hire shreyas`
- The second command line (`;`) and its 9 commands
- Glassmorphism cards, particle canvas background, parallax layers, the mouse-tracking 3D avatar page
- The factory.ai-style scroll-pinned projects carousel with its orange rail
- The draggable floating chat button
- The "Hobbies" page as a separate destination
- Job-hunting framing throughout: "View Projects()", "Resume()", "Download Resume", "sudo hire shreyas", "Let's discuss your project"
- The three-theme switcher (`dark`/`light`/`neon`) that never had CSS behind it
- ~42 unused shadcn/ui components, the unused `pages/Internships.tsx`, and the unused `/api/projects` + `/api/internships` backend routes with their stale duplicate JSON
