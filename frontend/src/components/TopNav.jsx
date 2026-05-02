import { NavLink, Link } from 'react-router-dom';
import SunMark from './SunMark';
import styles from './TopNav.module.css';

const NAV_ITEMS = [
  { label: 'Home',      to: '/' },
  { label: 'Log',       to: '/log' },
  { label: 'History',   to: '/history' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Timeline',  to: '/timeline' },
];

export default function TopNav() {
  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.brand}>
        <SunMark size={24} />
        <div className={styles.wordmarkWrap}>
          <span className={styles.wordmark}>Zone</span>
          <em className={styles.wordmarkNum}>5</em>
          <span className={styles.sortoTag}>SortoLiving</span>
        </div>
      </Link>

      <div className={styles.links}>
        {NAV_ITEMS.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            {label}
          </NavLink>
        ))}
      </div>

      <div className={styles.meta}>
        <div className={styles.avatar}>CS</div>
      </div>
    </nav>
  );
}
