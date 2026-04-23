import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api';
import styles from './History.module.css';

const TABS = ['run', 'lift', 'nutrition', 'sleep', 'weight'];

function secondsToDisplay(s) {
  if (!s) return '—';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function pace(distanceMiles, seconds) {
  if (!distanceMiles || !seconds) return '—';
  const secsPerMile = seconds / distanceMiles;
  const m = Math.floor(secsPerMile / 60);
  const s = Math.round(secsPerMile % 60);
  return `${m}:${String(s).padStart(2, '0')} /mi`;
}

const FEEL_LABEL = { 1: 'rough', 2: 'meh', 3: 'solid', 4: 'strong', 5: 'great' };
const FEEL_COLOR = { 1: 'var(--altar-red)', 2: 'var(--warm-sand)', 3: 'var(--philippine-gold)', 4: 'var(--tropical-forest)', 5: 'var(--anchor)' };

function FeelDot({ value }) {
  if (!value) return <span className={styles.muted}>—</span>;
  return (
    <span className={styles.feelDot} style={{ background: FEEL_COLOR[value] }} title={FEEL_LABEL[value]}>
      {value}
    </span>
  );
}

function EmptyState() {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyText}>nothing here yet</p>
      <Link to="/log" className={styles.emptyLink}>log something →</Link>
    </div>
  );
}

function RunRows({ data }) {
  if (!data?.length) return <EmptyState />;
  return (
    <div className={styles.list}>
      {data.map((r) => (
        <div key={r.id} className={styles.row}>
          <span className={styles.date}>{r.date}</span>
          <span className={styles.primary}>{r.distance_miles ? `${r.distance_miles} mi` : '—'}</span>
          <span className={styles.secondary}>{secondsToDisplay(r.duration_seconds)}</span>
          <span className={styles.secondary}>{pace(r.distance_miles, r.duration_seconds)}</span>
          {r.avg_hr && <span className={styles.secondary}>{r.avg_hr} bpm</span>}
          <span className={styles.note}>{r.notes || ''}</span>
          <FeelDot value={r.feel} />
        </div>
      ))}
    </div>
  );
}

function LiftRows({ data }) {
  if (!data?.length) return <EmptyState />;
  return (
    <div className={styles.list}>
      {data.map((r) => (
        <div key={r.id} className={styles.row}>
          <span className={styles.date}>{r.date}</span>
          <span className={styles.primary}>{r.lift_type}</span>
          {r.duration_mins && <span className={styles.secondary}>{r.duration_mins} min</span>}
          <span className={styles.note}>{r.notes || ''}</span>
        </div>
      ))}
    </div>
  );
}

function NutritionRows({ data }) {
  if (!data?.length) return <EmptyState />;
  return (
    <div className={styles.list}>
      {data.map((r) => (
        <div key={r.id} className={styles.row}>
          <span className={styles.date}>{r.date}</span>
          <span className={styles.primary}>{r.calories ? `${r.calories} kcal` : '—'}</span>
          {r.protein_g != null && <span className={styles.secondary}>{r.protein_g}g protein</span>}
          {r.carbs_g != null && <span className={styles.secondary}>{r.carbs_g}g carbs</span>}
          {r.fat_g != null && <span className={styles.secondary}>{r.fat_g}g fat</span>}
          <span className={styles.note}>{r.notes || ''}</span>
        </div>
      ))}
    </div>
  );
}

function SleepRows({ data }) {
  if (!data?.length) return <EmptyState />;
  return (
    <div className={styles.list}>
      {data.map((r) => (
        <div key={r.id} className={styles.row}>
          <span className={styles.date}>{r.date}</span>
          <span className={styles.primary}>{r.hours ? `${r.hours}h` : '—'}</span>
          {r.bedtime && r.wake_time && (
            <span className={styles.secondary}>{r.bedtime} → {r.wake_time}</span>
          )}
          <span className={styles.note}>{r.notes || ''}</span>
          <FeelDot value={r.quality} />
        </div>
      ))}
    </div>
  );
}

function WeightRows({ data }) {
  if (!data?.length) return <EmptyState />;
  return (
    <div className={styles.list}>
      {data.map((r) => (
        <div key={r.id} className={styles.row}>
          <span className={styles.date}>{r.date}</span>
          <span className={styles.primary}>{r.weight_lbs} lbs</span>
          {r.body_fat_pct != null && <span className={styles.secondary}>{r.body_fat_pct}% bf</span>}
          <span className={styles.note}>{r.notes || ''}</span>
        </div>
      ))}
    </div>
  );
}

const QUERY_KEY = { run: 'runs', lift: 'lifts', nutrition: 'nutrition', sleep: 'sleep', weight: 'weight' };
const FETCHER = { run: api.runs.list, lift: api.lifts.list, nutrition: api.nutrition.list, sleep: api.sleep.list, weight: api.weight.list };
const ROWS = { run: RunRows, lift: LiftRows, nutrition: NutritionRows, sleep: SleepRows, weight: WeightRows };

function TabContent({ tab }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY[tab]],
    queryFn: FETCHER[tab],
  });

  const Rows = ROWS[tab];

  if (isLoading) return <p className={styles.status}>loading…</p>;
  if (isError) return <p className={styles.statusError}>couldn't load data</p>;

  const sorted = [...(data || [])].sort((a, b) => b.date.localeCompare(a.date));
  return <Rows data={sorted} />;
}

export default function History() {
  const [tab, setTab] = useState('run');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>history</span>
        <h1 className={styles.title}>your log</h1>
      </div>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <TabContent tab={tab} />
      </div>
    </div>
  );
}
