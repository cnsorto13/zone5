from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import Run

# APIRouter groups all /runs routes together
# prefix means every route here automatically starts with /runs
router = APIRouter(prefix="/runs", tags=["runs"])


# --- Schemas (Pydantic) ---
# Schemas define what data looks like coming IN and going OUT of the API
# Pydantic validates automatically — if a field is wrong type, it rejects the request

class RunCreate(BaseModel):
    """Shape of the request body when creating or updating a run."""
    date: date
    distance_miles: float
    duration_seconds: int
    avg_hr: int | None = None   # optional — not every run has HR data
    feel: int | None = None     # 1–5 perceived effort
    notes: str | None = None


class RunOut(RunCreate):
    """Shape of the response — everything in RunCreate plus id and created_at."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # allows Pydantic to read from SQLAlchemy model objects


# --- Routes ---

@router.get("/", response_model=list[RunOut])
def list_runs(db: Session = Depends(get_db)):
    """Return all runs, newest first."""
    return db.query(Run).order_by(Run.date.desc()).all()


@router.post("/", response_model=RunOut, status_code=201)
def create_run(payload: RunCreate, db: Session = Depends(get_db)):
    """Create a new run. Returns the created run including its new id."""
    run = Run(**payload.model_dump())   # unpack the Pydantic model into the SQLAlchemy model
    db.add(run)
    db.commit()
    db.refresh(run)     # refresh pulls the DB-generated fields (id, created_at) back into the object
    return run


@router.get("/{run_id}", response_model=RunOut)
def get_run(run_id: int, db: Session = Depends(get_db)):
    """Return a single run by id. 404 if not found."""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@router.put("/{run_id}", response_model=RunOut)
def update_run(run_id: int, payload: RunCreate, db: Session = Depends(get_db)):
    """Update an existing run. Replaces all fields with the new payload."""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    # Loop over every field in the payload and apply it to the existing DB row
    for field, value in payload.model_dump().items():
        setattr(run, field, value)  # setattr(obj, "distance_miles", 6.2) same as obj.distance_miles = 6.2
    db.commit()
    db.refresh(run)
    return run


@router.delete("/{run_id}", status_code=204)
def delete_run(run_id: int, db: Session = Depends(get_db)):
    """Delete a run by id. Returns 204 No Content on success."""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    db.delete(run)
    db.commit()
