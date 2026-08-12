import styles from '../page.module.css'
import { getPublicProjectBySlug } from '@/lib/public-queries'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getPublicProjectBySlug(slug)

  if (!project || !project.published) {
    notFound()
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{project.title}</h1>
      {project.subtitle && <p className={styles.placeholder}>{project.subtitle}</p>}
      {project.imageUrl && (
        <Image
          src={project.imageUrl}
          alt={project.title}
          className={styles.cardImg}
          width={1200}
          height={600}
        />
      )}
      {project.content && <p className={styles.placeholder} style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{project.content}</p>}
    </div>
  )
}
