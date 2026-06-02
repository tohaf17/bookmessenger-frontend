import type { InputHTMLAttributes, ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import styles from './FormInput.module.css';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
  registration?: UseFormRegisterReturn;
}

export default function FormInput({ label, icon, error, registration, ...props }: FormInputProps) {
  return (
    <label className={styles.group}>
      <span className={styles.label}>{label}</span>
      <span className={styles.wrapper}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input className={`glass-input ${icon ? styles.withIcon : ''}`} {...registration} {...props} />
      </span>
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}
