import { Loader2 } from 'lucide-react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className={styles.container}>
      <Loader2 size={42} className={styles.spinner} />
      {message && <p>{message}</p>}
    </div>
  );
}
