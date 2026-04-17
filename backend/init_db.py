"""
One-time script to create all database tables in Supabase.
Run this once from the backend/ directory:

    python init_db.py

SQLAlchemy reads all the models in models.py and creates the corresponding
tables in PostgreSQL. Safe to run multiple times — it skips tables that already exist.
"""

from database import engine, Base
import models  # noqa: F401 — import triggers model registration with Base

Base.metadata.create_all(bind=engine)
print("All tables created successfully.")
