import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminForm, { type FieldDef, type TranslationSection } from '@/components/admin/AdminForm'
import styles from '../../../admin.module.css'

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

export default async function HeroSlideEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session) redirect('/login')

  const { id } = await params
  const slide = await prisma.heroSlide.findUnique({
    where: { id },
    include: { translations: true },
  })

  const initialTranslations = slide?.translations.reduce<Record<string, Record<string, unknown>>>(
    (acc, t) => {
      acc[t.locale] = {
        title: t.title ?? '',
        subtitle: t.subtitle ?? '',
        ctaText: t.ctaText ?? '',
        imageAlt: t.imageAlt ?? '',
      }
      return acc
    },
    {}
  )

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>{slide ? 'Редактировать слайд' : 'Новый слайд'}</h1>
      </div>
      <div className={styles.adminCard}>
        {slide ? (
          <AdminForm
            entity="hero-slides"
            fields={baseFields}
            initialData={slide as unknown as Record<string, unknown>}
            translationSections={translationSections}
            initialTranslations={initialTranslations}
            redirectPath="/admin/hero-slides"
          />
        ) : (
          <p className={styles.adminEmpty}>Слайд не найден.</p>
        )}
      </div>
    </div>
  )
}
