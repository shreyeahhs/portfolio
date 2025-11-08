from fastapi import APIRouter
import json
from pathlib import Path

router = APIRouter()

DATA_FILE = Path(__file__).parent.parent / "data" / "internships.json"

def load_internships():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

@router.get("/")
async def get_internships():
    return load_internships()
