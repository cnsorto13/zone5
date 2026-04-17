from datetime import date, time
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import Sleep

# All routes here are prefixed with /sleep
router = APIRouter(prefix="/sleep", tags=["sleep"])


# --- Schemas (Pydantic) ---

class SleepCreate(BaseModel):
    """Shape of the request body when creating or updating a sleep entry."""
    date: date              # the date you woke up
    bedtime: time | None = None
    wake_time: time | None = None
    hours: float | None = None
    quality: int | None = None  # 1–5 sleep quality rating
    notes: str | None = None


class SleepOut(SleepCreate):
    """Shape of the response — everything in SleepCreate plus id and created_at."""
    id: int
    created_at: str

    class Config:
        from_attributes = True


# --- Routes ---

@router.get("/", response_model=list[SleepOut])
def list_sleep(db: Session = Depends(get_db)):
    """Return all sleep entries, newest first."""
    return db.query(Sleep).order_by(Sleep.date.desc()).all()


@router.post("/", response_model=SleepOut, status_code=201)
def create_sleep(payload: SleepCreate, db: Session = Depends(get_db)):
    """
    Create a sleep entry for a given date.
    Only one entry allowed per day — returns 409 if that date already exists.
    Use PUT to update an existing entry.
    """
    existing = db.query(Sleep).filter(Sleep.date == payload.date).first()
    if existing:
        raise HTTPException(status_code=409, detail="Sleep entry already exists for this date. Use PUT to update it.")
    entry = Sleep(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/by-date", response_model=SleepOut)
def get_sleep_by_date(date: date, db: Session = Depends(get_db)):
    """Return the sleep entry for a specific date. 404 if none exists."""
    entry = db.query(Sleep).filter(Sleep.date == date).first()
    if not entry:
        raise HTTPException(status_code=404, detail="No sleep entry found for this date")
    return entry


@router.get("/{sleep_id}", response_model=SleepOut)
def get_sleep(sleep_id: int, db: Session = Depends(get_db)):
    """Return a single sleep entry by id. 404 if not found."""
    entry = db.query(Sleep).filter(Sleep.id == sleep_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Sleep entry not found")
    return entry


@router.put("/{sleep_id}", response_model=SleepOut)
def update_sleep(sleep_id: int, payload: SleepCreate, db: Session = Depends(get_db)):
    """Update an existing sleep entry. Replaces all fields with the new payload."""
    entry = db.query(Sleep).filter(Sleep.id == sleep_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Sleep entry not found")
    for field, value in payload.model_dump().items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{sleep_id}", status_code=204)
def delete_sleep(sleep_id: int, db: Session = Depends(get_db)):
    """Delete a sleep entry by id. Returns 204 No Content on success."""
    entry = db.query(Sleep).filter(Sleep.id == sleep_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Sleep entry not found")
    db.delete(entry)
    db.commit()
