# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing codebase answers this. One Next.js 16 app (App Router, React 19, TypeScript, Tailwind v4) deployed on Vercel: the page plus two API routes, the contact-email relay (Brevo) and the chatbot relay (Google Gemini). Until October 2026 those routes were a separate Python FastAPI service on Render (`portfolio-anfe.onrender.com`); it was ported to Next.js route handlers so the whole site deploys as one project. The Python code was removed once the Vercel deployment was live.

## Users

Primary: people who already have a reason to look Shreyas up — colleagues and staff at the University of Glasgow's Centre for Data Science and AI, students he supports, readers who arrive from Prompt Corpus, and peers in data science and AI.

Explicitly **not** the audience any more: recruiters and hiring managers. Shreyas takes up an Administrator post at the Centre for Data Science and AI in October 2026, ahead of this site's launch on 15 October, and stated the site no longer needs to impress prospective employers. Work history stays on the site as biography, not as a pitch.

## Product Purpose

A personal site that represents who Shreyas is, what he has made, and what he argues for. Success is a visitor coming away with a clear sense of the person and his position on prompt engineering — and being impressed by the craft of the site itself. The user's stated bar: "top portfolio websites listing" level; visitors should be awestruck.

## Positioning

Shreyas teaches prompt engineering from the mechanism up rather than as a list of tricks, and argues that prompt engineering is the route to **sustainable AI** — getting more from models that already exist instead of demanding larger ones. He has built the long-form proof of that position: Prompt Corpus, a free 60-lesson written course across 5 tracks, 98 cited primary sources, roughly 6 hours of reading, every lesson written in full.

This is the claim a neighbouring personal site could not truthfully copy: the argument exists as a finished, sourced, public body of work rather than as an opinion.

## Operating Context

Shreyas works inside a university research centre, writes and maintains Prompt Corpus, builds and runs Vele (his own calendar assistant), builds small applications quickly by prompting ("vibe coding"), and experiments with prompts as a habit. He tutors volunteer students. He collects 1:64 scale Hot Wheels. He cooks, games, and reads.

## Capabilities and Constraints

- Static content site with client-side routing; no CMS, no auth, no database.
- Contact form posts to `POST /api/contact`; the route handler sends two transactional emails via Brevo (owner notification + visitor acknowledgement). Must be kept and made more professional.
- Chatbot posts to `POST /api/chat`; the route handler relays to Gemini with a system prompt carrying Shreyas's biography. Must be kept. The assistant refers to him as **"Shreyas"**, never "Shreyas Gowda B".
- The chatbot's system prompt in `src/server/chat-prompt.ts` is a second copy of the site's
  facts, so anything added to a page has to be added there too or the assistant will
  contradict it. It carries explicit standing instructions never to invent a URL, launch
  date, user count, latency, uptime or scale for Vele (not public) or Juggle (code
  public, no hosted demo), and never to claim a test count for Juggle.
- Both public endpoints are unauthenticated, so both are rate limited in `src/server/limiter.ts`: chat 20 per 5 minutes per address; contact 5 per 10 minutes per address **and** 50 per day across everyone, since each message sends two emails. On Vercel the address is `x-real-ip`, which Vercel overwrites with what it actually saw; elsewhere `X-Forwarded-For` is ignored unless `TRUSTED_PROXIES` says how many proxies to believe. Counts are shared across instances only when an Upstash Redis store is configured (`UPSTASH_REDIS_REST_URL`/`_TOKEN`, or the `KV_REST_API_*` names); otherwise each serverless instance counts on its own, which is weaker on Vercel than it was on a single Render process.
- The two contact emails are built in `src/server/emails.ts` (HTML in the site's palette with a dark-mode variant, plus plain text). The owner email's reply-to is the visitor; the receipt's reply-to is Shreyas.
- Open risk, partly mitigated: the receipt goes to whatever address was typed and quotes the message back, so it can carry someone else's text to a stranger from Shreyas's sender. Its subject never contains anything typed, the greeting uses only the first word of the name, and its footer tells a recipient who never wrote in to ignore it. The limits above cap the volume; dropping the quoted message would remove the incentive entirely.
- The canonical link and the share image's absolute URL come from `VERCEL_PROJECT_PRODUCTION_URL` (`src/app/layout.tsx`), the project's real production domain, which becomes the custom domain once one is attached. Nothing is hard-coded; an earlier canonical had pointed at a domain nobody had confirmed owning.
- Backend also exposes unused `/api/projects` and `/api/internships` routes reading stale duplicate JSON.
- `prompt-corpus.vercel.app` is Shreyas's own second site and must be presented as his.

## Brand Commitments

- Referred to as **Shreyas**. Full name Shreyas Gowda Bettegowda; "Shreyas Gowda B" is retired from display copy.
- Prompt Corpus (`prompt-corpus.vercel.app`) is his and is linked as his.
- Vele and Juggle are his, and are presented as peers of Prompt Corpus rather than
  as more entries in the Work index. The three get a section each, and each is shown
  in its own design system rather than repainted in this site's colours. None of the
  three is allowed to become another's footnote.
- Register: chill, personal, confident. Not a résumé, not a pitch, not job-hunting.
- The previous build's terminal/CLI/glassmorphism identity is explicitly rejected by the user as "cringe" and is anti-reference, not authority.

## Evidence on Hand

Real, verified, in-repo or live:

- **Vele** — a calendar with an assistant in the margin, built by Shreyas for his own
  calendar and launching before this site does. Real and running locally: Next.js 16,
  PostgreSQL, Prisma, Better Auth, Gemini; a deterministic scheduling engine in pure
  TypeScript; booking links; Telegram. Verified 24 Sep 2026: typecheck, lint and 124
  tests pass, and the app runs end to end against a local database. **It has no public
  URL yet** — `links.vele` in `src/data/content.ts` is deliberately empty and the site
  shows a "Launching soon" badge until Shreyas supplies one. No users, no metrics, no
  testimonials exist for it; do not invent any.
- **Juggle** — a self-hosted, open-source bring-your-own-key AI gateway: your provider
  keys go in its environment, your app calls one OpenAI-compatible endpoint, and it
  cycles through the keys so a rate limit never reaches you. Verified against the
  public repo on 1 Oct 2026: Next.js 16.3.5, React 19.2.8, Tailwind 4.3.3, Drizzle
  0.45.2, Zod 4.6.5, PGlite in dev, MIT licensed. Gemini is the only provider adapter
  today. **Live at `github.com/shreyeahhs/juggle`**, with his own instance at
  `juggle.onrender.com` whose dashboard is single-owner and password-gated — a site to
  read, not a demo to drive. **The published repo has no test suite** (commit `ee23c13`
  stripped it), so the site must not claim one, and the stats are structural rather than
  a line count because the repo keeps moving. See CONTENT.md for the retired numbers.
  It is a personal tool he open sourced: no users, no uptime, no latency figures, no
  scale. Do not write it as production-hardened, and do not invent a number for it.
- **Prompt Corpus** — live at `prompt-corpus.vercel.app`. 60 lessons, 5 tracks (Foundations 12, Beginner 8, Intermediate 7, Advanced 9, Model Playbooks 6, For Students 7, At Work 5, Cost of a Prompt 6), 98 cited sources, free, account required.
- **11 projects** with real GitHub repositories — see CONTENT.md for the full record.
- **6 roles** with real dates, locations, tools, and outcome figures — see CONTENT.md.
- **6 Power BI dashboards** with downloadable `.pbix` files and screenshots in `public/pbix/` and `public/pbix screenshots/`.
- **Assets:** `public/avatar.png`, `public/preview.png`, `public/project-previews/living-ecosystem-simulator.png`, a rigged glTF avatar (`Meshy_AI_Animation_Walking_withSkin.gltf` + `baseColor.png` + `buffer.bin`).
- **Social:** github.com/shreyeahhs, linkedin.com/in/shreyas-gowda-5316b51b1, instagram.com/shreyeahhs, gowdashreyas364@gmail.com.

Absences future work must not fabricate: no visitor analytics, no testimonials, no press, no photographs of the Hot Wheels collection, no metrics for Prompt Corpus readership. Hot Wheels specifics (individual castings owned) are unknown and must be written generically or supplied by Shreyas.

Confirmed 17 Sep 2026: the administrator post begins once the Reach Out JMSLH ambassador post ends on 11 October 2026. Shreyas launches this site on 15 October, so the administrator role is written in the present tense throughout.

Still open: exact administrator job-title wording; ; whether the MSc is formally conferred.

## Product Principles

1. **Biography, not candidacy.** Experience, education, and projects are on the site because they are true, not because they are selling anything.
2. **The argument is the spine.** Prompt engineering as the sustainable path is the one position the site takes; everything else arranges around it.
3. **Show the work, not claims about the work.** Prompt Corpus exists, the repos exist, the dashboards download. Link the artifact rather than describing it.
4. **The person is allowed in.** Hot Wheels, cooking, vibe-coded experiments and tutoring are load-bearing, not filler.
5. **Never fabricate.** Real repos, real dates, real figures. Unknowns are asked for or omitted, never invented.

## Accessibility & Inclusion

No product-specific standard established by the user. The previous build consistently honoured `prefers-reduced-motion`; retain that as a baseline expectation.
