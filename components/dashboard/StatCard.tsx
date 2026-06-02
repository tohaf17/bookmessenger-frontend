import type { ReactNode } from 'react';
import css from './DashboardView.module.css';

interface StatCardProps {
  icon: ReactNode;
  tone: 'purple' | 'green' | 'blue';
  value: number;
  label: string;
}

export default function StatCard({ icon, tone, value, label }: StatCardProps) {
  const toneClass = tone === 'purple' ? css.statIconPurple : tone === 'green' ? css.statIconGreen : css.statIconBlue;

  return (
    <div className={`glass-panel ${css.statCard}`}>
      <div className={`${css.statIconBox} ${toneClass}`}>{icon}</div>
      <div className={css.statText}>
        <span className={css.statVal}>{value}</span>
        <span className={css.statLabel}>{label}</span>
      </div>
    </div>
  );
}
