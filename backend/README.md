# Backend API

FastAPI backend for Shreyas Gowda's portfolio.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Add your Gemini / Google Generative API key to `.env` (set `GEMINI_API_KEY`)

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

API will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

## Endpoints

- `GET /api/health` - Health check
- `GET /api/projects` - List all projects
- `GET /api/projects/{slug}` - Get project by slug
- `GET /api/internships` - List all internships
- `POST /api/contact` - Submit contact form
- `POST /api/chat` - Chat with AI about Shreyas
