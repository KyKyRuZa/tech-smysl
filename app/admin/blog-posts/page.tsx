import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getAdminBlogPosts } from '@/lib/admin-queries'
import Link from 'next/link'
import RowActions from '@/components/admin/RowActions'
import styles from '../admin.module.css'

export default async function BlogPostsPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  const posts = await getAdminBlogPosts()

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>Статьи</h1>
        <Link href="/admin/blog-posts/new" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}>
          Новая статья
        </Link>
      </div>
      <div className={styles.adminCard}>
        {posts.length === 0 ? (
          <div className={styles.adminEmpty}>
            <p>Статей пока нет.</p>
            <Link href="/admin/blog-posts/new" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}>
              Создать первую статью
            </Link>
          </div>
        ) : (
          <div className={styles.adminTableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Заголовок (RU)</th>
                  <th>Заголовок (EN)</th>
                  <th>Slug</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const ru = post.translations.find((t) => t.locale === 'ru')
                  const en = post.translations.find((t) => t.locale === 'en')
                  return (
                    <tr key={post.id}>
                      <td className={styles.adminTableTitle}>{ru?.title ?? '—'}</td>
                      <td>{en?.title ?? '—'}</td>
                      <td>{ru?.slug ?? post.slug ?? '—'}</td>
                      <td>
                        <span
                          className={`${styles.adminBadge} ${post.published ? styles.adminBadgePublished : styles.adminBadgeDraft}`}
                        >
                          {post.published ? 'Опубликована' : 'Черновик'}
                        </span>
                      </td>
                      <td>
                        <RowActions entity="blog-posts" id={post.id} redirectPath="/admin/blog-posts" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
