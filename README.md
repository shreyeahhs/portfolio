# Shreyas Gowda — Portfolio

A modern, terminal-inspired portfolio website designed with glassmorphism aesthetics, intelligent motion, and an integrated AI chatbot powered by OpenAI.  
The interface blends developer console minimalism with smooth animations and data-driven components, all built through careful prompt engineering and front-end craftsmanship.

---

## Overview

This portfolio serves as an interactive showcase of my work in **AI, Data Science, and Full-Stack Development**, featuring:
- A **scroll-synced projects section** inspired by `factory.ai`
- A **draggable AI chatbot** that answers queries about my background, projects, and experience
- A **command-line interface (CLI mode)** for hidden interactions and navigation
- A focus on **clean UI motion**, **semantic accessibility**, and **performance**

The project was **vibe-coded** and refined through **prompt-engineered component generation**, ensuring a natural fusion between design intent and functional precision.

---

## Tech Stack

### Frontend
- **React + TypeScript + Vite** — Core framework and build tool  
- **Tailwind CSS + Framer Motion** — Styling and animation  
- **shadcn-ui** — Component styling and accessibility utilities  
- **React Router** — Page routing and transitions  
- **Custom hooks and context** for theme, console, and chat state  

### Backend
- **Python FastAPI** — API framework for chat, projects, and contact modules  
- **OpenAI GPT-4o-mini** — AI conversational model powering the chatbot  
- **Uvicorn** — ASGI server for local and production deployment  
- **CORS middleware** — Secure communication with the frontend  

---

## Project Structure

```

├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── data/
│   │   └── styles/
│   ├── public/
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   ├── models/
│   │   └── services/
│   ├── requirements.txt
│   └── .env.example
│
└── README.md

````

---

## Setup and Development

### Frontend Setup

```bash
npm install
npm run dev
````

Runs on **[http://localhost:5173](http://localhost:5173)**

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your OPENAI_API_KEY to .env
uvicorn app.main:app --reload --port 8000
```

Runs on **[http://localhost:8000](http://localhost:8000)**
API documentation available at **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

## Environment Variables

### Frontend (`.env`)

```
VITE_API_URL=http://localhost:8000
```

### Backend (`backend/.env`)

```
PORT=8000
FRONTEND_ORIGIN=http://localhost:5173
OPENAI_API_KEY=your_openai_key_here
```

---

## Core Features

### Terminal-Inspired Interface

A console-style UI that simulates command-line interactions, complete with mono typography, neon accents, and smooth scroll-sync between sections.

### AI Chatbot

Built using **OpenAI’s GPT-4o-mini**, the chatbot answers questions about my work, technologies, and background.
It supports conversational memory and adaptive tone.

### Projects & Internships

Dynamic data-driven components display live project and internship details pulled from JSON or API endpoints.
Each section uses **Framer Motion** for reveal animations and maintains a consistent visual hierarchy.

### Experience Timeline

Innovative vertical layout that adapts dynamically to show parallel experiences.
Built for clarity, accessibility, and clean animation.

### Contact Section

Validates form inputs client-side before sending POST requests to the FastAPI backend.
Includes error handling and success toasts.

### Console Easter Egg

Press `/` to open a hidden **ASCII console** supporting commands such as:

```
whoami
theme dark|light|neon
sudo hire shreyas
fortune
```

The console is fully keyboard accessible and non-blocking to the rest of the page.

---

## API Endpoints

| Endpoint               | Method | Description            |
| ---------------------- | ------ | ---------------------- |
| `/api/health`          | GET    | Health check           |
| `/api/projects`        | GET    | List all projects      |
| `/api/projects/{slug}` | GET    | Get project by slug    |
| `/api/internships`     | GET    | List all internships   |
| `/api/contact`         | POST   | Submit contact form    |
| `/api/chat`            | POST   | Chat with AI assistant |

---

## Deployment

### Frontend

Deploy easily via **Netlify**, **Vercel**, or directly through **[Lovable](https://lovable.dev/projects/87dca356-5a55-4783-850f-6c8c60e4ce4e)**.

### Backend

Deploy with **Render**, **Railway**, or **Fly.io**.
Ensure the environment variables are configured for CORS and OpenAI API key.

---

## Design Notes

* Built with **glassmorphism** for layered depth and modern feel.
* Backgrounds feature subtle **slanted diagonal patterns** for texture.
* Animations respect `prefers-reduced-motion` for accessibility.
* Fully responsive for all breakpoints (mobile-first).
* No UI frameworks beyond **TailwindCSS** and **shadcn**, ensuring total control over the design system.

---

## License

MIT License — Free to use, fork, and modify with credit.

---

Built with ❤️ by **Shreyas Gowda**
