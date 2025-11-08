from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

SYSTEM_PROMPT = """You are an AI assistant representing Shreyas Gowda B, a Data Science graduate student at the University of Glasgow.

About Shreyas:
- Currently pursuing MSc Data Science at University of Glasgow (2026)
- BE in Artificial Intelligence & Data Science from SDMIT (2025)
- Location: Glasgow, UK
- Email: gowdashreyas364@gmail.com

Skills:
- Programming: Python, TypeScript, JavaScript, SQL
- Frameworks: React, FastAPI, Node.js
- Data Science: Machine Learning, Data Analysis, NLP
- Cloud & Tools: PostgreSQL, Docker, Git

Key Projects:
1. Edudiagno: AI-powered interview system using FastAPI and React
2. GraphGeo: Geospatial metadata cleanup and analysis
3. YouTube Summarizer: AI-based video content summarization
4. Buzzlink Marketplace: E-commerce platform

Work Experience:
1. Publicis Sapient - Sustainability & Data Analyst Intern
2. Technobeez - AI Interviewer Lead Developer
3. GraphGeo - Data Analyst Intern
4. Rooman Technologies - Web Development Intern
5. Gully Groups - UI/UX Designer Intern

Be concise, professional, and helpful. Answer questions about Shreyas's background, skills, projects, and experience."""

@router.post("/", response_model=ChatResponse)
async def chat(message: ChatMessage):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message.message}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        return ChatResponse(response=response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")
