from pathlib import Path

from dotenv import load_dotenv

# Environment must be loaded before any module that reads it at import time.
# The path is pinned to backend/.env rather than searched for, because a bare
# load_dotenv() depends on the working directory: started from the repo root it
# found nothing, and the API ran with no Gemini or Brevo keys and said so only in
# a log line. On Render the variables come from the dashboard and this is a no-op.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

import logging
import os
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import chatbot, contact

logging.basicConfig(level=logging.INFO)
# httpx logs every request URL at INFO. Keep it quiet so no URL ever reaches the logs.
logging.getLogger("httpx").setLevel(logging.WARNING)


def allowed_origins() -> list[str]:
    """
    FRONTEND_ORIGIN accepts a comma-separated list so local development and the
    deployed site can be permitted at the same time.
    """
    raw = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    origins = [o.strip().rstrip("/") for o in raw.split(",") if o.strip()]
    return origins or ["http://localhost:5173"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")):
        logging.warning("No Gemini API key set. /api/chat will return 503 until it is.")
    if not (os.getenv("BREVO_API_KEY") and os.getenv("CONTACT_FROM_EMAIL")):
        logging.warning("Brevo is not fully configured. Contact email delivery is disabled.")

    async with httpx.AsyncClient(timeout=httpx.Timeout(30.0, connect=10.0)) as client:
        app.state.http_client = client
        logging.info("Portfolio API ready. Allowed origins: %s", ", ".join(allowed_origins()))
        yield

    logging.info("Shutting down.")


app = FastAPI(
    title="Shreyas Portfolio API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

app.include_router(contact.router, prefix="/api/contact", tags=["contact"])
app.include_router(chatbot.router, prefix="/api/chat", tags=["chat"])


@app.get("/")
async def root():
    return {"status": "ok", "service": "portfolio-backend"}


@app.get("/api/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    try:
        port = int(os.getenv("PORT", "8000"))
    except ValueError:
        port = 8000

    uvicorn.run(app, host="0.0.0.0", port=port)
