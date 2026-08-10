'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useInView } from '@/hooks/useInView';
import styles from './Directions.module.css';

const BlockControls = dynamic(() => import('@/components/admin/BlockControls'), { ssr: false })

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

interface ProjectCardProps {
  project: Project;
  index: number;
  editable?: boolean;
  onEdit?: (project: Project, index: number) => void;
  onDelete?: (project: Project, index: number) => void;
  onToggle?: (project: Project, index: number) => void;
}

function ProjectCardInner({
  project,
  index,
  editable,
  onEdit,
  onDelete,
  onToggle,
}: ProjectCardProps) {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <article
      ref={ref}
      className={`${styles.projectCard} ${styles.animateIn} ${editable || isInView ? styles.visible : ''}`}
      style={editable ? { position: 'relative', opacity: editable && !project.published ? 0.55 : 1 } : undefined}
    >
      <Link
        href={`/projects/${project.slug || project.id}`}
        className={styles.projectCardLink}
      >
        <div className={styles.projectCardMedia}>
          <Image
            src={project.imageUrl || project.bgImage || '/projects/жк1.webp'}
            alt={project.title}
            loading="lazy"
            decoding="async"
            width={800}
            height={600}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/projects/жк1.webp';
            }}
          />
        </div>
        <div className={styles.projectCardBody}>
          <h3 className={styles.projectCardTitle}>{project.title}</h3>
          {project.subtitle && (
            <p className={styles.projectCardText}>{project.subtitle}</p>
          )}
        </div>
      </Link>
      {editable && (
        <BlockControls
          published={project.published}
          onEdit={() => onEdit?.(project, index)}
          onDelete={() => onDelete?.(project, index)}
          onToggle={() => onToggle?.(project, index)}
        />
      )}
    </article>
  );
}

export const ProjectCard = memo(ProjectCardInner);
