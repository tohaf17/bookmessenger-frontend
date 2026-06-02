import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  total: number;
  color?: string;
}

export default function ProgressBar({ current, total, color }: ProgressBarProps) {
  const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.meta}>
        <span>{percent}%</span>
        <span>{current} / {total}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${percent}%`, background: color }} />
      </div>
    </div>
  );
}
