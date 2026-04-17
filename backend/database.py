import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

# Load the .env file so DATABASE_URL is available as an environment variable
load_dotenv()

# Read the database connection string from the environment
DATABASE_URL = os.getenv("DATABASE_URL")

# The engine is the actual connection to PostgreSQL (Supabase)
# It handles opening and closing connections under the hood
engine = create_engine(DATABASE_URL)

# SessionLocal is a factory — every time we need to talk to the DB,
# we create a new session from this factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Base is the parent class all our models (tables) inherit from
# SQLAlchemy uses it to track which classes map to which tables
class Base(DeclarativeBase):
    pass


def get_db():
    """
    Dependency function used by FastAPI routes.
    Opens a DB session before each request, closes it when the request is done.
    The 'yield' makes this a generator — FastAPI handles the open/close automatically.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
