'use client'

import styles from './BlockControls.module.css'

interface BlockControlsProps {
  published?: boolean;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
}

export default function BlockControls({
  published,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: BlockControlsProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.overlay} onClick={onEdit} />
      <div className={styles.toolbar}>
        {onAdd && (
          <button
            type="button"
            className={styles.btn}
            title="Создать"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            className={styles.btn}
            title="Редактировать"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className={`${styles.btn} ${styles.danger}`}
            title="Удалить"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        )}
        {onToggle && (
          <button
            type="button"
            className={styles.btn}
            title={published ? 'Скрыть' : 'Показать'}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {published ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3 3.9" />
                <path d="M6.1 6.1A17.6 17.6 0 0 0 2 11s3.5 7 10 7a10.9 10.9 0 0 0 4.5-.9" />
                <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
