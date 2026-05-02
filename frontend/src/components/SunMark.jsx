export default function SunMark({ size = 22, color = 'var(--philippine-gold)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="6" fill={color} />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="19" y="2" width="2" height="9" rx="1"
          fill={color} transform={`rotate(${i * 45} 20 20)`} />
      ))}
    </svg>
  );
}
