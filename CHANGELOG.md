# Changelog

All technical changes to Zone 5 are documented here.
Format: version · date · what changed · why

---

## [v0.2] — 2026-04-17

### Backend
- Scaffolded full FastAPI backend under `backend/`
- `main.py` — app entry point, CORS middleware, router registration
- `database.py` — SQLAlchemy engine, session factory, `get_db` dependency
- `models.py` — ORM models for all 5 tables: `runs`, `lifts`, `nutrition`, `sleep`, `weight`
- Full CRUD routes for all 5 resources (`routes/runs.py`, `lifts.py`, `nutrition.py`, `sleep.py`, `weight.py`)
- `nutrition`, `sleep`, `weight` enforce one entry per day — returns 409 on duplicate date
- Added `/by-date` lookup endpoint on `nutrition`, `sleep`, `weight`
- `init_db.py` — one-time script to create all tables in Supabase via SQLAlchemy

### Database
- Supabase project created (`Zone 5`, West US Oregon)
- All 5 tables created in PostgreSQL via `init_db.py`
- `.env` wired with `DATABASE_URL` — excluded from version control via `.gitignore`
- `.env.example` added as connection string template for repo cloners

### Dependencies
- Switched from `psycopg2-binary` to `psycopg[binary]==3.3.3` for Python 3.12+ compatibility
- Backend requires Python 3.12 — `venv` created locally with `/opt/homebrew/bin/python3.12`

### Documentation
- Added `CLAUDE.md` — engineering instructions and project context for Claude

---

## [v0.1] — 2026-04-16

### Architecture
- Scoped full system architecture: React + Vite frontend, FastAPI backend, PostgreSQL via Supabase
- Hosting decided: Vercel (frontend), Render (backend)
- Design tool stack locked: Figma for product UI, Canva Pro for marketing/creative

### Data Model
- Locked schema for all 5 core tables: `runs`, `lift_sessions`, `nutrition`, `sleep`, `weight`
- All tables include `user_id` for future multi-user support
- `runs` — added `planned_distance` vs `actual`, `skipped` + `skip_reason` for missed runs
- `lift_sessions` — Option A (session-level), designed to scale to `lift_exercises` (Option B) additively
- `nutrition` — calories required, macros optional
- `sleep` — bedtime, wake time, hours, quality
- `weight` — daily weigh-ins, body fat optional

### API Design
- Locked endpoints for all 5 pillars: runs, lift-sessions, nutrition, sleep, weight
- Standard CRUD per resource, date-based lookup for nutrition/sleep/weight
- Dashboard deferred to Phase 3 — will use a dedicated `/dashboard` endpoint
- No pagination — revisit at Phase 3 when data volume warrants it

### Caching Strategy
- React Query selected as caching layer
- Cache-first, stale-while-revalidate pattern
- Design principle: only hit the API when necessary — speed, UX, cost savings

### Frontend
- Pages scoped: dashboard, log, history, analytics, timeline
- Frontend structure pending Figma designs before build begins

### Documentation
- Created `CHANGELOG.md` (this file) — technical versioning
- Created `STORY.md` — curated narrative for public timeline
