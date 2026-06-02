import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className={`glass-panel ${styles.empty}`}>
      {icon}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}
