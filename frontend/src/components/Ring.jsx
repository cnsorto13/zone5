import styles from './Ring.module.css';

export default function Ring({ size = 120, pct = 0, color = 'var(--anchor)', label, sub }) {
  const r = size / 2 - 10;
  const circumference = 2 * Math.PI * r;
  return (
    <div className={styles.wrap} style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={`${circumference * pct} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div className={styles.center}>
        <span className={styles.label}>{label}</span>
        {sub && <span className={styles.sub}>{sub}</span>}
      </div>
    </div>
  );
}
