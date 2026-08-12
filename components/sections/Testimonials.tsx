'use client';

import { useInView } from '@/hooks/useInView';
import BlockControls from '@/components/admin/BlockControls';
import BlockAddButton from '@/components/admin/BlockAddButton';
import styles from './Testimonials.module.css';

export interface Testimonial {
  id?: string;
  headline: string;
  body: string;
  author: string;
  role: string;
  published?: boolean;
}

const ITEMS: Testimonial[] = [
  {
    headline: 'Корпоративный портал: 500+ сотрудников, 0 багов в продакшене',
    body: 'Тех Смысл реализовала внутренний портал за 45 дней. Оперативная доставка, чистая архитектура, стабильная работа. +35% производительности команды.',
    author: 'Руководитель цифровой трансформации',
    role: 'Корпоративный клиент',
  },
  {
    headline: 'MVP стартапа: инвестиции привлечены, приложение в App Store',
    body: 'Разработали React-приложение с AI-функциями за 6 недель. Вышли на рынок, привлекли 2.5 млн ₽ инвестиций. Сэкономили клиенту 400 тыс. ₽.',
    author: 'CEO стартапа',
    role: 'Технологический сектор',
  },
  {
    headline: 'Миграция в облако AWS: без простоя 99,9% времени',
    body: 'Перешли инфраструктуру на AWS, настроили Kubernetes и CI/CD. Downtime — нулевой, поддержка круглосуточная. –30% на инфраструктурные расходы.',
    author: 'CTO',
    role: 'Финтех компания',
  },
  {
    headline: 'Мобильное приложение: 5★ из 5, 10 000+ скачиваний',
    body: 'Flutter-приложение собрало сотни положительных отзывов. Чистый код, отзывчивый интерфейс. +70% удержание пользователей.',
    author: 'Продукт-менеджер',
    role: 'Ритейл',
  },
];

interface TestimonialsProps {
  items?: Testimonial[];
  editable?: boolean;
  onAdd?: () => void;
  onEdit?: (item: Testimonial, index: number) => void;
  onDelete?: (item: Testimonial, index: number) => void;
  onToggle?: (item: Testimonial, index: number) => void;
  title?: string;
  titleLine2?: string;
  note?: string;
  allReviewsText?: string;
  emptyText?: string;
}

const Testimonials: React.FC<TestimonialsProps> = ({
  items: externalItems,
  editable,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  title,
  titleLine2,
  note,
  allReviewsText,
  emptyText,
}) => {
  const { ref: headRef, isInView: headVisible } = useInView({ threshold: 0.1 });
  const items = externalItems !== undefined ? externalItems : ITEMS;

  return (
    <section
      className={styles.testimonials}
      style={editable ? { position: 'relative' } : undefined}
    >
      <div className={styles.testimonialsInner}>
        <div className={styles.testimonialsHead} ref={headRef}>
          <div>
            <h2
              className={`${styles.testimonialsTitle} ${styles.animateIn} ${headVisible ? styles.visible : ''}`}
            >
              {title ?? 'Истории успеха'}
              <br />
              {titleLine2 ?? 'от 50+ клиентов'}
            </h2>
          </div>
          <div
            className={`${styles.testimonialsNoteWrap} ${styles.animateIn} ${headVisible ? styles.visible : ''}`}
            style={{ transitionDelay: '0.1s' }}
          >
            <span className={styles.testimonialsStar}>★ 4.8</span>
            <p className={styles.testimonialsNote}>
              {note ?? 'Более 50 успешных проектов по веб-разработке, мобильным приложениям и AI'}
            </p>
          </div>
        </div>

        <div className={styles.tAllBtn}>
          <a href="#" className="btn-outline-sm">
            {allReviewsText ?? 'Все отзывы'}
          </a>
        </div>

        <div className={styles.testimonialsGrid}>
          {items.length === 0 ? (
            <p className={styles.empty}>{emptyText ?? 'Пока нет отзывов'}</p>
          ) : (
            items.map((item, i) => (
              <TestimonialCard
                key={i}
                item={item}
                index={i}
                editable={editable}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggle={onToggle}
              />
            ))
          )}
        </div>
      </div>
      {editable && <BlockAddButton onAdd={onAdd} />}
    </section>
  );
};

function TestimonialCard({
  item,
  index,
  editable,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: Testimonial;
  index: number;
  editable?: boolean;
  onEdit?: (item: Testimonial, index: number) => void;
  onDelete?: (item: Testimonial, index: number) => void;
  onToggle?: (item: Testimonial, index: number) => void;
}) {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`${styles.tCard} ${styles.animateIn} ${editable || isInView ? styles.visible : ''}`}
      style={editable ? { position: 'relative', opacity: editable && !item.published ? 0.55 : 1 } : undefined}
    >
      <div className={styles.tCardText}>
        {item.headline}
        <span>{item.body}</span>
      </div>
      <div className={styles.tAuthor}>
        <div className={styles.tAvatar} />
        <div>
          <p className={styles.tName}>{item.author}</p>
          <p className={styles.tRole}>{item.role}</p>
        </div>
      </div>
      {editable && (
        <BlockControls
          published={item.published}
          onEdit={() => onEdit?.(item, index)}
          onDelete={() => onDelete?.(item, index)}
          onToggle={() => onToggle?.(item, index)}
        />
      )}
    </div>
  );
}

export default Testimonials;
