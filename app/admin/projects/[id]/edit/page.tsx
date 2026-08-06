import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminForm, { type FieldDef } from '@/components/admin/AdminForm'
import styles from '../../../admin.module.css'

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

export default async function ProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session) redirect('/login')

  const { id } = await params
  const project = await prisma.project.findUnique({ where: { id } })

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>{project ? 'Редактировать проект' : 'Новый проект'}</h1>
      </div>
      <div className={styles.adminCard}>
        {project ? (
          <AdminForm
            entity="projects"
            fields={fields}
            initialData={project as unknown as Record<string, unknown>}
            redirectPath="/admin/projects"
          />
        ) : (
          <p className={styles.adminEmpty}>Проект не найден.</p>
        )}
      </div>
    </div>
  )
}
