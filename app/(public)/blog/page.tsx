import styles from './page.module.css'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function Blog() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      imageUrl: true,
      publishedAt: true,
    },
  })

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Блог</h1>
      {posts.length === 0 ? (
        <p className={styles.placeholder}>Статей пока нет.</p>
      ) : (
        <ul className={styles.grid}>
          {posts.map((post) => (
            <li key={post.id} className={styles.card}>
              {post.imageUrl && (
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  className={styles.cardImg}
                  width={800}
                  height={600}
                  loading="lazy"
                />
              )}
              <h2 className={styles.cardTitle}>{post.title}</h2>
              {post.excerpt && <p className={styles.cardText}>{post.excerpt}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
