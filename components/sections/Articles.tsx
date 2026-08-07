'use client';

import { useInView } from '@/hooks/useInView';
import BlockControls from '@/components/admin/BlockControls';
import BlockAddButton from '@/components/admin/BlockAddButton';
import styles from './Articles.module.css';

export interface ArticleItem {
  id: string;
  title: string;
  excerpt: string;
  readTime: string;
  link: string;
  order: number;
  published?: boolean;
}

const ITEMS: ArticleItem[] = [
  {
    id: 'article-1',
    title: 'Как выбрать стек для стартапа',
    excerpt:
      'Сравнение популярных технологий для MVP: React vs Vue, Node vs Python, PostgreSQL vs MongoDB.',
    readTime: '8 мин',
    link: '#',
    order: 0,
  },
  {
    id: 'article-2',
    title: '3D-визуализация: когда это оправдано',
    excerpt:
      'Когда фотореалистичный рендер даёт +45% к конверсии, а когда достаточно обычных изображений.',
    readTime: '6 мин',
    link: '#',
    order: 1,
  },
  {
    id: 'article-3',
    title: 'AR в ритейле: примеры и ROI',
    excerpt:
      'Как дополненная реальность увеличивает конверсию на 55% и снижает возвраты на 15%.',
    readTime: '10 мин',
    link: '#',
    order: 2,
  },
];

interface ArticlesProps {
  items?: ArticleItem[];
  editable?: boolean;
  onAdd?: () => void;
  onEdit?: (item: ArticleItem, index: number) => void;
  onDelete?: (item: ArticleItem, index: number) => void;
  onToggle?: (item: ArticleItem, index: number) => void;
}

const Articles: React.FC<ArticlesProps> = ({
  items: externalItems,
  editable,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const { ref: headRef, isInView: headVisible } = useInView({ threshold: 0.1 });
  const items = externalItems !== undefined ? externalItems : ITEMS;
  const isEmpty = items.length === 0;

  return (
    <section
      className={styles.articles}
      style={editable ? { position: 'relative' } : undefined}
    >
      <div className={styles.articlesInner}>
        <div className={styles.articlesHead} ref={headRef}>
          <h2
            className={`${styles.articlesTitle} ${styles.animateIn} ${headVisible ? styles.visible : ''}`}
          >
            Полезное
          </h2>
          <p
            className={`${styles.articlesSubtitle} ${styles.animateIn} ${headVisible ? styles.visible : ''}`}
            style={{ transitionDelay: '0.1s' }}
          >
            Гайды и статьи по разработке
          </p>
        </div>

        <div className={styles.articlesGrid}>
          {items.length === 0 ? (
            <p className={styles.empty}>Пока нет статей</p>
          ) : (
            items.map((item, i) => (
              <ArticleCard
                key={item.id}
                item={item}
                index={i}
                editable={editable}
                onAdd={onAdd}
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

function ArticleCard({
  item,
  index,
  editable,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: ArticleItem;
  index: number;
  editable?: boolean;
  onAdd?: () => void;
  onEdit?: (item: ArticleItem, index: number) => void;
  onDelete?: (item: ArticleItem, index: number) => void;
  onToggle?: (item: ArticleItem, index: number) => void;
}) {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <article
      ref={ref}
      className={`${styles.articleCard} ${styles.animateIn} ${editable || isInView ? styles.visible : ''}`}
      style={editable ? { position: 'relative', opacity: editable && !item.published ? 0.55 : 1 } : undefined}
    >
      <span className={styles.readTime}>{item.readTime}</span>
      <h3 className={styles.articleTitle}>{item.title}</h3>
      <p className={styles.articleExcerpt}>{item.excerpt}</p>
      <a href={item.link} className={styles.articleLink}>
        Все статьи →
      </a>
      {editable && (
        <BlockControls
          published={item.published}
          onEdit={() => onEdit?.(item, index)}
          onDelete={() => onDelete?.(item, index)}
          onToggle={() => onToggle?.(item, index)}
        />
      )}
    </article>
  );
}

export default Articles;
