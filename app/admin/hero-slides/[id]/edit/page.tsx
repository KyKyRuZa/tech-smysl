import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminForm, { type FieldDef } from '@/components/admin/AdminForm'
import styles from '../../../admin.module.css'

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

export default async function HeroSlideEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session) redirect('/login')

  const { id } = await params
  const slide = await prisma.heroSlide.findUnique({ where: { id } })

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>{slide ? 'Редактировать слайд' : 'Новый слайд'}</h1>
      </div>
      <div className={styles.adminCard}>
        {slide ? (
          <AdminForm
            entity="hero-slides"
            fields={fields}
            initialData={slide as unknown as Record<string, unknown>}
            redirectPath="/admin/hero-slides"
          />
        ) : (
          <p className={styles.adminEmpty}>Слайд не найден.</p>
        )}
      </div>
    </div>
  )
}
