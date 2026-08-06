import styles from './EditableOverlay.module.css'

interface EditableOverlayProps {
  label?: string;
  onClick: () => void;
}

export default function EditableOverlay({ label = 'Редактировать', onClick }: EditableOverlayProps) {
  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      role="button"
      tabIndex={0}
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <span className={styles.badge}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        {label}
      </span>
    </div>
  );
}
