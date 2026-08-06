import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import AdminForm, { type FieldDef } from '@/components/admin/AdminForm'
import styles from '../../admin.module.css'

const fields: FieldDef[] = [
  { name: 'title', label: 'Название', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', required: true },
  { name: 'subtitle', label: 'Подзаголовок', type: 'text' },
  { name: 'description', label: 'Описание', type: 'textarea' },
  { name: 'content', label: 'Содержание', type: 'textarea' },
  { name: 'heroImage', label: 'Главное изображение', type: 'file' },
  { name: 'bgImage', label: 'Фоновое изображение', type: 'file' },
  { name: 'imageUrl', label: 'Изображение', type: 'file' },
  { name: 'benefits', label: 'Преимущества (через запятую)', type: 'tags' },
  { name: 'useCases', label: 'Варианты использования', type: 'textarea' },
  { name: 'tags', label: 'Теги (через запятую)', type: 'tags' },
  { name: 'published', label: 'Опубликовано', type: 'checkbox' },
  { name: 'order', label: 'Порядок', type: 'number' },
]

export default async function NewProjectPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>Новый проект</h1>
      </div>
      <div className={styles.adminCard}>
        <AdminForm entity="projects" fields={fields} redirectPath="/admin/projects" />
      </div>
    </div>
  )
}
