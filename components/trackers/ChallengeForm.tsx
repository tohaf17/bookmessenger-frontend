import { Loader2, Target } from 'lucide-react';
import { useT } from '@/lib/translations';
import css from './TrackersView.module.css';

interface ChallengeFormProps {
  targetCount: number;
  startDate: string;
  endDate: string;
  submitting: boolean;
  onTargetCountChange: (value: number) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export default function ChallengeForm({
  targetCount,
  startDate,
  endDate,
  submitting,
  onTargetCountChange,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
}: ChallengeFormProps) {
  const t = useT();

  return (
    <form onSubmit={onSubmit} className={`glass-panel ${css.formCard}`}>
      <h3 className={css.formCardTitle}>
        <Target size={20} color="#9333ea" />
        {t('trackers.new')}
      </h3>

      <div className={css.inputGroup}>
        <label className={css.label}>{t('trackers.targetBooks')}</label>
        <input type="number" min={1} value={targetCount} onChange={(e) => onTargetCountChange(Number(e.target.value))} className="glass-input" required />
      </div>
      <div className={css.inputGroup}>
        <label className={css.label}>{t('trackers.startDate')}</label>
        <input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} className="glass-input" required />
      </div>
      <div className={css.inputGroup}>
        <label className={css.label}>{t('trackers.endDate')}</label>
        <input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} className="glass-input" required />
      </div>

      <button type="submit" disabled={submitting} className={`btn-primary ${css.submitBtn}`}>
        {submitting ? <Loader2 size={16} className={css.spinner} /> : t('trackers.start')}
      </button>
    </form>
  );
}
