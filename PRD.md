# Zone 5 — Product Requirements Document

**Version:** 1.0
**Author:** Christian Sorto
**Date:** April 15, 2026
**Status:** Draft

---

## The Vision

Zone 5 starts by meeting you where you are — then shows you how far you've come.

Too many athletes are spread across 4–5 disconnected tools. A spreadsheet for planning,
MyFitnessPal for nutrition, Garmin and Strava for run data, a notes app for how they felt,
and a separate conversation with a coach to make sense of it all. The data exists — but
it's siloed. No single place connects what you did, how you felt, what you ate, and what
it means for your next session.

Zone 5 fixes that. One platform. Three pillars. Full picture.

---

## Problem Statement

Serious athletes managing a training block have no single tool that connects training,
nutrition, and recovery in one place. Existing tools are either too narrow (Strava only
sees runs), too generic (MyFitnessPal doesn't know you're training for a marathon), or
too disconnected (your coach can't see your sleep data). The result is a lot of data and
very little intelligence.

For coaches managing multiple athletes, the problem is worse — there's no unified view,
no way to review an athlete's full picture quickly, and no shared language between what
the data shows and how the athlete actually feels.

---

## Design Principles

1. **Zone 5 adapts to the athlete.** The system fits the lifestyle, not the other way around.
2. **Zone 5 explains itself.** Every insight comes with a why — not just what happened, but what it means.
3. **Zone 5 is built for one, designed for many.** Personal first. Platform eventually.
4. **Start with who you are. Show you what you've become.** Onboarding meets the athlete where they are. Progress celebrates how far they've come.
5. **Make it fun.** Data should feel motivating, not clinical.

---

## The User

**Primary (MVP):** Christian Sorto — 26 year old training for NYC Marathon, November 2,
2026. Runs 4x/week, lifts 3x/week, actively managing body composition alongside
performance.

**Athlete profile:**
A disciplined, data-driven athlete who logs obsessively because he knows it compounds
over time. Ruthless when it counts, but increasingly aware that recovery, feel, and life
context are as important as the numbers. Doesn't want a generic plan — wants a system
that adapts to how he actually lives. A teacher and coach at heart — believes in showing
people the *why* behind the work, not just handing them a program.

**Future user:** Recreational athletes training for a goal race (5K → marathon) who want
more than a log — they want coaching signals from their own data and a platform that
grows with them.

---

## The Three Pillars

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   TRAINING  │   │  NUTRITION  │   │  RECOVERY   │
│             │   │             │   │             │
│ Runs        │   │ Calories    │   │ Sleep       │
│ Lifts       │   │ Feel + notes│   │ Weight      │
│             │   │ Macros      │   │ Body comp   │
└─────────────┘   └─────────────┘   └─────────────┘
                        │
              Analytics + Coaching Layer
            connects all three pillars
```

---

## MVP Scope

### In Scope

| Feature | Description |
|---|---|
| Onboarding | Athlete sets up profile — goals, current fitness, race targets, lifestyle |
| Run logging | Log distance, time, pace, HR, feel, notes |
| Lift logging | Log type (push/pull/legs), rating, notes |
| Calorie logging | Log daily calories and macros (protein, carbs, fat) |
| Sleep logging | Log bedtime, wake time, hours, quality rating |
| Weight logging | Log daily weight, track trend over time |
| Dashboard | See today's plan, recent activity, key trends |
| Analytics | Charts and trends across all five pillars |
| Public profile | Scrubbed view for portfolio visitors |
| PWA | Installable on mobile, works offline |

### Out of Scope (Phase 2+)

| Feature | Why deferred |
|---|---|
| Strava / Garmin API | OAuth complexity — manual logging teaches the data model first |
| AI coach | Needs data history to be useful — build the log first |
| Community / friends | Too complex for MVP — named pillar for future |
| Meal / food database | Calorie + macro totals sufficient for MVP |
| Hydration tracking | Lower priority — can be added later |
| HRV | Requires device integration — future phase |

---

## The Daily User Journey

```
Morning
└── Open Zone 5
    └── See today's planned workout + coaching note
        └── Understand the why behind the session
            └── Feel ready → go train

During / After Workout
└── Run   → Log distance, time, HR, feel, notes
└── Lift  → Log type, rating, notes
└── Nutrition → Log calories + macros for the day
└── Sleep → Log before bed

Anytime
└── Dashboard → See the full picture
    └── How does today fit the week?
    └── How does this week fit the block?
    └── What does the trend say?
```

---

## Success Metrics

| Metric | Target |
|---|---|
| Daily use | Used every training day throughout NYC Marathon block |
| Logging speed | A run log takes under 60 seconds on mobile |
| Portfolio impact | A visitor understands the training story within 2 minutes |
| User love | People using it to make meaningful changes to their life |

---

## Phased Roadmap

| Phase | Focus | Goal |
|---|---|---|
| 1 — Foundation | Folder structure, schema, backend API | Everything wired up, nothing built yet |
| 2 — Core Logging | Log runs, lifts, calories, sleep, weight from UI | The five pillars are functional |
| 3 — Dashboard | Today view, charts, trends, coaching signals | The data tells a story |
| 4 — PWA | Mobile install, offline support | Usable at the gym and right after a run |
| 5 — Public Profile | Scrubbed public view, live URL | Portfolio-ready |
| 6 — Onboarding | Profile setup, goal setting, plan generation | Ready for a second user |
| 7 — Multi-user | Auth, registration, athlete profiles | Platform opens up |
| 8 — Integrations | Strava OAuth, Garmin sync | Auto-pull replaces manual logging |
| 9 — AI Coach | Insights, recommendations, coaching chat | The intelligence layer |
| 10 — Community | Friends, shared profiles, social | The vision fully realized |

---

## Open Questions

- [ ] What data gets scrubbed for the public view?
- [ ] Does weight show as exact lbs or trend only publicly?
- [ ] Should missed workouts be logged manually or inferred from gaps?
- [ ] What does onboarding look like — form, chat, or guided flow?
- [ ] How personalized is "today's plan" in MVP — static or dynamic?

---

## Competitive Positioning

Strava shows what you did. MyFitnessPal shows what you ate. Your notes app holds how
you felt. Zone 5 connects all three and tells you what it means.
