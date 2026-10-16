# shreyeahhs

Personal site for Shreyas, administrator at the Centre for Data Science and AI,
University of Glasgow.

A single page: who I am, what I've built, a few Power BI dashboards, my prompt
engineering course, where I've worked, and a chatbot that can answer questions about
all of it. The ecosystem simulator in the hero runs live from its own deployment.

One Next.js app: the page and its two API routes (contact form and chatbot) deploy
together to Vercel. There is no separate backend.

## Running it

```bash
npm install
cp .env.example .env.local   # then fill it in
npm run dev
```

Site and API on `http://localhost:3000`. Without the Gemini key the chatbot says it
isn't answering; without the Brevo settings the contact form says it couldn't send.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build (also type-checks) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 (CSS-first config, no
`tailwind.config`), Motion for animation, Phosphor for icons, Geist and Geist Mono
self-hosted through `@fontsource-variable`. The API routes relay to Brevo for
contact email and Google Gemini for the assistant.

The page is server-rendered and prerendered at build time, then hydrates. Components
are client components (`src/Site.tsx` is the boundary), so anything that reads the
browser has to do it in an effect or through `useSyncExternalStore`, never during
render. `src/lib/theme.ts` and `src/lib/motion.ts` show the pattern.

## Where things live

| Path | What it is |
|---|---|
| `src/data/content.ts` | **Every fact on the site.** Edit here, not in components |
| `src/app/layout.tsx` | `<head>`: title, description, share image, theme script |
| `src/Site.tsx` | The page, section by section |
| `src/components/` | One file per section, plus shared pieces |
| `src/index.css` | Design tokens, both themes, base and utilities |
| `src/app/api/chat/route.ts` | Gemini relay, with retries and model fallback |
| `src/app/api/contact/route.ts` | Contact form: validation and Brevo sending |
| `src/server/chat-prompt.ts` | The assistant's system prompt |
| `src/server/emails.ts` | The two contact emails, HTML and plain text |
| `src/server/limiter.ts` | Rate limiting for both API routes |
| `PRODUCT.md` | Product truth: users, positioning, constraints |
| `CONTENT.md` | Full content inventory, including what was retired |
| `DESIGN.md` | The built design system, recorded from the code |

The assistant's system prompt duplicates biography from `content.ts` by
necessity. **If you change a role, a date or a project, change it in both places.**

## Environment

See `.env.example`. Locally these go in `.env.local`; on Vercel, under Project
Settings → Environment Variables.

```
GEMINI_API_KEY=
GEMINI_MODEL=gemini-flash-latest
GEMINI_FALLBACK_MODEL=gemini-flash-lite-latest
BREVO_API_KEY=
CONTACT_FROM_EMAIL=
CONTACT_FROM_NAME=Shreyas
CONTACT_TO_EMAIL=
UPSTASH_REDIS_REST_URL=      # optional, see rate limiting
UPSTASH_REDIS_REST_TOKEN=
```

## API

| Endpoint | Method | Notes |
|---|---|---|
| `/api/health` | GET | Health check |
| `/api/contact` | POST | 5 per 10 minutes per address, 50 per day in total |
| `/api/chat` | POST | 20 per 5 minutes per address |

If Gemini is busy (it returns 503 at peak times) the chat retries once, then falls
back to `GEMINI_FALLBACK_MODEL`; a model that answers 404 is skipped straight away.
The API key is sent as a header, never in the URL.

**Rate limiting.** Vercel runs the API on many short-lived instances, so counts kept
in memory only limit what one instance sees. Add an Upstash Redis database (Vercel
Marketplace, free tier) and the counts are shared by every instance; the integration
sets the variables for you. Without it the limits still apply, per instance.

## Deploying

Push to the branch Vercel builds from. `vercel.json` pins the framework to Next.js,
so the project's old Vite settings don't apply. Set the environment variables above
in Vercel first.

## Licence

MIT for the code. The Power BI datasets keep their original source licences.
