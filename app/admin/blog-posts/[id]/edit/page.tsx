import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminForm, { type FieldDef } from '@/components/admin/AdminForm'
import styles from '../../../admin.module.css'

const fields: FieldDef[] = [
  { name: 'title', label: 'Заголовок', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', required: true },
  { name: 'excerpt', label: 'Анонс', type: 'textarea' },
  { name: 'content', label: 'Содержание', type: 'textarea', required: true },
  { name: 'imageUrl', label: 'Изображение', type: 'file' },
  { name: 'tags', label: 'Теги (через запятую)', type: 'tags' },
  { name: 'published', label: 'Опубликовано', type: 'checkbox' },
]

export default async function BlogPostEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session) redirect('/login')

  const { id } = await params
  const post = await prisma.blogPost.findUnique({ where: { id } })

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>{post ? 'Редактировать статью' : 'Новая статья'}</h1>
      </div>
      <div className={styles.adminCard}>
        {post ? (
          <AdminForm
            entity="blog-posts"
            fields={fields}
            initialData={post as unknown as Record<string, unknown>}
            redirectPath="/admin/blog-posts"
          />
        ) : (
          <p className={styles.adminEmpty}>Статья не найдена.</p>
        )}
      </div>
    </div>
  )
}
