# Changelog

All technical changes to Zone 5 are documented here.
Format: version · date · what changed · why

---

## [v0.3] — 2026-04-18

### Frontend
- Scaffolded Vite + React frontend under `frontend/`
- `src/tokens.css` — full Sorto Design System token set (colors, type, spacing, radii, shadows)
- `src/index.css` — global reset wired to brand tokens
- React Router v6 configured — 5 routes: `/`, `/log`, `/history`, `/analytics`, `/timeline`
- `TopNav` component — sticky nav, active route underline indicator, date display
- `Ring` component — SVG progress ring (used for calorie tracking)
- `Sparkline` component — lightweight SVG polyline chart (used for weight trend)
- Dashboard page built on V6 wireframe layout (editorial hero + narrative timeline)
- Hero section: dark `#1C0F07` background, three-column big-number layout
  - Philippine Gold `#D4780A` for training and calorie stats
  - Papel Picado `#8B1A6B` reserved for NYC marathon countdown — the one altar pop
- Timeline: narrative day-as-it-unfolds with logged/active/pending states
- Sidebar: calendar week strip, coach signal card, day-at-a-glance grid
- Log, History, Analytics, Timeline pages stubbed — ready for Phase 2 build-out
- All data is mock — API wiring planned for Phase 2

### Design
- Brand kit imported from Sorto Design System handoff (SortoLiving property)
- Design direction locked: V6 hybrid (V3 big-number hero + V4 narrative timeline)
- Wireframes sourced from Claude Design export (5 low-fi directions explored)
- Decided to skip Figma iteration — build directly in React against brand tokens

### Documentation
- `CLAUDE.md` updated to reflect Phase 1 frontend scaffold complete

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
