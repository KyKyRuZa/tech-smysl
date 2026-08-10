'use client';

import { memo } from 'react';
import { useInView } from '@/hooks/useInView';
import BlockControls from '@/components/admin/BlockControls';
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

interface ArticleCardProps {
  item: ArticleItem;
  index: number;
  editable?: boolean;
  onEdit?: (item: ArticleItem, index: number) => void;
  onDelete?: (item: ArticleItem, index: number) => void;
  onToggle?: (item: ArticleItem, index: number) => void;
}

function ArticleCardInner({
  item,
  index,
  editable,
  onEdit,
  onDelete,
  onToggle,
}: ArticleCardProps) {
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

export const ArticleCard = memo(ArticleCardInner);
