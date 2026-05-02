# Zone 5 — Claude Instructions

## What This Is
Zone 5 is a holistic personal fitness platform. Designed to create, iterate, and give
meaningful data and analytics across the full suite of health metrics. Built by Christian
Sorto as a learning project and portfolio piece.

**Tagline:** Zone 5 starts by meeting you where you are — then shows you how far you've come.

## Role
Act as Christian's engineering partner and product thinking partner. He is learning to
build — explain every decision, name every pattern, teach as you go. He is also developing
PM skills — support artifact creation (PRDs, user stories, tradeoffs, roadmaps) alongside
the code.

## Athlete / User Context
- **Name:** Christian Sorto, 26, Alexandria VA
- **Primary goal:** NYC Marathon, November 2, 2026 — sub 4:00 (9:09/mi)
- **Training:** 4 runs/week + 3 lifts/week (Mon/Wed/Fri, drops to 2 then 1 as mileage peaks)
- **This app is built for him first** — personal tool that doubles as a live portfolio

## Product Vision
One platform. Three pillars. Full picture.

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   TRAINING  │   │  NUTRITION  │   │  RECOVERY   │
│             │   │             │   │             │
│ Runs        │   │ Calories    │   │ Sleep       │
│ Lifts       │   │ Macros      │   │ Weight      │
│ Feel + notes│   │             │   │ Body comp   │
└─────────────┘   └─────────────┘   └─────────────┘
                        │
              Analytics + Coaching Layer
```

## Stack Decisions (locked)
- **Frontend:** React + Vite
- **Backend:** Python + FastAPI
- **Database:** PostgreSQL (Supabase — free tier)
- **Auth:** Supabase Auth (when multi-user is built)
- **Hosting:** Vercel (frontend) + Render (backend)
- **Mobile:** PWA — responsive web first, React Native future phase

## Design Tool Stack
- **Canva Pro** — marketing graphics, social media, presentations, brand kits, video
- **Figma** — product design, UI mockups, wireframes, Zone 5 design system
- Workflow: design in Figma → build in React. These map 1:1.

## Folder Structure (Phase 1 target)
```
zone5/
├── frontend/        ← React + Vite
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/         ← FastAPI
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── routes/
│   └── requirements.txt
├── PRD.md
├── CLAUDE.md
└── .gitignore
```

## Data Model (locked v0.1)

```
runs                        lift_sessions
├── id                      ├── id
├── user_id                 ├── user_id
├── date                    ├── date
├── run_type                ├── lift_type
├── planned_distance        ├── duration_mins
├── distance_miles          ├── notes
├── duration_seconds        └── created_at
├── avg_hr
├── feel                    nutrition
├── skipped                 ├── id
├── skip_reason             ├── user_id
├── notes                   ├── date (unique)
└── created_at              ├── calories (required)
                            ├── protein_g
sleep                       ├── carbs_g
├── id                      ├── fat_g
├── user_id                 ├── notes
├── date (unique)           └── created_at
├── bedtime
├── wake_time               weight
├── hours                   ├── id
├── quality (1–5)           ├── user_id
├── notes                   ├── date (unique)
└── created_at              ├── weight_lbs
                            ├── body_fat_pct
                            ├── notes
                            └── created_at
```

Notes:
- All tables include `user_id` for future multi-user support
- `lift_sessions` scales to `lift_exercises` child table additively (no rewrites)
- Pace is derived (time ÷ distance) — not stored
- `runs.skipped = true` makes distance/duration optional

## API Design (locked v0.1)

```
/runs
  POST, GET, GET/{id}, PUT/{id}, DELETE/{id}

/lift-sessions
  POST, GET, GET/{id}, PUT/{id}, DELETE/{id}

/nutrition
  POST, GET, GET?date, PUT/{id}, DELETE/{id}

/sleep
  POST, GET, GET?date, PUT/{id}, DELETE/{id}

/weight
  POST, GET, GET?date, PUT/{id}, DELETE/{id}

/dashboard  ←  Phase 3, TBD

/coach/summary  ←  Scoped, pending build
  GET — returns structured coaching briefing: current phase/week, today's workout,
  runs this week vs plan, nutrition adherence (7 days), avg sleep, weight trend.
  Reads from TRAINING.md + LIFTING.md. No AI yet — logic only.
```

Notes:
- No pagination for now — revisit at Phase 3
- Dashboard gets its own endpoint, handles complex queries in one shot
- Caching layer: React Query (cache-first, stale-while-revalidate)

## Frontend Structure (in progress)
Pages:
- `/` — Dashboard (today view)
- `/log` — Log something (run, lift, nutrition, sleep, weight)
- `/history` — All past entries
- `/analytics` — Charts and trends
- `/timeline` — Public story page

Next step: sketch pages in Figma, return with designs to build from.

## Current Phase
**Phase 0 — Complete**
- PRD written and committed to GitHub
- Stack decided
- Repo created at github.com/cnsorto13/zone5

**Phase 1 — In progress**
- Schema design ✓
- API design ✓
- Caching strategy ✓ (React Query)
- Folder structure ✓
- Backend scaffold ✓ (FastAPI, all 5 resources, full CRUD, live on Supabase)
- Frontend structure — pending Figma designs
- Frontend scaffold — not started

## Phased Roadmap
| Phase | Focus |
|---|---|
| 1 — Foundation | Folder structure, schema, backend API |
| 2 — Core Logging | Log runs, lifts, calories, sleep, weight from UI |
| 3 — Dashboard | Today view, charts, trends, coaching signals |
| 4 — PWA | Mobile install, offline support |
| 5 — Public Profile | Scrubbed public view, live URL |
| 6 — Onboarding | Profile setup, goal setting |
| 7 — Multi-user | Auth, registration |
| 8 — Integrations | Strava OAuth, Garmin sync |
| 9 — AI Coach | Insights, recommendations |
| 10 — Community | Friends, shared profiles |

## MVP Core Features
- Run logging
- Lift logging
- Calorie + macro logging
- Sleep logging
- Weight logging
- Analytics dashboard

## Design Principles
1. Zone 5 adapts to the athlete — the system fits the lifestyle
2. Zone 5 explains itself — every insight comes with a why
3. Built for one, designed for many — personal first, platform eventually
4. Start with who you are, show you what you've become
5. Make it fun — data should feel motivating, not clinical

## Working Style
**Always scope before coding.** When starting a new phase or feature, Christian wants to
talk through the architecture and approach first — diagrams, tradeoffs, questions — before
any files are written. Do not start scaffolding or writing code until he explicitly says
to build. Propose, discuss, align — then execute.

## How to Teach While Building
Christian is learning full stack development and PM skills simultaneously.
After every code change:
1. Explain what changed — which file, which function, what it does
2. Explain why — what problem it solves
3. Name the pattern — give it a label he can carry forward
4. One takeaway — a general principle for next time

## How to Support PM Work
After significant product decisions:
1. Suggest relevant artifacts (user stories, tradeoff docs, retros)
2. Push back like a real stakeholder — don't just validate
3. Connect product decisions to the PRD principles
4. Flag scope creep early

## Local Dev Setup

Zone 5 backend always runs on **port 8001** (port 8000 is occupied by a separate Fitness app).

```bash
make backend    # start backend only (http://localhost:8001)
make frontend   # start frontend only (http://localhost:5173)
make dev        # start both concurrently
make health     # confirm Zone 5 API is alive
```

Always confirm it's the right app before logging data:
```bash
curl http://localhost:8001/health
# {"status": "ok", "app": "zone5", ...}
```

## Key Files
- `PRD.md` — full product requirements document
- `CLAUDE.md` — this file
- `CHANGELOG.md` — technical version history
- `TRAINING.md` — 12-week running plan (Apr 20 – Jul 12). Phases, weekly mileage, HR zones.
- `LIFTING.md` — lifting plan (Mon/Wed/Fri). Exercises, sets, reps, progression tracker, HIIT menu.
- `backend/main.py` — FastAPI app entry point
- `backend/models.py` — SQLAlchemy ORM models (all 5 tables)
- `backend/database.py` — DB connection and session management
- `backend/routes/` — one file per resource (runs, lifts, nutrition, sleep, weight)
- `backend/requirements.txt` — Python dependencies
- `backend/.env` — local secrets (not committed)
