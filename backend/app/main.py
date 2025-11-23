from dotenv import load_dotenv

# Load environment variables before importing any modules that depend on them
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.routes import projects, internships, contact, chatbot
import logging

app = FastAPI(title="Shreyas Gowda Portfolio API", version="1.0.0")


@app.get("/")
async def root():
    # Provide a lightweight 200 response at the root so platforms probing `/` get OK.
    return {"status": "ok", "service": "portfolio-backend"}


@app.on_event("startup")
async def startup_checks():
    # Validate critical environment variables early and log helpful messages.
    if not (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")):
        logging.warning(
            "GEMINI_API_KEY (or GOOGLE_API_KEY) not set. The chatbot endpoint will return 500 until it's configured."
        )
    else:
        logging.info("GEMINI_API_KEY found — chatbot ready.")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(internships.router, prefix="/api/internships", tags=["internships"])
app.include_router(contact.router, prefix="/api/contact", tags=["contact"])
app.include_router(chatbot.router, prefix="/api/chat", tags=["chatbot"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    # Prefer the PORT environment variable (Render and many PaaS provide it)
    try:
        port = int(os.getenv("PORT", "8000"))
    except ValueError:
        port = 8000

    # Log the binding so platform health checks can pick it up in logs
    logging.info("Starting Uvicorn on 0.0.0.0:%s", port)
    uvicorn.run(app, host="0.0.0.0", port=port)
