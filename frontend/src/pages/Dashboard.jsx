import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sparkline from '../components/Sparkline';
import { api } from '../api';
import { getPlan } from '../trainingPlan';
import styles from './Dashboard.module.css';

const NYC_RACE_DATE = new Date('2026-11-02');
const CALORIE_GOAL = 2400;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function daysToNYC() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((NYC_RACE_DATE - now) / (1000 * 60 * 60 * 24));
}

function thisWeekDates() {
  const now = new Date();
  const dow = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function formatTodayLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toLowerCase();
}

function secondsToDisplay(s) {
  if (!s) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function paceDisplay(distanceMiles, seconds) {
  if (!distanceMiles || !seconds) return null;
  const secsPerMile = seconds / distanceMiles;
  const m = Math.floor(secsPerMile / 60);
  const s = Math.round(secsPerMile % 60);
  return `${m}:${String(s).padStart(2, '0')} /mi`;
}

function WeekStrip({ runDates }) {
  const weekDates = thisWeekDates();
  const todayStr = today();
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const runSet = new Set(runDates);

  return (
    <div className={styles.weekStrip}>
      {weekDates.map((d, i) => {
        const done = runSet.has(d);
        const isToday = d === todayStr;
        return (
          <div key={d} className={styles.dayCol}>
            <span className={styles.dayLabel}>{days[i]}</span>
            <div className={`${styles.dayCell} ${done ? styles.done : ''} ${isToday ? styles.today : ''}`}>
              {done ? '✓' : isToday ? '·' : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const [calView, setCalView] = useState('week');
  const todayStr = today();

  const { data: nutrition } = useQuery({
    queryKey: ['nutrition', todayStr],
    queryFn: () => api.nutrition.byDate(todayStr),
    retry: false,
  });

  const { data: sleepData } = useQuery({
    queryKey: ['sleep', todayStr],
    queryFn: () => api.sleep.byDate(todayStr),
    retry: false,
  });

  const { data: weightList } = useQuery({
    queryKey: ['weight'],
    queryFn: api.weight.list,
  });

  const { data: runsList } = useQuery({
    queryKey: ['runs'],
    queryFn: api.runs.list,
  });

  // Derived values
  const plan = getPlan(todayStr);
  const plannedRun = plan?.run ?? null;
  const plannedLift = plan?.lift ?? null;
  const isRestDay = plan?.rest === true;

  const caloriesEaten = nutrition?.calories ?? null;
  const kcalLeft = caloriesEaten != null ? CALORIE_GOAL - caloriesEaten : null;
  const caloriesFraction = caloriesEaten != null ? caloriesEaten / CALORIE_GOAL : 0;

  const latestWeight = weightList?.[0] ?? null;
  const weightSparkline = weightList
    ? [...weightList].reverse().slice(-10).map((w) => w.weight_lbs)
    : [];

  const todayRun = runsList?.find((r) => r.date === todayStr) ?? null;
  const thisWeek = thisWeekDates();
  const weekRunDates = runsList
    ? runsList.filter((r) => thisWeek.includes(r.date)).map((r) => r.date)
    : [];

  const sleepHours = sleepData?.hours ?? null;
  const sleepDisplay = sleepHours != null ? `${sleepHours}h` : '—';

  const days = daysToNYC();

  return (
    <div className={styles.page}>

      {/* ── Editorial hero ── */}
      <div className={styles.hero}>

        {/* Today's run */}
        <div className={styles.heroCol}>
          <span className={styles.heroEyebrow}>today · {todayRun ? 'done' : plannedRun ? plannedRun.type : isRestDay ? 'rest' : 'train'}</span>
          {todayRun ? (
            <>
              <div className={styles.heroBigNum}>{todayRun.distance_miles} mi</div>
              <div className={styles.heroDetail}>
                {secondsToDisplay(todayRun.duration_seconds)}
                {paceDisplay(todayRun.distance_miles, todayRun.duration_seconds) && (
                  <> · {paceDisplay(todayRun.distance_miles, todayRun.duration_seconds)}</>
                )}
              </div>
              {todayRun.avg_hr && <div className={styles.heroDetail}>{todayRun.avg_hr} bpm avg</div>}
            </>
          ) : plannedRun ? (
            <>
              <div className={styles.heroBigNum}>{plannedRun.distance} mi</div>
              <div className={styles.heroDetail}>{plannedRun.hr[0]}–{plannedRun.hr[1]} HR · target</div>
              {plannedRun.note && <div className={styles.heroDetail} style={{ opacity: 0.6 }}>{plannedRun.note}</div>}
            </>
          ) : (
            <>
              <div className={styles.heroBigNum} style={{ fontSize: '2rem', opacity: 0.4 }}>{isRestDay ? 'rest day' : 'no run'}</div>
              <div className={styles.heroDetail}>{isRestDay ? 'blissful nothing' : 'not on the plan'}</div>
            </>
          )}
        </div>

        {/* Calories */}
        <div className={`${styles.heroCol} ${styles.heroColBordered}`}>
          <span className={styles.heroEyebrow}>kcal {kcalLeft != null && kcalLeft >= 0 ? 'left' : 'today'}</span>
          <div className={styles.heroBigNum}>
            {kcalLeft != null ? Math.abs(kcalLeft) : '—'}
          </div>
          {nutrition ? (
            <>
              <div className={styles.heroDetail}>
                {nutrition.calories} / {CALORIE_GOAL}
                {nutrition.protein_g != null && ` · P${nutrition.protein_g}`}
                {nutrition.carbs_g != null && ` · C${nutrition.carbs_g}`}
                {nutrition.fat_g != null && ` · F${nutrition.fat_g}`}
              </div>
              <div className={styles.heroBar}>
                <div className={styles.heroBarFill} style={{ width: `${Math.min(caloriesFraction * 100, 100)}%` }} />
              </div>
            </>
          ) : (
            <div className={styles.heroDetail}>not logged yet</div>
          )}
        </div>

        {/* NYC countdown + weight */}
        <div className={styles.heroCol}>
          <span className={styles.heroEyebrow}>days to nyc</span>
          <div className={`${styles.heroBigNum} ${styles.heroBigNumAlt}`}>{days}</div>
          <div className={styles.heroDetail}>
            goal sub-4:00
            {latestWeight && ` · ${latestWeight.weight_lbs} lbs`}
          </div>
          {weightSparkline.length > 1 && (
            <>
              <Sparkline data={weightSparkline} width={180} height={24} />
              <span className={styles.heroSparkLabel}>weight trend</span>
            </>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>

        {/* Left — static timeline placeholder until training plan is built */}
        <div className={styles.timelineCol}>
          <div className={styles.timelineHeader}>
            <span className={styles.timelineTitle}>your day, as it unfolds.</span>
            <span className={styles.timelineMeta}>log as you go</span>
          </div>

          <div className={styles.timeline}>
            {/* Weight */}
            <div className={styles.timelineRow}>
              <div className={`${styles.dot} ${latestWeight ? styles.dotDone : ''}`} />
              <div className={styles.timelineContent}>
                <span className={styles.timelineMono}>morning · recovery</span>
                <span className={styles.timelineItemTitle}>
                  {latestWeight ? `${latestWeight.weight_lbs} lbs` : 'weight'}
                </span>
                {latestWeight?.date === todayStr
                  ? <span className={styles.timelineItemSub}>logged today</span>
                  : latestWeight
                  ? <span className={styles.timelineItemSub}>last: {latestWeight.date}</span>
                  : <span className={styles.timelineItemSub}>not logged yet</span>
                }
              </div>
            </div>

            {/* Nutrition */}
            <div className={styles.timelineRow}>
              <div className={`${styles.dot} ${nutrition ? styles.dotDone : ''}`} />
              <div className={styles.timelineContent}>
                <span className={styles.timelineMono}>today · fuel</span>
                <span className={styles.timelineItemTitle}>
                  {nutrition ? `${nutrition.calories} kcal` : 'nutrition'}
                </span>
                <span className={styles.timelineItemSub}>
                  {nutrition
                    ? [
                        nutrition.protein_g != null && `P${nutrition.protein_g}g`,
                        nutrition.carbs_g != null && `C${nutrition.carbs_g}g`,
                        nutrition.fat_g != null && `F${nutrition.fat_g}g`,
                      ].filter(Boolean).join(' · ') || 'macros not logged'
                    : 'not logged yet'}
                </span>
              </div>
              {!nutrition && (
                <button className={styles.timelineBtn}>+ log</button>
              )}
            </div>

            {/* Run */}
            {(plannedRun || todayRun) && (
              <div className={`${styles.timelineRow} ${!todayRun && plannedRun ? styles.timelineRowActive : ''}`}>
                <div className={`${styles.dot} ${todayRun ? styles.dotDone : styles.dotActive}`} />
                <div className={styles.timelineContent}>
                  <span className={styles.timelineMono}>today · {plannedRun?.type ?? 'run'}</span>
                  <span className={`${styles.timelineItemTitle} ${!todayRun ? styles.timelineItemActive : ''}`}>
                    {todayRun
                      ? `${todayRun.distance_miles} mi`
                      : `${plannedRun.distance} mi · target`}
                  </span>
                  <span className={styles.timelineItemSub}>
                    {todayRun
                      ? [secondsToDisplay(todayRun.duration_seconds), paceDisplay(todayRun.distance_miles, todayRun.duration_seconds)].filter(Boolean).join(' · ')
                      : plannedRun.note ?? `${plannedRun.hr[0]}–${plannedRun.hr[1]} HR`}
                  </span>
                </div>
                {!todayRun && (
                  <button className={`${styles.timelineBtn} ${styles.timelineBtnActive}`}>+ log</button>
                )}
              </div>
            )}

            {/* Lift */}
            {plannedLift && (
              <div className={styles.timelineRow}>
                <div className={styles.dot} />
                <div className={styles.timelineContent}>
                  <span className={styles.timelineMono}>today · lift</span>
                  <span className={styles.timelineItemTitle}>{plannedLift}</span>
                  <span className={styles.timelineItemSub}>scheduled</span>
                </div>
                <button className={styles.timelineBtn}>+ log</button>
              </div>
            )}

            {/* Sleep */}
            <div className={styles.timelineRow}>
              <div className={`${styles.dot} ${sleepData ? styles.dotDone : ''}`} />
              <div className={styles.timelineContent}>
                <span className={styles.timelineMono}>night · recovery</span>
                <span className={styles.timelineItemTitle}>
                  {sleepData ? `${sleepData.hours}h sleep` : 'sleep'}
                </span>
                <span className={styles.timelineItemSub}>
                  {sleepData
                    ? sleepData.quality ? `quality ${sleepData.quality}/5` : 'logged'
                    : 'not logged yet'}
                </span>
              </div>
              {!sleepData && (
                <button className={styles.timelineBtn}>+ log</button>
              )}
            </div>
          </div>
        </div>

        {/* Right — Calendar + Coach + Glance */}
        <div className={styles.sideCol}>

          {/* Calendar */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.eyebrow}>calendar · this week</span>
                <div className={styles.cardTitle}>nov 2 — {days} days to race</div>
              </div>
              <div className={styles.toggle}>
                <button className={`${styles.toggleBtn} ${calView === 'week' ? styles.toggleActive : ''}`} onClick={() => setCalView('week')}>week</button>
                <button className={`${styles.toggleBtn} ${calView === 'month' ? styles.toggleActive : ''}`} onClick={() => setCalView('month')}>month</button>
              </div>
            </div>
            <WeekStrip runDates={weekRunDates} />
          </div>

          {/* Coach signal — static until AI layer */}
          <div className={styles.coachCard}>
            <div className={styles.coachBadge}>z5</div>
            <div>
              <span className={styles.coachEyebrow}>signal</span>
              <p className={styles.coachText}>
                {isRestDay
                  ? 'Rest day. Do nothing. That\'s the work.'
                  : plannedRun
                  ? `Week ${plan.week} · ${plannedRun.type} ${plannedRun.distance} mi${plannedRun.note ? ' — ' + plannedRun.note : '. ' + plannedRun.hr[0] + '–' + plannedRun.hr[1] + ' HR.'}`
                  : `${days} days to NYC. Log consistently and the insights will come.`}
              </p>
            </div>
          </div>

          {/* Day at a glance */}
          <div className={styles.card}>
            <span className={styles.eyebrow}>day at a glance</span>
            <div className={styles.glanceGrid}>
              <div>
                <span className={styles.glanceNum}>{weekRunDates.length}/7</span>
                <span className={styles.glanceLabel}>runs this week</span>
              </div>
              <div>
                <span className={styles.glanceNum}>{kcalLeft != null ? Math.abs(kcalLeft) : '—'}</span>
                <span className={styles.glanceLabel}>kcal left</span>
              </div>
              <div>
                <span className={styles.glanceNum}>{latestWeight ? `${latestWeight.weight_lbs}` : '—'}</span>
                <span className={styles.glanceLabel}>lbs</span>
              </div>
              <div>
                <span className={styles.glanceNum}>{sleepDisplay}</span>
                <span className={styles.glanceLabel}>slept</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
