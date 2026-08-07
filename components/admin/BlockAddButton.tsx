'use client';

import styles from './BlockAddButton.module.css';

interface BlockAddButtonProps {
  onAdd?: () => void;
}

export default function BlockAddButton({ onAdd }: BlockAddButtonProps) {
  if (!onAdd) return null;

  return (
    <div className={styles.toolbar}>
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
    </div>
  );
}
