import styles from './page.module.css'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Projects() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
  })

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Проекты</h1>
      {projects.length === 0 ? (
        <p className={styles.placeholder}>Проектов пока нет.</p>
      ) : (
        <ul className={styles.grid}>
          {projects.map((project) => (
            <li key={project.id} className={styles.card}>
              {project.imageUrl && (
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className={styles.cardImg}
                  loading="lazy"
                  width={800}
                  height={600}
                />
              )}
              <h2 className={styles.cardTitle}>{project.title}</h2>
              {project.subtitle && <p className={styles.cardText}>{project.subtitle}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
