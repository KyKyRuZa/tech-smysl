'use client';

import { useInView } from '@/hooks/useInView';
import styles from './CTA.module.css';

const CTA: React.FC = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const email = 'digital@techsmysl.ru';

  return (
    <section className={styles.ctaSection}>
      <div className={styles.ctaInner} ref={ref}>
        <div
          className={`${styles.ctaLeft} ${styles.animateIn} ${isInView ? styles.visible : ''}`}
        >
          <p className={styles.ctaLabel}>+30 проектов в год · 99,9% аптайм</p>
          <h2 className={styles.ctaTitle}>Нужна разработка, внедрение или поддержка?</h2>
          <p className={styles.ctaText}>
            Фиксируем смету до старта. Оплата поэтапно. Гарантируем сроки или выплачиваем штраф.
          </p>
          <div className={styles.ctaActions}>
            <a href={`mailto:${email}`} className="btn btn-primary">
              Обсудить проект
            </a>
          </div>
          <span className={styles.microNote}>Ответ в течение 15 минут · Можно в Telegram</span>
        </div>
      </div>
    </section>
  );
};

export default CTA;
