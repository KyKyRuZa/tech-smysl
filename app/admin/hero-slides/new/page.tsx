import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import AdminForm, { type FieldDef, type TranslationSection } from '@/components/admin/AdminForm'
import styles from '../../admin.module.css'

const baseFields: FieldDef[] = [
  { name: 'imageUrl', label: 'Изображение', type: 'file', required: true },
  { name: 'imageAlt', label: 'Alt изображения', type: 'text' },
  { name: 'order', label: 'Порядок', type: 'number' },
  { name: 'published', label: 'Опубликовано', type: 'checkbox' },
  { name: 'ctaLink', label: 'Ссылка кнопки', type: 'text' },
]

const translationSections: TranslationSection[] = [
  {
    locale: 'ru',
    label: 'RU',
    fields: [
      { name: 'title', label: 'Заголовок', type: 'text', required: true },
      { name: 'subtitle', label: 'Подзаголовок', type: 'text' },
      { name: 'ctaText', label: 'Текст кнопки', type: 'text' },
    ],
  },
  {
    locale: 'en',
    label: 'EN',
    fields: [
      { name: 'title', label: 'Заголовок', type: 'text', required: true },
      { name: 'subtitle', label: 'Подзаголовок', type: 'text' },
      { name: 'ctaText', label: 'Текст кнопки', type: 'text' },
    ],
  },
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
        <AdminForm
          entity="hero-slides"
          fields={baseFields}
          translationSections={translationSections}
          redirectPath="/admin/hero-slides"
        />
      </div>
    </div>
  )
}
