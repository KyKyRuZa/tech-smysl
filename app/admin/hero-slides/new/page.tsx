import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import AdminForm, { type FieldDef } from '@/components/admin/AdminForm'
import styles from '../../admin.module.css'

const fields: FieldDef[] = [
  { name: 'imageUrl', label: 'Изображение', type: 'file', required: true },
  { name: 'imageAlt', label: 'Alt изображения', type: 'text' },
  { name: 'title', label: 'Заголовок', type: 'text' },
  { name: 'subtitle', label: 'Подзаголовок', type: 'text' },
  { name: 'ctaText', label: 'Текст кнопки', type: 'text' },
  { name: 'ctaLink', label: 'Ссылка кнопки', type: 'text' },
  { name: 'order', label: 'Порядок', type: 'number' },
  { name: 'published', label: 'Опубликовано', type: 'checkbox' },
]

export default async function NewHeroSlidePage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>Новый слайд</h1>
      </div>
      <div className={styles.adminCard}>
        <AdminForm entity="hero-slides" fields={fields} redirectPath="/admin/hero-slides" />
      </div>
    </div>
  )
}
