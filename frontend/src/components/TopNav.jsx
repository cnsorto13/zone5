import { NavLink, Link } from 'react-router-dom';
import styles from './TopNav.module.css';

const NAV_ITEMS = [
  { label: 'Home',      to: '/' },
  { label: 'Log',       to: '/log' },
  { label: 'History',   to: '/history' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Timeline',  to: '/timeline' },
];

export default function TopNav() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.brand}>
        <div className={styles.logo}>5</div>
        <span className={styles.wordmark}>zone 5</span>
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
        <span className={styles.date}>{today.toLowerCase()}</span>
        <div className={styles.avatar} />
      </div>
    </nav>
  );
}
