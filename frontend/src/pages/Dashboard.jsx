import { useState } from 'react';
import Sparkline from '../components/Sparkline';
import Ring from '../components/Ring';
import styles from './Dashboard.module.css';

// ── mock data — replaced with real API calls in Phase 2 ──
const TODAY = {
  date: 'saturday, april 18',
  block: 'block 3',
  daysToNYC: 198,
  run: { distance: '10k', type: 'Tempo Run', pace: '5:32 /km', hrZone: 'Z3 → Z4' },
  calories: { eaten: 1420, goal: 2400 },
  macros: { protein: 98, carbs: 164, fat: 52 },
  sleep: { hours: 7.4 },
  weight: { lbs: 168.2, trend: [172, 171, 170.5, 170, 169.5, 169, 168.8, 168.2] },
  coachNote: "Your last 3 tempos have held pace. Push the final 2k at 5:15 — if HR stays sub-170, you're on track.",
  weekStreak: [true, false, true, true, false, false, false],
  glance: { logged: '3/6', kcal: '980', planned: '10k', slept: '7:24' },
};

const TIMELINE = [
  { time: '6:42a', tag: 'recovery', title: '168.2 lb',                sub: '-0.4 vs 7-day avg',       logged: true,  active: false },
  { time: '7:15a', tag: 'fuel',     title: 'breakfast · 520 kcal',    sub: 'oats, banana, whey',       logged: true,  active: false },
  { time: 'now',   tag: 'train',    title: 'tempo 10k · 55:20 target', sub: 'pace 5:32 · z3→z4 · RPE ?', logged: false, active: true  },
  { time: '—',     tag: 'fuel',     title: 'lunch',                    sub: 'plan ~650 kcal',           logged: false, active: false },
  { time: 'pm',    tag: 'train',    title: 'strength · accessory',     sub: 'posterior chain · 25 min', logged: false, active: false },
  { time: 'night', tag: 'recovery', title: 'target 8h sleep',          sub: 'last night 7h 24m',        logged: false, active: false },
];

function WeekStrip({ streak, todayIndex = 4 }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <div className={styles.weekStrip}>
      {days.map((d, i) => (
        <div key={i} className={styles.dayCol}>
          <span className={styles.dayLabel}>{d}</span>
          <div className={`${styles.dayCell} ${streak[i] ? styles.done : ''} ${i === todayIndex ? styles.today : ''}`}>
            {streak[i] ? '✓' : i === todayIndex ? '·' : ''}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [calView, setCalView] = useState('week');
  const { daysToNYC, run, calories, coachNote, weekStreak, glance } = TODAY;
  const kcalLeft = calories.goal - calories.eaten;

  return (
    <div className={styles.page}>

      {/* ── Editorial hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroCol}>
          <span className={styles.heroEyebrow}>today · train</span>
          <div className={styles.heroBigNum}>{run.distance}</div>
          <div className={styles.heroSub}>{run.type}</div>
          <div className={styles.heroDetail}>{run.pace} · {run.hrZone}</div>
        </div>

        <div className={`${styles.heroCol} ${styles.heroColBordered}`}>
          <span className={styles.heroEyebrow}>kcal left</span>
          <div className={styles.heroBigNum}>{kcalLeft}</div>
          <div className={styles.heroDetail}>{calories.eaten} / {calories.goal} · P{TODAY.macros.protein} · C{TODAY.macros.carbs} · F{TODAY.macros.fat}</div>
          <div className={styles.heroBar}>
            <div className={styles.heroBarFill} style={{ width: `${(calories.eaten / calories.goal) * 100}%` }} />
          </div>
        </div>

        <div className={styles.heroCol}>
          <span className={styles.heroEyebrow}>days to nyc</span>
          <div className={`${styles.heroBigNum} ${styles.heroBigNumAlt}`}>{daysToNYC}</div>
          <div className={styles.heroDetail}>goal sub-4:00 · on pace</div>
          <Sparkline data={[12,15,18,22,24,28,32,34,38,40,42]} width={180} height={24} />
          <span className={styles.heroSparkLabel}>weekly mileage trend</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>

        {/* Left — Timeline */}
        <div className={styles.timelineCol}>
          <div className={styles.timelineHeader}>
            <span className={styles.timelineTitle}>your day, as it unfolds.</span>
            <span className={styles.timelineMeta}>log as you go</span>
          </div>

          <div className={styles.timeline}>
            {TIMELINE.map((row, i) => (
              <div key={i} className={styles.timelineRow}>
                <div className={`${styles.dot} ${row.logged ? styles.dotDone : ''} ${row.active ? styles.dotActive : ''}`} />
                <div className={styles.timelineContent}>
                  <span className={styles.timelineMono}>{row.time} · {row.tag}</span>
                  <span className={`${styles.timelineItemTitle} ${row.active ? styles.timelineItemActive : ''}`}>
                    {row.title}
                  </span>
                  <span className={styles.timelineItemSub}>{row.sub}</span>
                </div>
                {!row.logged && (
                  <button className={`${styles.timelineBtn} ${row.active ? styles.timelineBtnActive : ''}`}>
                    {row.active ? 'start →' : '+ log'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Calendar + Coach + Glance */}
        <div className={styles.sideCol}>

          {/* Calendar */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.eyebrow}>calendar · block 3/5</span>
                <div className={styles.cardTitle}>apr — {daysToNYC} days to race</div>
              </div>
              <div className={styles.toggle}>
                <button className={`${styles.toggleBtn} ${calView === 'week' ? styles.toggleActive : ''}`} onClick={() => setCalView('week')}>week</button>
                <button className={`${styles.toggleBtn} ${calView === 'month' ? styles.toggleActive : ''}`} onClick={() => setCalView('month')}>month</button>
              </div>
            </div>
            <WeekStrip streak={weekStreak} todayIndex={4} />
          </div>

          {/* Coach signal */}
          <div className={styles.coachCard}>
            <div className={styles.coachBadge}>z5</div>
            <div>
              <span className={styles.coachEyebrow}>signal</span>
              <p className={styles.coachText}>{coachNote}</p>
            </div>
          </div>

          {/* Day at a glance */}
          <div className={styles.card}>
            <span className={styles.eyebrow}>day at a glance</span>
            <div className={styles.glanceGrid}>
              <div><span className={styles.glanceNum}>{glance.logged}</span><span className={styles.glanceLabel}>logged</span></div>
              <div><span className={styles.glanceNum}>{glance.kcal}</span><span className={styles.glanceLabel}>kcal left</span></div>
              <div><span className={styles.glanceNum}>{glance.planned}</span><span className={styles.glanceLabel}>planned</span></div>
              <div><span className={styles.glanceNum}>{glance.slept}</span><span className={styles.glanceLabel}>slept</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
