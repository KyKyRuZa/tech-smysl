import styles from './page.module.css'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'

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
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  className={styles.cardImg}
                  width={800}
                  height={600}
                  loading="lazy"
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
