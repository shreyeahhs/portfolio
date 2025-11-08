from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

router = APIRouter()

class ContactMessage(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=1000)

@router.post("/")
async def submit_contact(contact: ContactMessage):
    # Console mailer for now
    print("\n=== New Contact Message ===")
    print(f"Name: {contact.name}")
    print(f"Email: {contact.email}")
    print(f"Message: {contact.message}")
    print("==========================\n")
    
    return {"ok": True, "message": "Message received successfully"}
