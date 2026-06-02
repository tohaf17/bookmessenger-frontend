import { Award, Bookmark, CheckCircle2, TrendingUp } from 'lucide-react';
import { useT } from '@/lib/translations';
import type { UserStats } from './types';
import css from './UserProfile.module.css';

interface ReadingStatsProps {
  stats: UserStats | null;
}

export default function ReadingStats({ stats }: ReadingStatsProps) {
  const t = useT();
  const booksReadCount = stats?.readCount ?? stats?.booksReadCount ?? 0;

  return (
    <div className={`glass-panel ${css.statsCard}`}>
      <h3 className={css.cardTitle}>
        <Award size={18} color="#9333ea" />
        {t('users.stats')}
      </h3>
      <StatLine tone="green" icon={<CheckCircle2 size={16} color="#10b981" />} value={booksReadCount} label={t('users.booksRead')} />
      <StatLine tone="purple" icon={<TrendingUp size={16} color="#9333ea" />} value={stats?.currentlyReadingCount || 0} label={t('users.reading')} />
      <StatLine tone="blue" icon={<Bookmark size={16} color="#3b82f6" />} value={stats?.wantToReadCount || 0} label={t('dashboard.wishlist')} />
    </div>
  );
}

function StatLine({ tone, icon, value, label }: { tone: 'green' | 'purple' | 'blue'; icon: React.ReactNode; value: number; label: string }) {
  const toneClass = tone === 'green' ? css.statIconGreen : tone === 'purple' ? css.statIconPurple : css.statIconBlue;
  return (
    <div className={css.statLine}>
      <div className={`${css.statIcon} ${toneClass}`}>{icon}</div>
      <div className={css.statContent}>
        <span className={css.statVal}>{value}</span>
        <span className={css.statLabel}>{label}</span>
      </div>
    </div>
  );
}
