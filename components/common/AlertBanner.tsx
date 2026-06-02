'use client';

import { X } from 'lucide-react';
import styles from './AlertBanner.module.css';

interface AlertBannerProps {
  type: 'success' | 'error';
  message: string;
  onClose?: () => void;
}

export default function AlertBanner({ type, message, onClose }: AlertBannerProps) {
  return (
    <div className={`${styles.banner} ${styles[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Close alert">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
