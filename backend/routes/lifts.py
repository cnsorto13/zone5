from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import Lift

# All routes here are prefixed with /lift-sessions
# kebab-case for URLs is standard REST convention
router = APIRouter(prefix="/lift-sessions", tags=["lift-sessions"])


# --- Schemas (Pydantic) ---

class LiftCreate(BaseModel):
    """Shape of the request body when creating or updating a lift session."""
    date: date
    type: str               # push | pull | legs | full | other
    rating: int | None = None   # 1–5 how the session felt
    notes: str | None = None


class LiftOut(LiftCreate):
    """Shape of the response — everything in LiftCreate plus id and created_at."""
    id: int
    created_at: str

    class Config:
        from_attributes = True  # allows Pydantic to read from SQLAlchemy model objects


# --- Routes ---

@router.get("/", response_model=list[LiftOut])
def list_lifts(db: Session = Depends(get_db)):
    """Return all lift sessions, newest first."""
    return db.query(Lift).order_by(Lift.date.desc()).all()


@router.post("/", response_model=LiftOut, status_code=201)
def create_lift(payload: LiftCreate, db: Session = Depends(get_db)):
    """Create a new lift session. Returns the created session including its new id."""
    lift = Lift(**payload.model_dump())
    db.add(lift)
    db.commit()
    db.refresh(lift)
    return lift


@router.get("/{lift_id}", response_model=LiftOut)
def get_lift(lift_id: int, db: Session = Depends(get_db)):
    """Return a single lift session by id. 404 if not found."""
    lift = db.query(Lift).filter(Lift.id == lift_id).first()
    if not lift:
        raise HTTPException(status_code=404, detail="Lift session not found")
    return lift


@router.put("/{lift_id}", response_model=LiftOut)
def update_lift(lift_id: int, payload: LiftCreate, db: Session = Depends(get_db)):
    """Update an existing lift session. Replaces all fields with the new payload."""
    lift = db.query(Lift).filter(Lift.id == lift_id).first()
    if not lift:
        raise HTTPException(status_code=404, detail="Lift session not found")
    for field, value in payload.model_dump().items():
        setattr(lift, field, value)
    db.commit()
    db.refresh(lift)
    return lift


@router.delete("/{lift_id}", status_code=204)
def delete_lift(lift_id: int, db: Session = Depends(get_db)):
    """Delete a lift session by id. Returns 204 No Content on success."""
    lift = db.query(Lift).filter(Lift.id == lift_id).first()
    if not lift:
        raise HTTPException(status_code=404, detail="Lift session not found")
    db.delete(lift)
    db.commit()
