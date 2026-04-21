import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import styles from './Log.module.css';

const TABS = ['run', 'lift', 'nutrition', 'sleep', 'weight'];

const today = () => new Date().toISOString().slice(0, 10);

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function FeelPicker({ value, onChange }) {
  const labels = { 1: 'rough', 2: 'meh', 3: 'solid', 4: 'strong', 5: 'felt great' };
  return (
    <div className={styles.feelRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.feelBtn} ${value === n ? styles.feelActive : ''}`}
          onClick={() => onChange(n)}
        >
          {n}
          <span className={styles.feelLabel}>{labels[n]}</span>
        </button>
      ))}
    </div>
  );
}

function durationToSeconds(str) {
  const parts = str.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number(str) || 0;
}

function RunForm({ onSuccess }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ date: today(), distance_miles: '', duration: '', avg_hr: '', feel: null, notes: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: (body) => api.runs.create(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['runs'] }); onSuccess('Run logged.'); },
  });

  const submit = (e) => {
    e.preventDefault();
    mut.mutate({
      date: form.date,
      distance_miles: parseFloat(form.distance_miles),
      duration_seconds: durationToSeconds(form.duration),
      avg_hr: form.avg_hr ? parseInt(form.avg_hr) : null,
      feel: form.feel,
      notes: form.notes || null,
    });
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={styles.row2}>
        <Field label="Date">
          <input className={styles.input} type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
        </Field>
        <Field label="Distance (mi)">
          <input className={styles.input} type="number" step="0.01" placeholder="4.0" value={form.distance_miles} onChange={(e) => set('distance_miles', e.target.value)} required />
        </Field>
      </div>
      <div className={styles.row2}>
        <Field label="Duration (mm:ss or h:mm:ss)">
          <input className={styles.input} type="text" placeholder="43:20" value={form.duration} onChange={(e) => set('duration', e.target.value)} required />
        </Field>
        <Field label="Avg HR (bpm)">
          <input className={styles.input} type="number" placeholder="148" value={form.avg_hr} onChange={(e) => set('avg_hr', e.target.value)} />
        </Field>
      </div>
      <Field label="How'd it feel?">
        <FeelPicker value={form.feel} onChange={(v) => set('feel', v)} />
      </Field>
      <Field label="Notes">
        <textarea className={styles.textarea} placeholder="Anything worth remembering…" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} />
      </Field>
      <button className={styles.submit} type="submit" disabled={mut.isPending}>
        {mut.isPending ? 'Saving…' : 'Log run →'}
      </button>
      {mut.isError && <p className={styles.error}>{mut.error.message}</p>}
    </form>
  );
}

function LiftForm({ onSuccess }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ date: today(), type: 'legs', rating: null, notes: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: (body) => api.lifts.create(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lifts'] }); onSuccess('Lift logged.'); },
  });

  const submit = (e) => {
    e.preventDefault();
    mut.mutate({ date: form.date, type: form.type, rating: form.rating, notes: form.notes || null });
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={styles.row2}>
        <Field label="Date">
          <input className={styles.input} type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
        </Field>
        <Field label="Type">
          <select className={styles.input} value={form.type} onChange={(e) => set('type', e.target.value)}>
            <option value="legs">Legs</option>
            <option value="push">Push</option>
            <option value="pull">Pull</option>
            <option value="full">Full Body</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>
      <Field label="Rating">
        <FeelPicker value={form.rating} onChange={(v) => set('rating', v)} />
      </Field>
      <Field label="Notes">
        <textarea className={styles.textarea} placeholder="Exercises, weights, anything notable…" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={4} />
      </Field>
      <button className={styles.submit} type="submit" disabled={mut.isPending}>
        {mut.isPending ? 'Saving…' : 'Log lift →'}
      </button>
      {mut.isError && <p className={styles.error}>{mut.error.message}</p>}
    </form>
  );
}

function NutritionForm({ onSuccess }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ date: today(), calories: '', protein_g: '', carbs_g: '', fat_g: '', notes: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: (body) => api.nutrition.create(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['nutrition'] }); onSuccess('Nutrition logged.'); },
  });

  const submit = (e) => {
    e.preventDefault();
    mut.mutate({
      date: form.date,
      calories: form.calories ? parseInt(form.calories) : null,
      protein_g: form.protein_g ? parseFloat(form.protein_g) : null,
      carbs_g: form.carbs_g ? parseFloat(form.carbs_g) : null,
      fat_g: form.fat_g ? parseFloat(form.fat_g) : null,
      notes: form.notes || null,
    });
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <Field label="Date">
        <input className={styles.input} type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
      </Field>
      <div className={styles.row4}>
        <Field label="Calories">
          <input className={styles.input} type="number" placeholder="2200" value={form.calories} onChange={(e) => set('calories', e.target.value)} />
        </Field>
        <Field label="Protein (g)">
          <input className={styles.input} type="number" step="0.1" placeholder="160" value={form.protein_g} onChange={(e) => set('protein_g', e.target.value)} />
        </Field>
        <Field label="Carbs (g)">
          <input className={styles.input} type="number" step="0.1" placeholder="240" value={form.carbs_g} onChange={(e) => set('carbs_g', e.target.value)} />
        </Field>
        <Field label="Fat (g)">
          <input className={styles.input} type="number" step="0.1" placeholder="70" value={form.fat_g} onChange={(e) => set('fat_g', e.target.value)} />
        </Field>
      </div>
      <Field label="Notes">
        <textarea className={styles.textarea} placeholder="What you ate, anything notable…" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} />
      </Field>
      <button className={styles.submit} type="submit" disabled={mut.isPending}>
        {mut.isPending ? 'Saving…' : 'Log nutrition →'}
      </button>
      {mut.isError && <p className={styles.error}>{mut.error.message}</p>}
    </form>
  );
}

function SleepForm({ onSuccess }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ date: today(), hours: '', quality: null, bedtime: '', wake_time: '', notes: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: (body) => api.sleep.create(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sleep'] }); onSuccess('Sleep logged.'); },
  });

  const submit = (e) => {
    e.preventDefault();
    mut.mutate({
      date: form.date,
      hours: form.hours ? parseFloat(form.hours) : null,
      quality: form.quality,
      bedtime: form.bedtime || null,
      wake_time: form.wake_time || null,
      notes: form.notes || null,
    });
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={styles.row2}>
        <Field label="Date (wake date)">
          <input className={styles.input} type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
        </Field>
        <Field label="Hours slept">
          <input className={styles.input} type="number" step="0.1" placeholder="7.5" value={form.hours} onChange={(e) => set('hours', e.target.value)} />
        </Field>
      </div>
      <div className={styles.row2}>
        <Field label="Bedtime">
          <input className={styles.input} type="time" value={form.bedtime} onChange={(e) => set('bedtime', e.target.value)} />
        </Field>
        <Field label="Wake time">
          <input className={styles.input} type="time" value={form.wake_time} onChange={(e) => set('wake_time', e.target.value)} />
        </Field>
      </div>
      <Field label="Quality">
        <FeelPicker value={form.quality} onChange={(v) => set('quality', v)} />
      </Field>
      <Field label="Notes">
        <textarea className={styles.textarea} placeholder="Woke up at 3am, vivid dreams, etc…" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} />
      </Field>
      <button className={styles.submit} type="submit" disabled={mut.isPending}>
        {mut.isPending ? 'Saving…' : 'Log sleep →'}
      </button>
      {mut.isError && <p className={styles.error}>{mut.error.message}</p>}
    </form>
  );
}

function WeightForm({ onSuccess }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ date: today(), weight_lbs: '', body_fat_pct: '', notes: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: (body) => api.weight.create(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['weight'] }); onSuccess('Weight logged.'); },
  });

  const submit = (e) => {
    e.preventDefault();
    mut.mutate({
      date: form.date,
      weight_lbs: parseFloat(form.weight_lbs),
      body_fat_pct: form.body_fat_pct ? parseFloat(form.body_fat_pct) : null,
      notes: form.notes || null,
    });
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={styles.row2}>
        <Field label="Date">
          <input className={styles.input} type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
        </Field>
        <Field label="Weight (lbs)">
          <input className={styles.input} type="number" step="0.1" placeholder="168.2" value={form.weight_lbs} onChange={(e) => set('weight_lbs', e.target.value)} required />
        </Field>
      </div>
      <Field label="Body fat % (optional)">
        <input className={styles.input} type="number" step="0.1" placeholder="18.5" value={form.body_fat_pct} onChange={(e) => set('body_fat_pct', e.target.value)} />
      </Field>
      <Field label="Notes">
        <textarea className={styles.textarea} placeholder="Morning, post-workout, etc…" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} />
      </Field>
      <button className={styles.submit} type="submit" disabled={mut.isPending}>
        {mut.isPending ? 'Saving…' : 'Log weight →'}
      </button>
      {mut.isError && <p className={styles.error}>{mut.error.message}</p>}
    </form>
  );
}

const FORMS = { run: RunForm, lift: LiftForm, nutrition: NutritionForm, sleep: SleepForm, weight: WeightForm };

export default function Log() {
  const [tab, setTab] = useState('run');
  const [toast, setToast] = useState(null);

  const handleSuccess = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const Form = FORMS[tab];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>log</span>
        <h1 className={styles.title}>what happened today?</h1>
      </div>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <Form onSuccess={handleSuccess} />
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
