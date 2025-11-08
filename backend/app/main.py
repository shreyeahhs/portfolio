from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import projects, internships, contact, chatbot
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Shreyas Gowda Portfolio API", version="1.0.0")

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
    uvicorn.run(app, host="0.0.0.0", port=8000)
