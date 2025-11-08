# Shreyas Gowda B - Portfolio

Modern, terminal-inspired portfolio with AI chatbot powered by OpenAI.

## Tech Stack

**Frontend:**
- React + TypeScript + Vite
- Tailwind CSS + Framer Motion
- shadcn-ui components
- React Router

**Backend:**
- Python FastAPI
- OpenAI GPT-4o-mini
- Uvicorn

## Setup

### Frontend

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your OPENAI_API_KEY to .env
uvicorn app.main:app --reload --port 8000
```

Runs at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

## Environment Variables

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:8000
```

**Backend** (`backend/.env`):
```
PORT=8000
FRONTEND_ORIGIN=http://localhost:5173
OPENAI_API_KEY=your_openai_key_here
```

## Features

- ✨ Terminal-style UI with glassmorphism
- 🤖 AI chatbot about Shreyas
- 📱 Fully responsive design
- ⚡ Smooth animations & page transitions
- 🎨 Dark theme with neon-green accents
- 📊 Projects & internships showcase
- 📧 Contact form with validation

## Deploy

**Frontend:** Netlify, Vercel, or via [Lovable](https://lovable.dev/projects/87dca356-5a55-4783-850f-6c8c60e4ce4e)
**Backend:** Render, Railway, Fly.io

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/projects` - List all projects
- `GET /api/projects/{slug}` - Get project by slug
- `GET /api/internships` - List all internships
- `POST /api/contact` - Submit contact form
- `POST /api/chat` - Chat with AI assistant

---

Built with ❤️ by Shreyas Gowda B
