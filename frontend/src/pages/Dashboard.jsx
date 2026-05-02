import { useQuery } from '@tanstack/react-query';
import SunMark from '../components/SunMark';
import { api } from '../api';
import { getPlan } from '../trainingPlan';
import styles from './Dashboard.module.css';

const NYC_RACE_DATE = new Date('2026-11-02');
const CALORIE_GOAL = 2400;

// Training block phases: weeks 1-3 Base, 4-9 Build, 10-11 Peak, 12 Taper
const PHASES = [
  { name: 'Base',  w: 3 },
  { name: 'Build', w: 6 },
  { name: 'Peak',  w: 2 },
  { name: 'Taper', w: 1 },
];
const TOTAL_WEEKS = PHASES.reduce((a, p) => a + p.w, 0);

function today() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

function daysToNYC() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((NYC_RACE_DATE - now) / (1000 * 60 * 60 * 24));
}

function thisWeekDates() {
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
  });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

function greetEyebrow() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

function secondsToDisplay(s) {
  if (!s) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function paceDisplay(miles, seconds) {
  if (!miles || !seconds) return null;
  const spm = seconds / miles;
  const m = Math.floor(spm / 60);
  const s = Math.round(spm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function fmtHour(t) {
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  const ampm = h < 12 ? 'a' : 'p';
  const hh = h === 0 ? 12 : h <= 12 ? h : h - 12;
  return `${hh}:${String(m).padStart(2, '0')}${ampm}`;
}

function currentHour() {
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
}

// ── Icon SVGs (minimal, 1.5 stroke) ─────────────────────────────────────────
const Ico = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const IcoShoe  = () => <Ico d={<><path d="M2 16h20l-1 4H3z"/><path d="M2 16c0-2 1-3 2-4l3-2 1-3 4 1 2 2 4 1 2 1c2 .5 2 2 2 4"/></>} />;
const IcoMoon  = () => <Ico d={<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>} />;
const IcoFood  = () => <Ico d={<><path d="M3 2v7c0 1 1 2 2 2v11"/><path d="M7 2v7c0 1-1 2-2 2"/><path d="M11 2v20"/><path d="M19 2c-1.5 0-3 1.5-3 5v6h3z"/><path d="M19 13v9"/></>} />;
const IcoScale = () => <Ico d={<><path d="M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M3 21h18"/><path d="M5 21a7 7 0 0 1 14 0"/></>} />;
const IcoHeart = () => <Ico d={<path d="M19 14c1.5-1.5 3-3.5 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2 1.5 4 3 5.5l7 7Z"/>} />;
const IcoFlame = () => <Ico d={<path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.4 0 2.5-1.1 2.5-2.5 0-1.5-1-2.5-1-4 0-2 2-3.5 3.5-4.5 0 1.5.5 3 1.5 4 1.5 1.5 2.5 3 2.5 5a7 7 0 1 1-14 0c0-3 2-5 4-7 1 1 2 2 2 4Z"/>} />;
const IcoDrop  = () => <Ico d={<path d="M12 2.7s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11Z"/>} />;
const IcoPlay  = () => <Ico d={<path d="M6 4v16l14-8z"/>} />;
const IcoLift  = () => <Ico d={<><path d="M6 5v14"/><path d="M18 5v14"/><path d="M2 9h4"/><path d="M18 9h4"/><path d="M2 15h4"/><path d="M18 15h4"/><path d="M6 9h12"/><path d="M6 15h12"/></>} />;

// ── Shared sub-components ────────────────────────────────────────────────────

function EyebrowRow({ red }) {
  return (
    <div className={styles.heroEyebrowRow}>
      <div className={`${styles.heroRule} ${red ? styles.heroRuleRed : ''}`} />
    </div>
  );
}

function CardEyebrow({ label, red }) {
  return (
    <div className={styles.cardEyebrowRow}>
      <div className={`${styles.cardRule} ${red ? styles.cardRuleRed : ''}`} />
      <span className={`${styles.cardEyebrow} ${red ? styles.cardEyebrowRed : ''}`}>{label}</span>
    </div>
  );
}

// ── TodayRun card (dark, full left hero) ─────────────────────────────────────
function TodayRunCard({ todayRun, plannedRun, isRestDay, plan }) {
  const hasActual = !!todayRun;
  const hasPlan = !!plannedRun;

  let titleText = isRestDay ? 'Rest day.' : 'No run scheduled.';
  let subText   = isRestDay ? 'Recovery is training too.' : '';

  if (hasActual) {
    titleText = `${todayRun.distance_miles} mi ${todayRun.run_type ?? ''}`.trim();
    subText   = [secondsToDisplay(todayRun.duration_seconds), paceDisplay(todayRun.distance_miles, todayRun.duration_seconds) && `${paceDisplay(todayRun.distance_miles, todayRun.duration_seconds)} /mi`].filter(Boolean).join(' · ');
  } else if (hasPlan) {
    titleText = `${plannedRun.distance} mi ${plannedRun.type}`;
    subText   = plannedRun.note ?? `${plannedRun.hr[0]}–${plannedRun.hr[1]} HR zone`;
  }

  const stats = hasActual
    ? [
        { k: 'Distance', v: `${todayRun.distance_miles}`, u: 'mi' },
        { k: 'Pace',     v: paceDisplay(todayRun.distance_miles, todayRun.duration_seconds) ?? '—', u: '/mi', mono: true },
        { k: 'Avg HR',   v: todayRun.avg_hr ? `${todayRun.avg_hr}` : '—', u: 'bpm' },
        { k: 'Time',     v: secondsToDisplay(todayRun.duration_seconds) ?? '—', u: '', mono: true },
      ]
    : hasPlan
    ? [
        { k: 'Target',   v: `${plannedRun.distance}`, u: 'mi' },
        { k: 'HR Zone',  v: `${plannedRun.hr[0]}`, u: `–${plannedRun.hr[1]}`, mono: true },
        { k: 'Week',     v: `${plan?.week ?? '—'}`, u: '' },
        { k: 'Type',     v: plannedRun.type, u: '' },
      ]
    : null;

  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className={styles.todayCard}>
      <div className={styles.sunCorner}>
        <SunMark size={20} />
      </div>

      <div className={styles.heroEyebrowRow}>
        <div className={`${styles.heroRule} ${styles.heroRuleRed}`} />
        <span className={`${styles.heroEyebrow} ${styles.heroEyebrowRed}`}>
          Today · {dateLabel}{hasActual ? ' · done' : hasPlan ? ' · planned' : ''}
        </span>
      </div>

      <div>
        <div className={styles.runTitle}>{titleText}</div>
        {subText && <div className={styles.runSub}>{subText}</div>}
      </div>

      {stats && (
        <div className={styles.statsRow}>
          {stats.map((s, i) => (
            <div key={i} className={styles.statBlock}>
              <div className={styles.statLabel}>{s.k}</div>
              <div className={`${styles.statVal} ${s.mono ? styles.statValMono : ''}`}>
                {s.v}
                {s.u && <span className={styles.statUnit}>{s.u}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Calories ring card ───────────────────────────────────────────────────────
function CaloriesCard({ nutrition }) {
  const consumed = nutrition?.calories ?? 0;
  const pct      = Math.min(consumed / CALORIE_GOAL, 1);
  const R = 56, C = 2 * Math.PI * R;
  const off = C * (1 - pct);

  const macros = [
    { k: 'Carbs',   v: nutrition?.carbs_g,   t: 330, c: 'var(--anchor)' },
    { k: 'Protein', v: nutrition?.protein_g,  t: 150, c: 'var(--mahogany-earth)' },
    { k: 'Fat',     v: nutrition?.fat_g,      t: 75,  c: 'var(--warm-sand)' },
  ];

  return (
    <div className={`${styles.card} ${styles.caloriesCard}`}>
      <CardEyebrow label="Fuel · Today" />

      <div className={styles.ringWrap}>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
          <circle cx="70" cy="70" r={R} fill="none" stroke="var(--warm-sand-30)" strokeWidth="10" />
          <circle
            cx="70" cy="70" r={R}
            fill="none"
            stroke="var(--anchor)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={off}
            transform="rotate(-90 70 70)"
          />
          <text x="70" y="68" textAnchor="middle"
            fontFamily="var(--font-display)" fontSize="28" fontWeight="600"
            fill="var(--volcanic-black)" letterSpacing="-0.02em">
            {consumed > 0 ? consumed.toLocaleString() : '—'}
          </text>
          <text x="70" y="86" textAnchor="middle"
            fontFamily="var(--font-sans)" fontSize="10"
            letterSpacing="0.1em" fill="var(--fg-muted)">
            {consumed > 0 ? `OF ${CALORIE_GOAL.toLocaleString()}` : 'not logged'}
          </text>
        </svg>

        <div className={styles.macroList}>
          {macros.map((m) => {
            const p = m.v != null ? Math.min(m.v / m.t, 1) : 0;
            return (
              <div key={m.k} className={styles.macroItem}>
                <div className={styles.macroHeader}>
                  <span className={styles.macroName}>{m.k}</span>
                  <span className={styles.macroNum}>
                    {m.v ?? '—'}<span className={styles.macroMuted}>/{m.t}g</span>
                  </span>
                </div>
                <div className={styles.macroTrack}>
                  <div className={styles.macroFill} style={{ width: `${p * 100}%`, background: m.c }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.burnRow}>
        <span style={{ color: 'var(--altar-red)' }}><IcoFlame /></span>
        <span>
          <span className={styles.burnNum}>{CALORIE_GOAL - consumed > 0 ? (CALORIE_GOAL - consumed).toLocaleString() : '0'}</span>
          {' '}kcal remaining
        </span>
      </div>
    </div>
  );
}

// ── NYC countdown card ───────────────────────────────────────────────────────
function NYCCountdownCard({ plan }) {
  const days  = daysToNYC();
  const weeks = Math.floor(days / 7);
  const rem   = days % 7;
  const week  = plan?.week ?? 1;

  // Which phase are we in?
  let cumW = 0;
  let phaseIdx = 0;
  for (let i = 0; i < PHASES.length; i++) {
    if (week <= cumW + PHASES[i].w) { phaseIdx = i; break; }
    cumW += PHASES[i].w;
  }
  const weekInPhase = week - cumW;

  return (
    <div className={`${styles.card} ${styles.countdownCard}`}>
      <CardEyebrow label="Goal race" />

      <div>
        <div className={styles.raceName}>TCS New York City Marathon</div>
        <div className={styles.raceMeta}>Sun · Nov 2 · Staten Island → Central Park</div>
      </div>

      <div className={styles.daysRow}>
        <span className={styles.daysNum}>{days}</span>
        <span className={styles.daysLabel}>days</span>
      </div>
      <div className={styles.weeksDetail}>{weeks} weeks · {rem} day{rem === 1 ? '' : 's'} · goal sub-4:00</div>

      <div className={styles.phaseWrap}>
        <div className={styles.phaseEyebrow}>
          Block:{' '}
          <span className={styles.phaseHighlight}>
            {PHASES[phaseIdx].name} · wk {weekInPhase} / {PHASES[phaseIdx].w}
          </span>
        </div>
        <div className={styles.phaseBar}>
          {PHASES.map((p, i) => {
            const done    = i < phaseIdx;
            const current = i === phaseIdx;
            const fill = done
              ? 'var(--anchor)'
              : current
              ? 'repeating-linear-gradient(45deg, var(--anchor), var(--anchor) 4px, var(--warm-sand-40) 4px, var(--warm-sand-40) 8px)'
              : 'transparent';
            return (
              <div key={p.name} style={{
                flex: p.w,
                background: fill,
                borderRight: i < PHASES.length - 1 ? '1px solid var(--surface-raised)' : 'none',
              }} />
            );
          })}
        </div>
        <div className={styles.phaseLabels}>
          {PHASES.map((p, i) => (
            <div key={p.name} className={`${styles.phaseLabel} ${i === phaseIdx ? styles.phaseLabelActive : ''}`}
              style={{ flex: p.w }}>
              {p.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Day timeline ─────────────────────────────────────────────────────────────
function DayTimeline({ todayRun, nutrition, sleepData, latestWeight, plannedRun, isRestDay, todayStr }) {
  const START_H = 5, END_H = 22;
  const PX_PER_HR = 52;
  const TOTAL_H = (END_H - START_H) * PX_PER_HR;
  const nowH = currentHour();
  const now = Math.max(START_H, Math.min(END_H, nowH));

  // Build events from real data
  const events = [];

  if (latestWeight) {
    events.push({
      t: 7.0,
      label: latestWeight.date === todayStr ? `${latestWeight.weight_lbs} lbs` : 'Weight',
      sub: latestWeight.date === todayStr ? 'Logged this morning' : `Last: ${latestWeight.date} · ${latestWeight.weight_lbs} lbs`,
      icon: <IcoScale />,
      done: latestWeight.date === todayStr,
    });
  }

  if (todayRun) {
    events.push({
      t: 7.5,
      label: `${todayRun.distance_miles} mi ${todayRun.run_type ?? 'run'}`.trim(),
      sub: [secondsToDisplay(todayRun.duration_seconds), paceDisplay(todayRun.distance_miles, todayRun.duration_seconds) && `${paceDisplay(todayRun.distance_miles, todayRun.duration_seconds)} /mi`, todayRun.avg_hr && `${todayRun.avg_hr} bpm`].filter(Boolean).join(' · '),
      icon: <IcoShoe />,
      big: true,
      done: true,
      stats: [
        { k: 'mi', v: `${todayRun.distance_miles}` },
        secondsToDisplay(todayRun.duration_seconds) && { k: 'time', v: secondsToDisplay(todayRun.duration_seconds) },
        todayRun.avg_hr && { k: 'bpm', v: `${todayRun.avg_hr}` },
      ].filter(Boolean),
    });
  } else if (plannedRun && !isRestDay) {
    events.push({
      t: 7.5,
      label: `${plannedRun.distance} mi ${plannedRun.type} · planned`,
      sub: plannedRun.note ?? `${plannedRun.hr[0]}–${plannedRun.hr[1]} HR`,
      icon: <IcoShoe />,
      forecast: true,
    });
  }

  if (nutrition) {
    events.push({
      t: 12.5,
      label: `${nutrition.calories} kcal`,
      sub: [nutrition.protein_g && `P${nutrition.protein_g}g`, nutrition.carbs_g && `C${nutrition.carbs_g}g`, nutrition.fat_g && `F${nutrition.fat_g}g`].filter(Boolean).join(' · ') || 'Logged today',
      icon: <IcoFood />,
      italic: true,
      done: true,
    });
  } else {
    events.push({
      t: 12.5,
      label: 'Nutrition',
      sub: 'Not logged yet',
      icon: <IcoFood />,
      italic: true,
      forecast: true,
    });
  }

  if (sleepData) {
    events.push({
      t: 6.5,
      label: `${sleepData.hours}h sleep`,
      sub: sleepData.quality ? `Quality ${sleepData.quality}/5` : 'Logged',
      icon: <IcoMoon />,
      done: true,
    });
  } else {
    events.push({
      t: 21.5,
      label: 'Sleep · log tonight',
      sub: '8h target',
      icon: <IcoMoon />,
      forecast: true,
    });
  }

  events.sort((a, b) => a.t - b.t);

  const yFor = (t) => (t - START_H) * PX_PER_HR;

  return (
    <div className={`${styles.card} ${styles.timelineCard}`}>
      <div className={styles.timelineHead}>
        <div>
          <span className={`${styles.cardEyebrow}`} style={{ color: 'var(--anchor)', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}>
            Day · {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <div className={styles.timelineTitle}>your day, as it unfolds.</div>
        </div>
      </div>

      <div className={styles.timelineInner} style={{ height: TOTAL_H + 40 }}>
        {/* hour ticks */}
        {Array.from({ length: END_H - START_H + 1 }).map((_, i) => {
          const h = START_H + i;
          const label = h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`;
          return (
            <div key={i} className={styles.hourTick} style={{ top: 20 + i * PX_PER_HR }}>
              <span className={styles.hourLabel}>{label}</span>
            </div>
          );
        })}

        {/* spine */}
        <div className={styles.spine} />

        {/* now line */}
        {now >= START_H && now <= END_H && (
          <div className={styles.nowLine} style={{ top: 20 + yFor(now) }}>
            <span className={styles.nowBadge}>Now · {fmtHour(nowH)}</span>
          </div>
        )}

        {/* events */}
        {events.map((e, i) => (
          <div key={i}
            className={`${styles.event} ${e.forecast ? styles.eventForecast : ''}`}
            style={{ top: 20 + yFor(e.t) - 14 }}
          >
            <div className={styles.eventTime}>{fmtHour(e.t)}</div>
            <div className={styles.eventNode}>
              <div className={`${styles.eventDot} ${e.big ? styles.eventDotBig : ''}`}>
                {e.icon}
              </div>
            </div>
            <div className={`${styles.eventContent} ${e.big ? styles.eventContentBig : ''}`}>
              <div className={e.big ? styles.eventLabelBig : styles.eventLabel}>{e.label}</div>
              <div className={`${styles.eventSub} ${e.italic ? styles.eventSubItalic : ''} ${e.big ? styles.eventSubBig : ''}`}>
                {e.sub}
              </div>
              {e.stats && (
                <div className={styles.eventStats}>
                  {e.stats.map((s) => (
                    <div key={s.k} className={styles.eventStat}>
                      <div className={styles.eventStatVal}>{s.v}</div>
                      <div className={styles.eventStatKey}>{s.k}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Week calendar ─────────────────────────────────────────────────────────────
function WeekCalendar({ runsList, plan }) {
  const weekDates = thisWeekDates();
  const todayStr  = today();
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const runsByDate = {};
  if (runsList) {
    runsList.forEach((r) => { runsByDate[r.date] = r; });
  }

  const colorFor = (type) => ({
    easy:     'var(--anchor)',
    tempo:    'var(--altar-red)',
    long:     'var(--mahogany-earth)',
    recovery: 'var(--warm-sand)',
  })[type] ?? 'var(--anchor)';

  const days = weekDates.map((date, i) => {
    const dayPlan = getPlan(date);
    const actual  = runsByDate[date];
    const run     = actual || dayPlan?.run;
    const isRest  = !run && (dayPlan?.rest || !dayPlan);
    return { date, dayLabel: DAY_LABELS[i], dayNum: parseInt(date.slice(8)), run, actual, isRest, dayPlan };
  });

  const totalMi = days.reduce((a, d) => a + (d.run?.distance_miles ?? d.run?.distance ?? 0), 0);
  const doneMi  = days.filter(d => d.actual).reduce((a, d) => a + (d.actual.distance_miles ?? 0), 0);

  return (
    <div className={`${styles.card} ${styles.weekCard}`}>
      <div className={styles.weekHead}>
        <div className={styles.weekHeadLeft}>
          <div className={styles.cardRule} />
          <span className={styles.cardEyebrow}>
            {plan?.week ? `Week ${plan.week}` : 'This week'}
          </span>
        </div>
        <div className={styles.weekMiles}>
          <span className={styles.weekMilesDone}>{doneMi.toFixed(1)}</span>
          {' '}/ {totalMi.toFixed(1)} mi
        </div>
      </div>

      <div className={styles.weekGrid}>
        {days.map((day) => {
          const isToday = day.date === todayStr;
          const runType = day.actual?.run_type ?? day.run?.type ?? 'easy';
          const mi = day.actual?.distance_miles ?? day.run?.distance ?? 0;
          const maxMi = 16;
          const intensity = Math.max(mi / maxMi, 0.12);
          const isDone = !!day.actual;

          return (
            <div key={day.date}
              className={`${styles.dayCell} ${isToday ? styles.dayCellToday : ''} ${day.isRest ? styles.dayCellRest : ''}`}
            >
              <div>
                <div className={`${styles.dayLetter} ${isToday ? styles.dayLetterToday : ''}`}>
                  {day.dayLabel}
                </div>
                <div className={styles.dayNum}>{day.dayNum}</div>
              </div>

              {!day.isRest && mi > 0 ? (
                <div className={styles.dayBody}>
                  <div className={styles.dayRunLabel}>
                    {day.actual ? `${mi} mi` : `${mi} mi · plan`}
                  </div>
                  <div className={styles.dayBarTrack}>
                    <div className={styles.dayBarFill} style={{
                      width: `${intensity * 100}%`,
                      background: isDone ? colorFor(runType) : 'transparent',
                      border: isDone ? 'none' : `1px solid ${colorFor(runType)}`,
                      boxSizing: 'border-box',
                    }} />
                  </div>
                  <div className={styles.dayMi}>{runType}</div>
                </div>
              ) : day.dayPlan?.lift ? (
                <div className={styles.dayBody}>
                  <div className={styles.dayRunLabel}>{day.dayPlan.lift}</div>
                  <div style={{ fontSize: 10, color: 'var(--fg-muted)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>lift</div>
                </div>
              ) : (
                <div className={styles.dayRestLabel}>Rest</div>
              )}

              {runType === 'long' && mi >= 12 && (
                <div className={styles.peakDot} title="Long run" />
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.weekLegend}>
        {[
          { l: 'Easy',      c: 'var(--anchor)' },
          { l: 'Tempo',     c: 'var(--altar-red)' },
          { l: 'Long',      c: 'var(--mahogany-earth)' },
          { l: 'Recovery',  c: 'var(--warm-sand)' },
        ].map((t) => (
          <div key={t.l} className={styles.legendItem}>
            <span className={styles.legendSwatch} style={{ background: t.c }} />
            {t.l}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Coach signal card ─────────────────────────────────────────────────────────
function CoachSignal({ plan, plannedRun, isRestDay, sleepData, nutrition }) {
  const week   = plan?.week ?? 1;
  const kcal   = nutrition?.calories ?? null;
  const slept  = sleepData?.hours ?? null;

  let quote;
  if (isRestDay) {
    quote = 'Rest day. Do nothing. That\'s the work — trust the adaptation.';
  } else if (plannedRun) {
    const typeWord = { easy: 'easy effort', tempo: 'tempo threshold', long: 'long aerobic' }[plannedRun.type] ?? plannedRun.type;
    quote = `Week ${week} · ${typeWord} ${plannedRun.distance} mi${plannedRun.note ? '. ' + plannedRun.note : '. Keep HR controlled.'}`;
  } else {
    quote = `${daysToNYC()} days to NYC. Log consistently and the insights will come.`;
  }

  // Signal values from real data
  const signals = [
    { k: 'Week',   v: `${week}`,              dir: `wk ${week}/${TOTAL_WEEKS}`, scale: 'On plan' },
    { k: 'Sleep',  v: slept ? `${slept}h` : '—', dir: slept != null && slept >= 7 ? '+ok' : '—', scale: slept ? (slept >= 7 ? 'Good' : 'Short') : 'Not logged' },
    { k: 'Fuel',   v: kcal ? `${kcal}` : '—', dir: kcal != null ? `of ${CALORIE_GOAL}` : '—', scale: kcal ? (kcal >= CALORIE_GOAL * 0.8 ? 'On target' : 'Under') : 'Not logged' },
  ];

  return (
    <div className={styles.coachCard}>
      <div style={{ position: 'absolute', top: 16, right: 16, opacity: 0.7 }}>
        <SunMark size={16} />
      </div>

      <div className={styles.cardEyebrowRow} style={{ marginBottom: 14 }}>
        <div className={`${styles.cardRule} ${styles.cardRuleRed}`} />
        <span className={`${styles.cardEyebrow} ${styles.cardEyebrowRed}`}>Coach signal</span>
      </div>

      <p className={styles.coachQuote}>"{quote}"</p>
      <div className={styles.coachAttrib}>— zone 5 · written by the system, signed off in your voice</div>

      <div className={styles.signalGrid}>
        {signals.map((s) => (
          <div key={s.k} className={styles.signalItem}>
            <div className={styles.signalKey}>{s.k}</div>
            <div className={styles.signalValRow}>
              <span className={styles.signalVal}>{s.v}</span>
              <span className={styles.signalDir}>{s.dir}</span>
            </div>
            <div className={styles.signalScale}>{s.scale}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Day at a glance ───────────────────────────────────────────────────────────
function Glance({ runsList, nutrition, sleepData, latestWeight, weekRunDates }) {
  const todayStr = today();
  const kcal     = nutrition?.calories;
  const slept    = sleepData?.hours;

  const items = [
    {
      icon: <IcoShoe />,
      k: 'Runs this week',
      v: `${weekRunDates.length}`,
      u: '/ 4',
      side: weekRunDates.length >= 4 ? 'Week complete' : 'Keep going',
    },
    {
      icon: <IcoFlame />,
      k: 'Calories',
      v: kcal != null ? `${kcal}` : '—',
      u: kcal != null ? `/ ${CALORIE_GOAL}` : '',
      side: kcal != null ? (kcal >= CALORIE_GOAL ? 'Goal reached' : `${CALORIE_GOAL - kcal} remaining`) : 'Not logged',
    },
    {
      icon: <IcoMoon />,
      k: 'Sleep',
      v: slept != null ? `${slept}h` : '—',
      u: '',
      side: sleepData?.quality != null ? `Quality ${sleepData.quality}/5` : (slept != null ? 'Logged' : 'Not logged'),
    },
    {
      icon: <IcoScale />,
      k: 'Weight',
      v: latestWeight ? `${latestWeight.weight_lbs}` : '—',
      u: latestWeight ? 'lbs' : '',
      side: latestWeight?.date === todayStr ? 'Logged today' : (latestWeight ? `Last: ${latestWeight.date}` : 'Not logged'),
    },
    {
      icon: <IcoDrop />,
      k: 'Protein',
      v: nutrition?.protein_g != null ? `${nutrition.protein_g}` : '—',
      u: 'g',
      side: nutrition?.protein_g != null ? (nutrition.protein_g >= 150 ? 'On target' : '150g goal') : 'Not logged',
    },
    {
      icon: <IcoHeart />,
      k: 'Days to NYC',
      v: `${daysToNYC()}`,
      u: '',
      side: 'sub-4:00 goal',
    },
  ];

  return (
    <div className={`${styles.card} ${styles.glanceCard}`}>
      <div className={styles.glanceHead}>
        <div className={styles.glanceHeadLeft}>
          <div className={styles.cardRule} />
          <span className={styles.cardEyebrow}>Day at a glance</span>
        </div>
      </div>

      <div className={styles.glanceGrid}>
        {items.map((it, i) => {
          const isLeft  = i % 2 === 0;
          const isLast2 = i >= items.length - 2;
          return (
            <div key={it.k}
              className={`${styles.glanceItem} ${isLeft ? styles.glanceItemLeft : styles.glanceItemRight} ${!isLast2 ? styles.glanceBorderB : ''}`}
            >
              <div className={styles.glanceIcon}>{it.icon}</div>
              <div className={styles.glanceText}>
                <div className={styles.glanceKey}>{it.k}</div>
                <div className={styles.glanceValRow}>
                  <span className={styles.glanceVal}>{it.v}</span>
                  {it.u && <span className={styles.glanceUnit}>{it.u}</span>}
                </div>
                <div className={styles.glanceSide}>{it.side}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const todayStr = today();

  const { data: nutrition }  = useQuery({ queryKey: ['nutrition', todayStr], queryFn: () => api.nutrition.byDate(todayStr), retry: false });
  const { data: sleepData }  = useQuery({ queryKey: ['sleep',    todayStr], queryFn: () => api.sleep.byDate(todayStr),     retry: false });
  const { data: weightList } = useQuery({ queryKey: ['weight'],             queryFn: api.weight.list });
  const { data: runsList }   = useQuery({ queryKey: ['runs'],               queryFn: api.runs.list });

  const plan        = getPlan(todayStr);
  const plannedRun  = plan?.run ?? null;
  const plannedLift = plan?.lift ?? null;
  const isRestDay   = plan?.rest === true;

  const latestWeight = weightList?.[0] ?? null;
  const todayRun     = runsList?.find((r) => r.date === todayStr) ?? null;
  const thisWeek     = thisWeekDates();
  const weekRunDates = runsList ? runsList.filter((r) => thisWeek.includes(r.date)).map((r) => r.date) : [];

  const greetLine = greeting();
  const eyebrow   = greetEyebrow();

  const greetSub = isRestDay
    ? 'Rest day. Recovery is training too — let the body catch up.'
    : plannedRun
    ? `${plannedRun.type} ${plannedRun.distance} mi${plannedRun.note ? ' — ' + plannedRun.note : ''}.`
    : 'Log consistently and the insights will come. Zone 5 is watching.';

  return (
    <div className={styles.page}>

      {/* Greeting */}
      <div className={styles.greeting}>
        <div>
          <div className={styles.greetEyebrow}>{eyebrow}</div>
          <h1 className={styles.greetTitle}>
            {greetLine} <em>Christian</em>.
          </h1>
          <p className={styles.greetSub}>{greetSub}</p>
        </div>
        <div className={styles.greetActions}>
          <button className={styles.btnGhost}>
            <IcoFood /> Log a meal
          </button>
          <button className={styles.btnPrimary}>
            <IcoPlay /> {todayRun ? 'Log another' : plannedRun ? 'Log today\'s run' : 'Log something'}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className={styles.hero}>
        <TodayRunCard todayRun={todayRun} plannedRun={plannedRun} isRestDay={isRestDay} plan={plan} />
        <CaloriesCard nutrition={nutrition} />
        <NYCCountdownCard plan={plan} />
      </div>

      {/* Body */}
      <div className={styles.body}>
        <DayTimeline
          todayRun={todayRun}
          nutrition={nutrition}
          sleepData={sleepData}
          latestWeight={latestWeight}
          plannedRun={plannedRun}
          isRestDay={isRestDay}
          todayStr={todayStr}
        />
        <div className={styles.sideCol}>
          <WeekCalendar runsList={runsList} plan={plan} />
          <CoachSignal plan={plan} plannedRun={plannedRun} isRestDay={isRestDay} sleepData={sleepData} nutrition={nutrition} />
          <Glance runsList={runsList} nutrition={nutrition} sleepData={sleepData} latestWeight={latestWeight} weekRunDates={weekRunDates} />
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span>Zone 5 · a SortoLiving property</span>
        <span>updated {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()}</span>
      </div>
    </div>
  );
}
