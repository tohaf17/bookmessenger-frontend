'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <button type="button" className="btn-secondary" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft size={16} />
        Prev
      </button>
      <span className={styles.indicator}>{page} / {totalPages}</span>
      <button type="button" className="btn-secondary" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
