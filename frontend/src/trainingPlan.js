// 12-Week Plan: Apr 20 – Jul 12, 2026
// Runs: Mon (easy), Wed (easy), Thu (tempo/easy), Sat (long)
// Lifts: Mon (legs), Wed (push), Fri (pull)
// Tue, Sun: full rest

const PLAN = {
  // ── Week 1 — Recovery (Apr 20–26) ──────────────────────────────
  "2026-04-20": { run: { type: "easy",  distance: 4,  hr: [145, 150], note: "Easy off Cherry Blossom. Keep it honest." }, lift: "legs",  week: 1 },
  "2026-04-21": { rest: true, week: 1 },
  "2026-04-22": { run: { type: "easy",  distance: 4,  hr: [145, 150] }, lift: "push", week: 1 },
  "2026-04-23": { run: { type: "easy",  distance: 4,  hr: [145, 150], note: "No tempo yet." }, week: 1 },
  "2026-04-24": { lift: "pull", week: 1 },
  "2026-04-25": { run: { type: "long",  distance: 6,  hr: [148, 152] }, week: 1 },
  "2026-04-26": { rest: true, week: 1 },

  // ── Week 2 — Base (Apr 27–May 3) ───────────────────────────────
  "2026-04-27": { run: { type: "easy",  distance: 4,  hr: [145, 150] }, lift: "legs",  week: 2 },
  "2026-04-28": { rest: true, week: 2 },
  "2026-04-29": { run: { type: "easy",  distance: 4,  hr: [145, 150] }, lift: "push", week: 2 },
  "2026-04-30": { run: { type: "tempo", distance: 4,  hr: [162, 165], note: "1 mi easy → 20 min @ 162–165 HR → 1 mi easy" }, week: 2 },
  "2026-05-01": { lift: "pull", week: 2 },
  "2026-05-02": { run: { type: "long",  distance: 7,  hr: [148, 153] }, week: 2 },
  "2026-05-03": { rest: true, week: 2 },

  // ── Week 3 — Base (May 4–10) ────────────────────────────────────
  "2026-05-04": { run: { type: "easy",  distance: 4,  hr: [145, 150] }, lift: "legs",  week: 3 },
  "2026-05-05": { rest: true, week: 3 },
  "2026-05-06": { run: { type: "easy",  distance: 4,  hr: [145, 150] }, lift: "push", week: 3 },
  "2026-05-07": { run: { type: "tempo", distance: 5,  hr: [162, 166], note: "1 mi easy → 25 min @ 162–166 HR → 1 mi easy" }, week: 3 },
  "2026-05-08": { lift: "pull", week: 3 },
  "2026-05-09": { run: { type: "long",  distance: 8,  hr: [148, 153] }, week: 3 },
  "2026-05-10": { rest: true, week: 3 },

  // ── Week 4 — Cutback (May 11–17) ────────────────────────────────
  "2026-05-11": { run: { type: "easy",  distance: 3,  hr: [145, 150] }, lift: "legs",  week: 4, cutback: true },
  "2026-05-12": { rest: true, week: 4 },
  "2026-05-13": { run: { type: "easy",  distance: 3,  hr: [145, 150] }, lift: "push", week: 4 },
  "2026-05-14": { run: { type: "tempo", distance: 4,  hr: [162, 166], note: "1 mi easy → 20 min @ 162–166 HR → 1 mi easy" }, week: 4 },
  "2026-05-15": { lift: "pull", week: 4 },
  "2026-05-16": { run: { type: "long",  distance: 7,  hr: [148, 152] }, week: 4 },
  "2026-05-17": { rest: true, week: 4 },

  // ── Week 5 — Base (May 18–24) ───────────────────────────────────
  "2026-05-18": { run: { type: "easy",  distance: 4,  hr: [145, 150] }, lift: "legs",  week: 5 },
  "2026-05-19": { rest: true, week: 5 },
  "2026-05-20": { run: { type: "easy",  distance: 4,  hr: [145, 150] }, lift: "push", week: 5 },
  "2026-05-21": { run: { type: "tempo", distance: 5,  hr: [162, 166], note: "1 mi easy → 28 min @ 162–166 HR → 1 mi easy" }, week: 5 },
  "2026-05-22": { lift: "pull", week: 5 },
  "2026-05-23": { run: { type: "long",  distance: 9,  hr: [148, 153] }, week: 5 },
  "2026-05-24": { rest: true, week: 5 },

  // ── Week 6 — Base (May 25–31) ───────────────────────────────────
  "2026-05-25": { run: { type: "easy",  distance: 5,  hr: [145, 150] }, lift: "legs",  week: 6 },
  "2026-05-26": { rest: true, week: 6 },
  "2026-05-27": { run: { type: "easy",  distance: 4,  hr: [145, 150] }, lift: "push", week: 6 },
  "2026-05-28": { run: { type: "tempo", distance: 6,  hr: [163, 167], note: "1.5 mi easy → 30 min @ 163–167 HR → 1.5 mi easy" }, week: 6 },
  "2026-05-29": { lift: "pull", week: 6 },
  "2026-05-30": { run: { type: "long",  distance: 9,  hr: [148, 154] }, week: 6 },
  "2026-05-31": { rest: true, week: 6 },

  // ── Week 7 — Cutback (Jun 1–7) ──────────────────────────────────
  "2026-06-01": { run: { type: "easy",  distance: 4,  hr: [145, 150] }, lift: "legs",  week: 7, cutback: true },
  "2026-06-02": { rest: true, week: 7 },
  "2026-06-03": { run: { type: "easy",  distance: 3,  hr: [145, 150] }, lift: "push", week: 7 },
  "2026-06-04": { run: { type: "tempo", distance: 4,  hr: [163, 167], note: "1 mi easy → 20 min @ 163–167 HR → 1 mi easy" }, week: 7 },
  "2026-06-05": { lift: "pull", week: 7 },
  "2026-06-06": { run: { type: "long",  distance: 8,  hr: [148, 153] }, week: 7 },
  "2026-06-07": { rest: true, week: 7 },

  // ── Week 8 — Marathon Specific (Jun 8–14) ───────────────────────
  "2026-06-08": { run: { type: "easy",  distance: 5,  hr: [145, 151] }, lift: "legs",  week: 8 },
  "2026-06-09": { rest: true, week: 8 },
  "2026-06-10": { run: { type: "easy",  distance: 5,  hr: [145, 151] }, lift: "push", week: 8 },
  "2026-06-11": { run: { type: "tempo", distance: 6,  hr: [163, 167], note: "1.5 mi easy → 30 min @ 163–167 HR → 1.5 mi easy" }, week: 8 },
  "2026-06-12": { lift: "pull", week: 8 },
  "2026-06-13": { run: { type: "long",  distance: 10, hr: [148, 154], note: "Easy throughout." }, week: 8 },
  "2026-06-14": { rest: true, week: 8 },

  // ── Week 9 — Marathon Specific (Jun 15–21) ──────────────────────
  "2026-06-15": { run: { type: "easy",  distance: 5,  hr: [145, 151] }, lift: "legs",  week: 9 },
  "2026-06-16": { rest: true, week: 9 },
  "2026-06-17": { run: { type: "easy",  distance: 5,  hr: [145, 151] }, lift: "push", week: 9 },
  "2026-06-18": { run: { type: "tempo", distance: 7,  hr: [163, 168], note: "1.5 mi easy → 35 min @ 163–168 HR → 1.5 mi easy" }, week: 9 },
  "2026-06-19": { lift: "pull", week: 9 },
  "2026-06-20": { run: { type: "long",  distance: 11, hr: [148, 154] }, week: 9 },
  "2026-06-21": { rest: true, week: 9 },

  // ── Week 10 — Marathon Specific (Jun 22–28) — First MP miles ────
  "2026-06-22": { run: { type: "easy",  distance: 6,  hr: [145, 151] }, lift: "legs",  week: 10 },
  "2026-06-23": { rest: true, week: 10 },
  "2026-06-24": { run: { type: "easy",  distance: 5,  hr: [145, 151] }, lift: "push", week: 10 },
  "2026-06-25": { run: { type: "tempo", distance: 7,  hr: [163, 168], note: "1.5 mi easy → 35 min @ 163–168 HR → 1.5 mi easy" }, week: 10 },
  "2026-06-26": { lift: "pull", week: 10 },
  "2026-06-27": { run: { type: "long",  distance: 12, hr: [148, 154], note: "Easy → last 2 mi @ 9:09/mi (MP check)" }, week: 10 },
  "2026-06-28": { rest: true, week: 10 },

  // ── Week 11 — Cutback (Jun 29–Jul 5) ────────────────────────────
  "2026-06-29": { run: { type: "easy",  distance: 4,  hr: [145, 150] }, lift: "legs",  week: 11, cutback: true },
  "2026-06-30": { rest: true, week: 11 },
  "2026-07-01": { run: { type: "easy",  distance: 4,  hr: [145, 150] }, lift: "push", week: 11 },
  "2026-07-02": { run: { type: "tempo", distance: 5,  hr: [163, 167], note: "1 mi easy → 25 min @ 163–167 HR → 1 mi easy" }, week: 11 },
  "2026-07-03": { lift: "pull", week: 11 },
  "2026-07-04": { run: { type: "long",  distance: 10, hr: [148, 153] }, week: 11 },
  "2026-07-05": { rest: true, week: 11 },

  // ── Week 12 — Marathon Specific (Jul 6–12) — New baseline ───────
  "2026-07-06": { run: { type: "easy",  distance: 6,  hr: [145, 151] }, lift: "legs",  week: 12 },
  "2026-07-07": { rest: true, week: 12 },
  "2026-07-08": { run: { type: "easy",  distance: 5,  hr: [145, 151] }, lift: "push", week: 12 },
  "2026-07-09": { run: { type: "tempo", distance: 7,  hr: [164, 169], note: "1.5 mi easy → 35 min @ 164–169 HR → 1.5 mi easy" }, week: 12 },
  "2026-07-10": { lift: "pull", week: 12 },
  "2026-07-11": { run: { type: "long",  distance: 13, hr: [148, 154], note: "Easy → last 3 mi @ 9:09/mi (MP check)" }, week: 12 },
  "2026-07-12": { rest: true, week: 12 },
};

export function getPlan(dateStr) {
  return PLAN[dateStr] ?? null;
}

export function getWeekPlan(weekNumber) {
  return Object.entries(PLAN)
    .filter(([, v]) => v.week === weekNumber)
    .map(([date, v]) => ({ date, ...v }));
}
