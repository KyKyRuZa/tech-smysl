import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import AdminForm, { type FieldDef } from '@/components/admin/AdminForm'
import styles from '../../admin.module.css'

const fields: FieldDef[] = [
  { name: 'title', label: 'Заголовок', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', required: true },
  { name: 'excerpt', label: 'Анонс', type: 'textarea' },
  { name: 'content', label: 'Содержание', type: 'textarea', required: true },
  { name: 'imageUrl', label: 'Изображение', type: 'file' },
  { name: 'tags', label: 'Теги (через запятую)', type: 'tags' },
  { name: 'published', label: 'Опубликовано', type: 'checkbox' },
]

export default async function NewBlogPostPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>Новая статья</h1>
      </div>
      <div className={styles.adminCard}>
        <AdminForm entity="blog-posts" fields={fields} redirectPath="/admin/blog-posts" />
      </div>
    </div>
  )
}
