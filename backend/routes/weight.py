from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import Weight

# All routes here are prefixed with /weight
router = APIRouter(prefix="/weight", tags=["weight"])


# --- Schemas (Pydantic) ---

class WeightCreate(BaseModel):
    """Shape of the request body when creating or updating a weight entry."""
    date: date
    weight_lbs: float
    body_fat_pct: float | None = None   # optional — not everyone tracks body fat
    notes: str | None = None


class WeightOut(WeightCreate):
    """Shape of the response — everything in WeightCreate plus id and created_at."""
    id: int
    created_at: str

    class Config:
        from_attributes = True


# --- Routes ---

@router.get("/", response_model=list[WeightOut])
def list_weight(db: Session = Depends(get_db)):
    """Return all weight entries, newest first."""
    return db.query(Weight).order_by(Weight.date.desc()).all()


@router.post("/", response_model=WeightOut, status_code=201)
def create_weight(payload: WeightCreate, db: Session = Depends(get_db)):
    """
    Create a weight entry for a given date.
    Only one entry allowed per day — returns 409 if that date already exists.
    Use PUT to update an existing entry.
    """
    existing = db.query(Weight).filter(Weight.date == payload.date).first()
    if existing:
        raise HTTPException(status_code=409, detail="Weight entry already exists for this date. Use PUT to update it.")
    entry = Weight(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/by-date", response_model=WeightOut)
def get_weight_by_date(date: date, db: Session = Depends(get_db)):
    """Return the weight entry for a specific date. 404 if none exists."""
    entry = db.query(Weight).filter(Weight.date == date).first()
    if not entry:
        raise HTTPException(status_code=404, detail="No weight entry found for this date")
    return entry


@router.get("/{weight_id}", response_model=WeightOut)
def get_weight(weight_id: int, db: Session = Depends(get_db)):
    """Return a single weight entry by id. 404 if not found."""
    entry = db.query(Weight).filter(Weight.id == weight_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Weight entry not found")
    return entry


@router.put("/{weight_id}", response_model=WeightOut)
def update_weight(weight_id: int, payload: WeightCreate, db: Session = Depends(get_db)):
    """Update an existing weight entry. Replaces all fields with the new payload."""
    entry = db.query(Weight).filter(Weight.id == weight_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Weight entry not found")
    for field, value in payload.model_dump().items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{weight_id}", status_code=204)
def delete_weight(weight_id: int, db: Session = Depends(get_db)):
    """Delete a weight entry by id. Returns 204 No Content on success."""
    entry = db.query(Weight).filter(Weight.id == weight_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Weight entry not found")
    db.delete(entry)
    db.commit()
