"""
SQLAlchemy ORM models — one class per database table.
Each class here maps directly to a table in PostgreSQL (Supabase).
When you add a column here, it gets added to the real table on the next migration.
"""

from datetime import date, datetime, time
from sqlalchemy import Date, DateTime, Float, Integer, String, Text, Time, func
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class Run(Base):
    """Maps to the 'runs' table. One row = one run session."""
    __tablename__ = "runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    distance_miles: Mapped[float] = mapped_column(Float, nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)  # raw seconds — pace is calculated in the app
    avg_hr: Mapped[int | None] = mapped_column(Integer, nullable=True)      # heart rate in BPM, optional
    feel: Mapped[int | None] = mapped_column(Integer, nullable=True)        # 1–5 how the run felt
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())  # set automatically by the DB


class Lift(Base):
    """Maps to the 'lifts' table. One row = one strength training session."""
    __tablename__ = "lifts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)           # push | pull | legs | full | other
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)      # 1–5 how the session felt
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Nutrition(Base):
    """Maps to the 'nutrition' table. One row = one day of eating."""
    __tablename__ = "nutrition"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, unique=True)   # unique = only one entry per day
    calories: Mapped[int | None] = mapped_column(Integer, nullable=True)
    protein_g: Mapped[float | None] = mapped_column(Float, nullable=True)
    carbs_g: Mapped[float | None] = mapped_column(Float, nullable=True)
    fat_g: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Sleep(Base):
    """Maps to the 'sleep' table. One row = one night of sleep."""
    __tablename__ = "sleep"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, unique=True)   # the date you woke up, one entry per day
    bedtime: Mapped[time | None] = mapped_column(Time, nullable=True)
    wake_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    quality: Mapped[int | None] = mapped_column(Integer, nullable=True)     # 1–5 sleep quality rating
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Weight(Base):
    """Maps to the 'weight' table. One row = one day's body metrics."""
    __tablename__ = "weight"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, unique=True)   # one entry per day
    weight_lbs: Mapped[float] = mapped_column(Float, nullable=False)
    body_fat_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
