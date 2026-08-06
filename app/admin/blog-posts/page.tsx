import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import styles from '../admin.module.css'

export default async function BlogPostsPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  const posts = await prisma.blogPost.findMany({ orderBy: { publishedAt: 'desc' } })

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>Статьи</h1>
        <a href="/admin/blog-posts/new" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}>
          Новая статья
        </a>
      </div>
      <div className={styles.adminCard}>
        {posts.length === 0 ? (
          <div className={styles.adminEmpty}>
            <p>Статей пока нет.</p>
          </div>
        ) : (
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Заголовок</th>
                <th>Slug</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td>{post.slug}</td>
                  <td>
                    <span
                      className={`${styles.adminBadge} ${post.published ? styles.adminBadgePublished : styles.adminBadgeDraft}`}
                    >
                      {post.published ? 'Опубликована' : 'Черновик'}
                    </span>
                  </td>
                  <td>
                    <a
                      href={`/admin/blog-posts/${post.id}/edit`}
                      className={`${styles.adminBtn} ${styles.adminBtnSecondary} ${styles.adminBtnSm}`}
                    >
                      Редактировать
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
