from dotenv import load_dotenv

# Load environment variables before importing any modules that depend on them
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.routes import projects, internships, contact, chatbot
import logging
import asyncio
import httpx

from contextlib import asynccontextmanager

async def keep_alive_task(client: httpx.AsyncClient):
    """Background task that pings the health endpoint every 14 minutes to prevent service inactivity."""
    await asyncio.sleep(60)  # Wait 1 minute after startup before first ping
    
    while True:
        try:
            # Get the service URL from environment or construct from PORT
            service_url = os.getenv("SERVICE_URL")
            if not service_url:
                port = os.getenv("PORT", "8000")
                service_url = f"http://localhost:{port}"
            
            response = await client.get(f"{service_url}/api/health")
            if response.status_code == 200:
                logging.info("Keep-alive ping successful")
            else:
                logging.warning(f"Keep-alive ping returned status {response.status_code}")
        except Exception as e:
            logging.error(f"Keep-alive ping failed: {e}")
        
        # Wait 14 minutes before next ping
        await asyncio.sleep(14 * 60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    # Validate critical environment variables early and log helpful messages.
    if not (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")):
        logging.warning(
            "GEMINI_API_KEY or GOOGLE_API_KEY not set. The chatbot endpoint will return 500 until it's configured."
        )
    else:
        logging.info("Gemini API key found — chatbot ready.")
    
    # Initialize shared AsyncClient
    async with httpx.AsyncClient(timeout=10.0) as client:
        app.state.http_client = client
        
        # Start the keep-alive background task
        asyncio.create_task(keep_alive_task(client))
        logging.info("Keep-alive task started — will ping every 14 minutes")
        
        yield
    # Shutdown logic
    logging.info("Shutting down — closing AsyncClient")

app = FastAPI(
    title="Shreyas Gowda Portfolio API", 
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/")
async def root():
    # Provide a lightweight 200 response at the root so platforms probing `/` get OK.
    return {"status": "ok", "service": "portfolio-backend"}

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
