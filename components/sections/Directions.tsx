'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useInView } from '@/hooks/useInView';
import { ProjectCard } from './ProjectCard';
import BlockAddButton from '@/components/admin/BlockAddButton';
import styles from './Directions.module.css';

export interface Project {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  imageUrl?: string;
  bgImage?: string;
  published: boolean;
  order: number;
}

interface DirectionsProps {
  projects?: Project[];
  editable?: boolean;
  onAdd?: () => void;
  onEdit?: (project: Project, index: number) => void;
  onDelete?: (project: Project, index: number) => void;
  onToggle?: (project: Project, index: number) => void;
  title?: string;
  subtitle?: string;
  allProjectsText?: string;
  emptyText?: string;
  prevAria?: string;
  nextAria?: string;
  locale?: string
}

const PROJECTS: Project[] = [
  {
    id: '3d-nav',
    title: 'Интерактивная 3D-навигация',
    slug: '3d-nav',
    subtitle: 'Цифровая модель с перемещением: маршруты, помещения, парковки. –40% времени поиска.',
    imageUrl: '/projects/3d-nav.svg',
    published: true,
    order: 0,
  },
  {
    id: '3d-houses',
    title: '3D-визуализация частных домов',
    slug: '3d-houses',
    subtitle: 'Фотореалистичные модели: архитектура, отделка, ландшафт. –25% на инвестиции.',
    imageUrl: '/projects/3d-houses.svg',
    published: true,
    order: 1,
  },
  {
    id: '3d-complex',
    title: '3D-визуализация жилых комплексов',
    slug: '3d-complex',
    subtitle: 'Детализированные модели: +45% эффективность продаж.',
    imageUrl: '/projects/3d-complex.svg',
    published: true,
    order: 2,
  },
  {
    id: '3d-mall',
    title: '3D-визуализация ТЦ и коммерции',
    slug: '3d-mall',
    subtitle: 'Презентация торговых центров: +50% инвестиций на ранних стадиях.',
    imageUrl: '/projects/3d-mall.svg',
    published: true,
    order: 3,
  },
  {
    id: 'ar-app',
    title: 'AR-приложения для просмотра объектов',
    slug: 'ar-app',
    subtitle: 'Дополненная реальность: оценка объектов не выходя из дома. +55% готовности к покупке.',
    imageUrl: '/projects/ar-app.svg',
    published: true,
    order: 4,
  },
  {
    id: 'interactive',
    title: 'Интерактивные столы и инсталляции',
    slug: 'interactive',
    subtitle: 'Решения для презентаций и навигации. +70% вовлечённости.',
    imageUrl: '/projects/interactive.svg',
    published: true,
    order: 5,
  },
];

const Directions: React.FC<DirectionsProps> = ({
  projects: externalProjects,
  editable,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  title,
  subtitle,
  allProjectsText,
  emptyText,
  prevAria,
  nextAria,
  locale = 'ru',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ref: headRef, isInView: headVisible } = useInView({ threshold: 0.1 });

  const projects = externalProjects !== undefined ? externalProjects : PROJECTS;

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section
      className={styles.directions}
      style={editable ? { position: 'relative' } : undefined}
    >
      <div className={styles.directionsInner}>
        <div className={styles.directionsHead} ref={headRef}>
          <div className={`${styles.animateIn} ${headVisible ? styles.visible : ''}`}>
            <h2 className={styles.directionsTitle}>{title ?? 'Проекты'}</h2>
            <p className={styles.directionsSubtitle}>{subtitle ?? '3D-визуализация, AR и интерактивные решения'}</p>
          </div>
          <Link
            href={`/${locale}/projects`}
            className="btn btn-outline-white"
            style={{ opacity: headVisible ? 1 : 0, transform: headVisible ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.5s ease-out 0.2s, transform 0.5s ease-out 0.2s' }}
          >
            {allProjectsText ?? 'Все проекты'}
          </Link>
        </div>

        <div className={styles.directionsCarouselWrap}>
          {projects.length === 0 ? (
            <p className={styles.empty}>{emptyText ?? 'Пока нет проектов'}</p>
          ) : (
            <div className={styles.directionsGrid} ref={scrollRef}>
              {projects.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  editable={editable}
                  locale={locale}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggle={onToggle}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.dirNav}>
          <button
            className={styles.dirArrow}
            onClick={() => scroll('left')}
            aria-label={prevAria ?? 'Назад'}
          >
            ‹
          </button>
          <button
            className={styles.dirArrow}
            onClick={() => scroll('right')}
            aria-label={nextAria ?? 'Вперёд'}
          >
            ›
          </button>
        </div>
      </div>
      {editable && <BlockAddButton onAdd={onAdd} />}
    </section>
  );
};

export default Directions;
