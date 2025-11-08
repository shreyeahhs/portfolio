from fastapi import APIRouter, HTTPException
import json
from pathlib import Path

router = APIRouter()

DATA_FILE = Path(__file__).parent.parent / "data" / "projects.json"

def load_projects():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

@router.get("/")
async def get_projects():
    return load_projects()

@router.get("/{slug}")
async def get_project(slug: str):
    projects = load_projects()
    project = next((p for p in projects if p["slug"] == slug), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
