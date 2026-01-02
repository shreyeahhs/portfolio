from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import logging
from typing import List, Optional, Dict, Any
from google import genai

router = APIRouter()


def _extract_text_from_gemini_response(data: Dict[str, Any]) -> str:
    """Extract text from Gemini/Generative Language API responses.

    This function handles multiple response shapes returned by different
    Gemini model versions (e.g. `candidates[].content.parts`, `message.content.parts`,
    `output[].content.parts`, or simple string content).
    """

    try:
        # candidates (common modern shape)
        candidates = data.get("candidates")
        if isinstance(candidates, list) and len(candidates) > 0:
            first = candidates[0]

            # content can be a plain string
            content = first.get("content")
            if isinstance(content, str):
                return content

            # content can be a dict with 'parts'
            if isinstance(content, dict):
                parts = content.get("parts") or content.get("content") or []
                if isinstance(parts, list) and len(parts) > 0:
                    texts: List[str] = []
                    for p in parts:
                        if isinstance(p, dict) and p.get("text"):
                            texts.append(str(p.get("text")))
                        elif isinstance(p, str):
                            texts.append(p)
                    if texts:
                        return "".join(texts)
                if isinstance(content.get("text"), str):
                    return content.get("text")

            # content can be a list of content blocks
            if isinstance(content, list) and len(content) > 0:
                c0 = content[0]
                if isinstance(c0, dict) and c0.get("text"):
                    return str(c0["text"])
                if isinstance(c0, dict) and c0.get("parts"):
                    parts = c0.get("parts")
                    texts = [p.get("text") for p in parts if isinstance(p, dict) and p.get("text")]
                    if texts:
                        return "".join(texts)

        # message path (older or alternate shapes)
        msg = data.get("message")
        if isinstance(msg, dict):
            cont = msg.get("content")
            if isinstance(cont, str):
                return cont
            if isinstance(cont, dict) and cont.get("parts"):
                parts = cont.get("parts")
                texts = [p.get("text") for p in parts if isinstance(p, dict) and p.get("text")]
                if texts:
                    return "".join(texts)
            if isinstance(cont, list) and len(cont) > 0:
                first_cont = cont[0]
                if isinstance(first_cont, dict) and first_cont.get("text"):
                    return str(first_cont.get("text"))
                if isinstance(first_cont, dict) and first_cont.get("parts"):
                    parts = first_cont.get("parts")
                    texts = [p.get("text") for p in parts if isinstance(p, dict) and p.get("text")]
                    if texts:
                        return "".join(texts)

        # output path
        out = data.get("output")
        if isinstance(out, list) and len(out) > 0:
            o0 = out[0]
            cont = o0.get("content") if isinstance(o0, dict) else None
            if isinstance(cont, str):
                return cont
            if isinstance(cont, dict) and cont.get("parts"):
                parts = cont.get("parts")
                texts = [p.get("text") for p in parts if isinstance(p, dict) and p.get("text")]
                if texts:
                    return "".join(texts)
            if isinstance(cont, list) and len(cont) > 0:
                first_c = cont[0]
                if isinstance(first_c, dict) and first_c.get("text"):
                    return str(first_c.get("text"))
                if isinstance(first_c, dict) and first_c.get("parts"):
                    parts = first_c.get("parts")
                    texts = [p.get("text") for p in parts if isinstance(p, dict) and p.get("text")]
                    if texts:
                        return "".join(texts)

        # Deep fallback: find 'text' fields anywhere in the payload
        def _deep_collect_text(obj: Any) -> List[str]:
            texts: List[str] = []
            if isinstance(obj, dict):
                for k, v in obj.items():
                    if k == "text" and isinstance(v, str):
                        texts.append(v)
                    else:
                        texts.extend(_deep_collect_text(v))
            elif isinstance(obj, list):
                for item in obj:
                    texts.extend(_deep_collect_text(item))
            return texts

        found_texts = _deep_collect_text(data)
        if found_texts:
            return "\n".join(found_texts[:5])

        # final fallback
        return str(data)

    except Exception:
        logging.exception("Failed to extract text from Gemini response")
        return str(data)


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

AWS

Git

Data Science Skills:

Machine Learning

Power BI

DAX

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

Hospital Patient Experience Survey Analytics

Power BI dashboard analyzing patient experience across multiple hospitals

Focuses on physical/environmental needs and treatment effectiveness

Comparative and exploratory analysis using sample NHS-style data

SEN Pupils Analysis

Power BI study of Special Educational Needs (SEN) in England

Reveals structural patterns, inequalities, and PRU risk factors

Highlights educational support challenges and demographic disparities

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
        incoming = (message.message or "").strip()
        is_init = incoming == "__init__" or incoming == ""

        if is_init:
            user_input = (
                "Please provide a short (1-2 sentence) assistant greeting that introduces Shreyas "
                "and explains briefly how the assistant can help. Keep it friendly and concise."
            )
            history_items: List[Dict[str, Any]] = []
        else:
            user_input = incoming
            history_items = (message.history or [])

        # Build a single text payload combining system prompt, history, and latest user input.
        parts: List[str] = ["SYSTEM PROMPT:\n", SYSTEM_PROMPT, "\n\n"]
        if history_items:
            parts.append("CONVERSATION HISTORY:\n")
            for item in history_items[-20:]:
                role = item.get("role", "user")
                speaker = "Assistant" if role in ("assistant", "bot") else "User"
                content = item.get("content", "")
                parts.append(f"{speaker}: {content}\n")
            parts.append("\n")

        parts.append(f"User: {user_input}\n")
        combined_text = "\n".join(parts)

        # ✅ Gemini model using Google GenAI SDK
        model = (
            os.getenv("GEMINI_MODEL")
            or os.getenv("GOOGLE_GEMINI_MODEL")
            or "gemini-2.5-flash"
        )

        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            logging.error("GEMINI_API_KEY (or GOOGLE_API_KEY) is not set in environment")
            raise RuntimeError("GEMINI_API_KEY is not configured")

        logging.info(
            "Received chat request; calling Gemini (model=%s, user_input_len=%d, history_size=%d)",
            model,
            len(user_input),
            len(history_items),
        )

        # Initialize the Gemini API client
        client = genai.Client(api_key=api_key)
        
        # Generate content using the Google GenAI SDK
        response = client.models.generate_content(
            model=model,
            contents=combined_text
        )

        content = response.text
        logging.debug("Gemini response content: %s", content)

        return ChatResponse(response=str(content))

    except RuntimeError as re:
        raise HTTPException(status_code=500, detail=str(re))
    except Exception as e:
        logging.exception("Error while calling Gemini chat API")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")
