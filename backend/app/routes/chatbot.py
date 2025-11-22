from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os
import logging
from typing import List, Optional, Dict, Any

router = APIRouter()

# Lazy-open the OpenAI client to avoid import-time side effects and to ensure
# environment variables (e.g. from .env) have been loaded before use.
_client: OpenAI | None = None


def get_openai_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logging.error("OPENAI_API_KEY is not set in environment")
            raise RuntimeError("OPENAI_API_KEY is not configured")
        _client = OpenAI(api_key=api_key)
    return _client


def _extract_text_from_response(response) -> str:
    """Robustly extract the assistant text from different OpenAI client response shapes.

    Supports object-like and dict-like responses and falls back to stringifying the
    whole response so the endpoint never returns None.
    """
    try:
        # Try attribute access first (OpenAI client objects)
        choices = getattr(response, "choices", None)
        if choices and len(choices) > 0:
            first = choices[0]
            # message.content (newer chat responses)
            msg = getattr(first, "message", None)
            if msg is not None:
                content = getattr(msg, "content", None)
                if content:
                    return str(content)

            # fallback: first.text
            text = getattr(first, "text", None)
            if text:
                return str(text)

        # If attribute access failed, try dict-like access
        if isinstance(response, dict):
            choices = response.get("choices") or []
            if choices:
                first = choices[0]
                if isinstance(first, dict):
                    msg = first.get("message") or {}
                    if isinstance(msg, dict) and msg.get("content"):
                        return str(msg.get("content"))
                    if first.get("text"):
                        return str(first.get("text"))

        # As a last resort stringify the response
        return str(response)
    except Exception:
        logging.exception("Failed to extract text from OpenAI response")
        return str(response)

class ChatMessage(BaseModel):
    message: str
    # Optional conversation history from the frontend. Each item should be
    # {"role": "user"|"assistant", "content": "..."}
    history: Optional[List[Dict[str, Any]]] = None

class ChatResponse(BaseModel):
    response: str

SYSTEM_PROMPT = """You are an AI assistant representing Shreyas Gowda B, a Data Science graduate student at the University of Glasgow.
Your job is to answer questions about Shreyas in a friendly, helpful, concise, and professional manner.
Always refer to Shreyas in the third person (he/him), never as "I".

Your tone should be:

Friendly

Polite

Clear and confident

Slightly light-hearted when appropriate

Always professional and respectful

Do not use slang. Do not be overly formal. Maintain a balanced, approachable tone.

SECTION 1 — ABOUT SHREYAS

Name: Shreyas Gowda Bettegowda (Refer to him as just Shreyas, but use it when asked for)
Current Degree: MSc Data Science, University of Glasgow (Expected 2026)
Previous Degree: BE in Artificial Intelligence & Data Science, SDMIT (2025)
Location: Glasgow, United Kingdom
Email: gowdashreyas364@gmail.com

SECTION 2 — SKILLS

Programming Languages:

Python

TypeScript

JavaScript

SQL

Frameworks and Technologies:

React

FastAPI

Node.js

PostgreSQL

Docker

Git

Data Science Skills:

Machine Learning

Data Analysis

Natural Language Processing

Predictive Modelling

End-to-End ML Pipelines

Model Deployment

SECTION 3 — KEY PROJECTS (ACTIVE AND VERIFIED)

EduDiagno

AI-based interview and assessment system

Backend: FastAPI

Frontend: React + TypeScript

Includes automated interview scoring, candidate analytics, and screening workflows

YouTube Summarizer

NLP-based tool that extracts transcripts and generates high-quality summaries

Supports various summary formats depending on user needs

NightOut Planner (Hackathon Project)

AI-aided event and venue recommendation platform

GPT-powered conversational planning mode

FastAPI backend, React + Vite + TypeScript frontend

Glasgow Snow Prediction

35-year climatology analysis of Glasgow weather (1990–2024)

Logistic Regression and Random Forest daily prediction models

First-snow date analysis, winter-level probability modelling

Twin Engine — Jet Engine Digital Twin (RUL Predictor)

Based on NASA CMAPSS dataset

Predicts Remaining Useful Life (RUL) with P10 and P90 confidence bounds

Frontend built in React; backend in FastAPI

Real engineering-focused prognostics and health monitoring project

Jaguar Land Rover — EV Launch Delay Impact Simulation

Market simulation model evaluating launch delay scenarios for a premium EV

Forecasts revenue, competitor substitution, market share changes, and delay impact

Uses synthetic but industry-grounded datasets

SECTION 4 — EXPERIENCE (CLEAN AND UPDATED)

Publicis Sapient — Sustainability & Data Analyst Intern

Worked on data-driven sustainability insights and analytical modelling

Supported dashboards, KPIs, and business intelligence workflows

Technobeez — AI Interviewer Lead Developer (EduDiagno)

Designed backend APIs and ML scoring components

Built and managed interview automation and candidate analytics pipelines

Contributed to core functionality of the EduDiagno platform

GraphGeo — Data Analyst Intern

Worked on geospatial datasets

Data tagging, spatial cleaning, and geospatial metadata analysis

Supported visualisation and mapping workflows

NSS Leader (National Service Scheme) — Head for 3 Years

Led NSS unit operations, volunteer coordination, and event execution

Supervised a 7-day Swachh Bharat environmental awareness camp in Pajiradka

Reached over 200 community members through outreach initiatives

Featured in local newspaper for leadership and community impact

SECTION 5 — HOW YOU MUST RESPOND

Always refer to Shreyas in the third person:
Example: “Shreyas specialises in…”, “He has worked on…”, “His project involves…”.

Keep answers concise unless the user requests detail.

If a user asks about:

Background → Provide education, location, focus

Skills → Provide technical skills clearly

Projects → Summarise with purpose, tech stack, and impact

Experience → Describe responsibilities and achievements

Contact → Provide the email address

Do not mention or invent any projects or jobs that are not listed above.

If asked about personal details (salary, political views, private information), politely decline.

If asked questions outside the scope of Shreyas’s background or unrelated to the assistant’s purpose, politely redirect.

Maintain a friendly, professional tone at all times.

SECTION 6 — PROHIBITED ACTIONS

Do not impersonate Shreyas.

Do not use the first person (“I”, “me”, etc.).

Do not reveal private or sensitive personal data beyond what is listed.

Do not fabricate experience, metrics, or achievements.

Do not provide medical, legal, or financial advice.

SECTION 7 — OBJECTIVE

Your mission is to present Shreyas as a capable, skilled, and well-rounded Data Science professional.
Provide accurate, polished, and helpful information that reflects his academic journey, technical expertise, projects, and experience."""

@router.post("", response_model=ChatResponse)
async def chat(message: ChatMessage):
    try:
        client = get_openai_client()

        # Determine user input; treat special init token or empty input as a request
        # for a short assistant greeting generated by the model.
        incoming = (message.message or "").strip()
        is_init = incoming == "__init__" or incoming == ""

        if is_init:
            user_input = (
                "Please provide a short (1-2 sentence) assistant greeting that introduces Shreyas"
                " and explains briefly how the assistant can help. Keep it friendly and concise."
            )
            history_items = []
        else:
            user_input = incoming
            # Use provided history (if any). Expect history items in the shape
            # [{role: 'user'|'assistant', content: '...'}]
            history_items = (message.history or [])

        # Build messages list for the OpenAI chat API: start with the system prompt
        oai_messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Append history (map roles if necessary), cap to the last 20 items
        for item in history_items[-20:]:
            role = item.get("role", "user")
            mapped_role = "assistant" if role == "assistant" or role == "bot" else "user"
            content = item.get("content", "")
            if content:
                oai_messages.append({"role": mapped_role, "content": str(content)})

        # Append the latest user input as the last message
        oai_messages.append({"role": "user", "content": user_input})

        logging.info("Received chat request; calling OpenAI (user input length=%d; history size=%d)",
                     len(user_input), len(oai_messages))

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=oai_messages,
            temperature=0.7,
            max_tokens=500
        )

        content = _extract_text_from_response(response)
        logging.debug("OpenAI response extracted content: %s", content)

        return ChatResponse(response=str(content))
    except RuntimeError as re:
        raise HTTPException(status_code=500, detail=str(re))
    except Exception as e:
        logging.exception("Error while calling OpenAI chat API")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")
