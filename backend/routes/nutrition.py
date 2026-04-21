from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import Nutrition

# All routes here are prefixed with /nutrition
router = APIRouter(prefix="/nutrition", tags=["nutrition"])


# --- Schemas (Pydantic) ---

class NutritionCreate(BaseModel):
    """Shape of the request body when creating or updating a nutrition entry."""
    date: date
    calories: int | None = None
    protein_g: float | None = None
    carbs_g: float | None = None
    fat_g: float | None = None
    notes: str | None = None


class NutritionOut(NutritionCreate):
    """Shape of the response — everything in NutritionCreate plus id and created_at."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Routes ---

@router.get("/", response_model=list[NutritionOut])
def list_nutrition(db: Session = Depends(get_db)):
    """Return all nutrition entries, newest first."""
    return db.query(Nutrition).order_by(Nutrition.date.desc()).all()


@router.post("/", response_model=NutritionOut, status_code=201)
def create_nutrition(payload: NutritionCreate, db: Session = Depends(get_db)):
    """
    Create a nutrition entry for a given date.
    Only one entry allowed per day — returns 409 if that date already exists.
    Use PUT to update an existing entry.
    """
    existing = db.query(Nutrition).filter(Nutrition.date == payload.date).first()
    if existing:
        raise HTTPException(status_code=409, detail="Nutrition entry already exists for this date. Use PUT to update it.")
    entry = Nutrition(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/by-date", response_model=NutritionOut)
def get_nutrition_by_date(date: date, db: Session = Depends(get_db)):
    """Return the nutrition entry for a specific date. 404 if none exists."""
    entry = db.query(Nutrition).filter(Nutrition.date == date).first()
    if not entry:
        raise HTTPException(status_code=404, detail="No nutrition entry found for this date")
    return entry


@router.get("/{nutrition_id}", response_model=NutritionOut)
def get_nutrition(nutrition_id: int, db: Session = Depends(get_db)):
    """Return a single nutrition entry by id. 404 if not found."""
    entry = db.query(Nutrition).filter(Nutrition.id == nutrition_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Nutrition entry not found")
    return entry


@router.put("/{nutrition_id}", response_model=NutritionOut)
def update_nutrition(nutrition_id: int, payload: NutritionCreate, db: Session = Depends(get_db)):
    """Update an existing nutrition entry. Replaces all fields with the new payload."""
    entry = db.query(Nutrition).filter(Nutrition.id == nutrition_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Nutrition entry not found")
    for field, value in payload.model_dump().items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{nutrition_id}", status_code=204)
def delete_nutrition(nutrition_id: int, db: Session = Depends(get_db)):
    """Delete a nutrition entry by id. Returns 204 No Content on success."""
    entry = db.query(Nutrition).filter(Nutrition.id == nutrition_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Nutrition entry not found")
    db.delete(entry)
    db.commit()
