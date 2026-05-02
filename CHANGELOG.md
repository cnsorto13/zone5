# Changelog

All technical changes to Zone 5 are documented here.
Format: version · date · what changed · why

---

## [v0.7] — 2026-05-01

### Design System
- `tokens.css` — expanded Sorto Design System tokens: full warm-sand/parchment/volcanic tint scales (10–80), type scale (`--size-display-xl` through `--size-micro`), weight/line-height/letter-spacing tokens, motion (`--ease-sorto`, duration tokens), extended shadows, layout tokens (`--maxw-editorial/content/marketing`, `--gutter`), `.sorto-dark` dark mode class
- `index.css` — wired h1–h4 base styles to type scale tokens; link styles to `--link`/`--link-hover`; `:focus-visible` ring to `--focus-ring` (Philippine Gold)

### Components
- `SunMark.jsx` — new shared SVG component; 8-ray sun in Philippine Gold; used as a brand throughline across Log and Dashboard
- `TopNav.jsx` / `TopNav.module.css` — redesigned brand mark: SunMark + "Zone *5*" (italic 5 in anchor green) + "SORTOLIVING" eyebrow tag; CS monogram avatar replacing generic dot

### Log Page
- `Log.jsx` — full redesign from Claude Design handoff; 5-tab system with `01`–`05` numerals (italic + underline on active tab); per-tab card with fade-in animation; SunMark corner accent
  - RunForm: 4-col grid (date / distance / duration / HR), feel segment picker (1–5), notes
  - LiftForm: 2-col (date, type dropdown), rating picker, notes
  - NutritionForm: date, 4-col macro inputs (calories / protein / carbs / fat), live macro split bar
  - SleepForm: date + big hours display + range slider, bedtime/wake inputs, quality picker, notes
  - WeightForm: 3-col (date / weight / body fat optional), notes
- `Log.module.css` — full rewrite: underline-only input pattern, tabbed card system, feel segment animation, macro bar, submit row with ghost/primary buttons

### Dashboard Page
- `Dashboard.jsx` — full redesign from Claude Design handoff; all existing `useQuery` hooks preserved, real API data wired throughout
  - Greeting block: time-of-day greeting ("Good morning/afternoon/evening,"), italic anchor-green name, serif sub-copy from plan context, "Log a meal" + primary CTA buttons
  - TodayRunCard (dark volcanic, 6 of 12 cols): shows actual run or planned target with 4-stat row (distance / pace / HR / time); SunMark corner accent; altar-red eyebrow rule
  - CaloriesRingCard (3 cols): SVG circle progress ring wired to real `nutrition` data; macro bars (carbs/protein/fat) with per-goal progress fills; kcal remaining footer row
  - NYCCountdownCard (3 cols): big days number in anchor green; weeks/days sub-line; phase ribbon (Base → Build → Peak → Taper) with diagonal stripe for current block
  - DayTimeline: hour-anchored vertical timeline (5a–10p), spine line, "Now" badge on altar-red current-time rule; events positioned by fractional hour with big run card (dark), food/sleep nodes
  - WeekCalendar: 7-day grid from actual `runsList` + training plan; intensity bars color-coded by run type (easy=forest, tempo=altar-red, long=mahogany, recovery=warm-sand); today cell highlighted; mileage done/total header
  - CoachSignal: dark volcanic card with real plan quote, altar-red rule, week/sleep/fuel signal grid
  - Glance: 6-metric 2×3 icon grid (runs/calories/sleep/weight/protein/days to NYC)
- `Dashboard.module.css` — full rewrite to match new layout; 12-col hero grid, body 2-col, all card variants, timeline event positioning, week day cells, glance icon circles

### Bug Fixes
- `Dashboard.jsx`, `Log.jsx` — fixed date one-day-ahead bug: replaced `toISOString().slice(0,10)` (UTC) with local `getFullYear()/getMonth()/getDate()` construction
- `History.jsx` — fixed blank lift type: API returns `type` field, not `lift_type`

---

## [v0.6] — 2026-04-23

### Frontend
- `pages/History.jsx` + `History.module.css` — built full History page; tabbed by resource (run/lift/nutrition/sleep/weight), compact rows sorted newest-first, empty state with link to /log, error state
- `pages/Dashboard.jsx` — replaced all mock data with live API calls; hero shows today's logged run or planned target; calories/macros from nutrition API; weight sparkline from last 10 entries; week streak from actual run dates; days to NYC calculated live
- `trainingPlan.js` — 12-week training plan (Apr 20–Jul 12, 2026) loaded as a static JS date map; each day carries run type, distance, HR targets, and lift type (legs/push/pull); dashboard reads this to show planned vs. logged state
- `api.js` — added `byDate()` on nutrition and sleep resources
- `TopNav` — logo now navigates home on click with hover fade; switched from NavLink to Link to avoid spurious active underline on brand

---

## [v0.5] — 2026-04-20

### Bug Fix
- `routes/lifts.py`, `runs.py`, `nutrition.py`, `sleep.py`, `weight.py` — fixed `created_at: str` response schema to `created_at: datetime` across all 5 routes; Pydantic v2 won't coerce a datetime object to str, causing every GET and POST to return 500

---

## [v0.4] — 2026-04-20

### Backend
- `main.py` — added `redirect_slashes=False` to fix POST requests silently failing via 307 redirect
- `main.py` — added `/health` endpoint returning `{"status": "ok", "app": "zone5", "timestamp": ...}`

### Dev
- Added `Makefile` — `make backend`, `make frontend`, `make dev`, `make health`
- Zone 5 backend locked to port 8001 (port 8000 reserved by separate Fitness app)
- `CLAUDE.md` updated with Local Dev Setup section

### Product
- Notion workspace created: Zone 5 → Product Backlog
- Backlog populated: Phase 2 logging stories (Z5-001–009), Security (Z5-010–012), Site Reliability (Z5-013–016)

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
