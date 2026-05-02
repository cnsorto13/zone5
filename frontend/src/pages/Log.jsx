import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import SunMark from '../components/SunMark';
import styles from './Log.module.css';

const today = () => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
};

function durationToSeconds(str) {
  const parts = str.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number(str) || 0;
}

// ── Primitives ────────────────────────────────────────────────

function Field({ label, optional, hint, children }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>
        {label}
        {optional && <span className={styles.fieldOpt}>— optional</span>}
      </span>
      {children}
      {hint && <span className={styles.fieldHint}>{hint}</span>}
    </label>
  );
}

function InputWrap({ suffix, children }) {
  return (
    <div className={styles.inputWrap}>
      {children}
      {suffix && <span className={styles.inputSuffix}>{suffix}</span>}
    </div>
  );
}

const FEEL_LABELS = ['rough', 'meh', 'solid', 'strong', 'felt great'];

function FeelPicker({ value, onChange }) {
  const [hover, setHover] = useState(null);
  const shown = hover != null ? hover : value;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className={styles.feelSegments} onMouseLeave={() => setHover(null)}>
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = (hover != null ? n <= hover : value != null && n <= value);
          return (
            <button
              key={n}
              type="button"
              className={`${styles.feelSegment} ${filled ? styles.feelSegmentFilled : ''}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => onChange(n)}
            >{n}</button>
          );
        })}
      </div>
      <div className={shown != null ? styles.feelEcho : `${styles.feelEcho} ${styles.feelEchoEmpty}`}>
        {shown != null
          ? <>"{FEEL_LABELS[shown - 1]}"<span className={styles.feelMono}>{shown}/5</span></>
          : 'How did it feel?'}
      </div>
    </div>
  );
}

function SubmitRow({ label, isPending, error }) {
  return (
    <>
      <div className={styles.submitRow}>
        <p className={styles.submitHint}>
          Logged entries appear in your day timeline and feed the coach signal.
        </p>
        <div className={styles.submitBtns}>
          <button type="button" className={styles.btnGhost}>Save draft</button>
          <button type="submit" className={styles.btnPrimary} disabled={isPending}>
            <SunMark size={14} />
            {isPending ? 'Saving…' : label}
          </button>
        </div>
      </div>
      {error && <p className={styles.error}>{error.message}</p>}
    </>
  );
}

// ── Forms ─────────────────────────────────────────────────────

function RunForm({ onSuccess }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    date: today(), distance_miles: '', duration: '', avg_hr: '', feel: null, notes: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
      <div className={`${styles.formGrid} ${styles.colsRun}`}>
        <Field label="Date">
          <input className={`${styles.input} ${styles.inputMono}`} type="date"
            value={form.date} onChange={e => set('date', e.target.value)} required style={{ fontSize: 22 }} />
        </Field>
        <Field label="Distance">
          <InputWrap suffix="mi">
            <input className={`${styles.input} ${styles.inputMono}`} inputMode="decimal"
              placeholder="6.4" value={form.distance_miles}
              onChange={e => set('distance_miles', e.target.value)} required
              style={{ paddingRight: 36 }} />
          </InputWrap>
        </Field>
        <Field label="Duration">
          <input className={`${styles.input} ${styles.inputMono}`}
            placeholder="50:18" value={form.duration}
            onChange={e => set('duration', e.target.value)} required />
        </Field>
        <Field label="Avg HR">
          <InputWrap suffix="bpm">
            <input className={`${styles.input} ${styles.inputMono}`} inputMode="numeric"
              placeholder="162" value={form.avg_hr}
              onChange={e => set('avg_hr', e.target.value)}
              style={{ paddingRight: 36 }} />
          </InputWrap>
        </Field>
      </div>

      <Field label="Feel">
        <FeelPicker value={form.feel} onChange={v => set('feel', v)} />
      </Field>

      <Field label="Notes" optional>
        <textarea className={styles.textarea}
          placeholder="What did the run teach you? Weather, terrain, the song stuck in your head…"
          value={form.notes} onChange={e => set('notes', e.target.value)} />
      </Field>

      <SubmitRow label="Log run →" isPending={mut.isPending} error={mut.isError ? mut.error : null} />
    </form>
  );
}

function LiftForm({ onSuccess }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ date: today(), type: 'legs', feel: null, notes: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: (body) => api.lifts.create(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lifts'] }); onSuccess('Lift logged.'); },
  });

  const submit = (e) => {
    e.preventDefault();
    mut.mutate({ date: form.date, type: form.type, rating: form.feel, notes: form.notes || null });
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={`${styles.formGrid} ${styles.colsLift}`}>
        <Field label="Date">
          <input className={`${styles.input} ${styles.inputMono}`} type="date"
            value={form.date} onChange={e => set('date', e.target.value)} required style={{ fontSize: 22 }} />
        </Field>
        <Field label="Type">
          <select className={styles.select} value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="legs">Legs</option>
            <option value="push">Push</option>
            <option value="pull">Pull</option>
            <option value="full">Full Body</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>

      <Field label="Rating">
        <FeelPicker value={form.feel} onChange={v => set('feel', v)} />
      </Field>

      <Field label="Notes" optional>
        <textarea className={styles.textarea}
          placeholder="Sets, reps, what felt heavy, what didn't…"
          value={form.notes} onChange={e => set('notes', e.target.value)} />
      </Field>

      <SubmitRow label="Log lift →" isPending={mut.isPending} error={mut.isError ? mut.error : null} />
    </form>
  );
}

function NutritionForm({ onSuccess }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ date: today(), calories: '', protein_g: '', carbs_g: '', fat_g: '', notes: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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

  const total = (Number(form.protein_g) * 4) + (Number(form.carbs_g) * 4) + (Number(form.fat_g) * 9);
  const pct = (n, mult) => total > 0 ? (Number(n || 0) * mult / total) * 100 : 0;

  return (
    <form onSubmit={submit} className={styles.form}>
      <Field label="Date">
        <input className={`${styles.input} ${styles.inputMono}`} type="date"
          value={form.date} onChange={e => set('date', e.target.value)} required style={{ fontSize: 22 }} />
      </Field>

      <div className={`${styles.formGrid} ${styles.cols4}`}>
        <Field label="Calories">
          <InputWrap suffix="kcal">
            <input className={`${styles.input} ${styles.inputMono}`} inputMode="numeric"
              placeholder="2,180" value={form.calories}
              onChange={e => set('calories', e.target.value)} style={{ paddingRight: 40 }} />
          </InputWrap>
        </Field>
        <Field label="Protein">
          <InputWrap suffix="g">
            <input className={`${styles.input} ${styles.inputMono}`} inputMode="numeric"
              placeholder="148" value={form.protein_g}
              onChange={e => set('protein_g', e.target.value)} style={{ paddingRight: 24 }} />
          </InputWrap>
        </Field>
        <Field label="Carbs">
          <InputWrap suffix="g">
            <input className={`${styles.input} ${styles.inputMono}`} inputMode="numeric"
              placeholder="262" value={form.carbs_g}
              onChange={e => set('carbs_g', e.target.value)} style={{ paddingRight: 24 }} />
          </InputWrap>
        </Field>
        <Field label="Fat">
          <InputWrap suffix="g">
            <input className={`${styles.input} ${styles.inputMono}`} inputMode="numeric"
              placeholder="68" value={form.fat_g}
              onChange={e => set('fat_g', e.target.value)} style={{ paddingRight: 24 }} />
          </InputWrap>
        </Field>
      </div>

      {total > 0 && (
        <div className={styles.macroBarWrap}>
          <div className={styles.macroBarEyebrow}>Macro split · by calorie</div>
          <div className={styles.macroBar}>
            <div style={{ width: `${pct(form.protein_g, 4)}%`, background: 'var(--anchor)' }} />
            <div style={{ width: `${pct(form.carbs_g, 4)}%`, background: 'var(--cempasuchil)' }} />
            <div style={{ width: `${pct(form.fat_g, 9)}%`, background: 'var(--mahogany-earth)' }} />
          </div>
          <div className={styles.macroLegend}>
            <span><span style={{ color: 'var(--anchor)' }}>●</span> P {pct(form.protein_g, 4).toFixed(0)}%</span>
            <span><span style={{ color: 'var(--cempasuchil)' }}>●</span> C {pct(form.carbs_g, 4).toFixed(0)}%</span>
            <span><span style={{ color: 'var(--mahogany-earth)' }}>●</span> F {pct(form.fat_g, 9).toFixed(0)}%</span>
          </div>
        </div>
      )}

      <Field label="Notes" optional>
        <textarea className={styles.textarea}
          placeholder="What did you eat? How did it sit?"
          value={form.notes} onChange={e => set('notes', e.target.value)} />
      </Field>

      <SubmitRow label="Log nutrition →" isPending={mut.isPending} error={mut.isError ? mut.error : null} />
    </form>
  );
}

function SleepForm({ onSuccess }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    date: today(), hours: 7.5, bedtime: '', wake_time: '', quality: null, notes: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: (body) => api.sleep.create(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sleep'] }); onSuccess('Sleep logged.'); },
  });

  const submit = (e) => {
    e.preventDefault();
    mut.mutate({
      date: form.date,
      hours: form.hours,
      quality: form.quality,
      bedtime: form.bedtime || null,
      wake_time: form.wake_time || null,
      notes: form.notes || null,
    });
  };

  const hh = Math.floor(form.hours);
  const mm = Math.round((form.hours % 1) * 60);

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={`${styles.formGrid} ${styles.cols2}`}>
        <Field label="Date (wake date)">
          <input className={`${styles.input} ${styles.inputMono}`} type="date"
            value={form.date} onChange={e => set('date', e.target.value)} required style={{ fontSize: 22 }} />
        </Field>
        <Field label="Hours slept" hint={`${hh}h ${mm}m`}>
          <div className={styles.hoursRow}>
            <span className={styles.hoursDisplay}>{form.hours.toFixed(1)}</span>
            <input type="range" className={styles.hoursSlider}
              min="3" max="12" step="0.25"
              value={form.hours}
              onChange={e => set('hours', Number(e.target.value))} />
          </div>
        </Field>
      </div>

      <div className={`${styles.formGrid} ${styles.cols2}`}>
        <Field label="Bedtime">
          <input className={`${styles.input} ${styles.inputMono}`} type="time"
            value={form.bedtime} onChange={e => set('bedtime', e.target.value)} />
        </Field>
        <Field label="Wake time">
          <input className={`${styles.input} ${styles.inputMono}`} type="time"
            value={form.wake_time} onChange={e => set('wake_time', e.target.value)} />
        </Field>
      </div>

      <Field label="Quality">
        <FeelPicker value={form.quality} onChange={v => set('quality', v)} />
      </Field>

      <Field label="Notes" optional>
        <textarea className={styles.textarea}
          placeholder="Dreams, wakeups, what you ate before bed…"
          value={form.notes} onChange={e => set('notes', e.target.value)} />
      </Field>

      <SubmitRow label="Log sleep →" isPending={mut.isPending} error={mut.isError ? mut.error : null} />
    </form>
  );
}

function WeightForm({ onSuccess }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ date: today(), weight_lbs: '', body_fat_pct: '', notes: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
      <div className={`${styles.formGrid} ${styles.cols3}`}>
        <Field label="Date">
          <input className={`${styles.input} ${styles.inputMono}`} type="date"
            value={form.date} onChange={e => set('date', e.target.value)} required style={{ fontSize: 22 }} />
        </Field>
        <Field label="Weight">
          <InputWrap suffix="lbs">
            <input className={`${styles.input} ${styles.inputMono}`} inputMode="decimal"
              placeholder="172.4" value={form.weight_lbs}
              onChange={e => set('weight_lbs', e.target.value)} required style={{ paddingRight: 36 }} />
          </InputWrap>
        </Field>
        <Field label="Body fat" optional>
          <InputWrap suffix="%">
            <input className={`${styles.input} ${styles.inputMono}`} inputMode="decimal"
              placeholder="14.2" value={form.body_fat_pct}
              onChange={e => set('body_fat_pct', e.target.value)} style={{ paddingRight: 24 }} />
          </InputWrap>
        </Field>
      </div>

      <Field label="Notes" optional>
        <textarea className={styles.textarea}
          placeholder="Time of day, before/after coffee, how you felt stepping on…"
          value={form.notes} onChange={e => set('notes', e.target.value)} />
      </Field>

      <SubmitRow label="Log weight →" isPending={mut.isPending} error={mut.isError ? mut.error : null} />
    </form>
  );
}

// ── Tab config ────────────────────────────────────────────────

const TABS = [
  { id: 'run',       numeral: '01', label: 'Run',       kicker: 'The body in motion',       italic: 'miles, minutes, the pulse of it' },
  { id: 'lift',      numeral: '02', label: 'Lift',      kicker: 'Strength practice',         italic: 'a session, named and noted' },
  { id: 'nutrition', numeral: '03', label: 'Nutrition', kicker: 'What you ate',              italic: 'fuel, on the record' },
  { id: 'sleep',     numeral: '04', label: 'Sleep',     kicker: 'The other half',            italic: 'rest is a kind of training' },
  { id: 'weight',    numeral: '05', label: 'Weight',    kicker: 'A number, taken kindly',    italic: 'one data point, not the verdict' },
];

const FORMS = { run: RunForm, lift: LiftForm, nutrition: NutritionForm, sleep: SleepForm, weight: WeightForm };

function formatTodayLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// ── Page ──────────────────────────────────────────────────────

export default function Log() {
  const [tab, setTab] = useState('run');
  const [toast, setToast] = useState(null);

  const handleSuccess = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const activeTab = TABS.find(t => t.id === tab);
  const Form = FORMS[tab];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>Log · {formatTodayLabel()}</div>
        <h1 className={styles.title}>
          What <em>happened</em> today?
        </h1>
        <p className={styles.subtitle}>
          {activeTab.italic}.{' '}
          <span style={{ color: 'var(--fg-3)' }}>Choose a category below.</span>
        </p>
      </header>

      <div className={styles.card}>
        {/* Tab row */}
        <div className={styles.tabRow} role="tablist">
          {TABS.map(t => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                onClick={() => setTab(t.id)}
              >
                <span className={`${styles.tabNumeral} ${isActive ? styles.tabNumeralActive : ''}`}>
                  {t.numeral}
                </span>
                <span className={`${styles.tabLabel} ${isActive ? styles.tabLabelActive : ''}`}>
                  {t.label}
                </span>
                <span className={`${styles.tabUnderline} ${isActive ? styles.tabUnderlineActive : ''}`} />
              </button>
            );
          })}
        </div>

        {/* Card body — fades on tab change */}
        <div key={tab} className={styles.cardBody}>
          <div className={styles.cardHead}>
            <div>
              <div className={styles.rule} />
              <div className={styles.kicker}>{activeTab.kicker}</div>
              <div className={styles.kickerMeta}>
                FORM {activeTab.numeral} · {activeTab.label.toUpperCase()}
              </div>
            </div>
            <SunMark size={20} />
          </div>
          <Form onSuccess={handleSuccess} />
        </div>
      </div>

      <div className={styles.pageFooter}>
        <span>Zone 5 · a SortoLiving property</span>
        <span>You can edit any entry from the timeline →</span>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
