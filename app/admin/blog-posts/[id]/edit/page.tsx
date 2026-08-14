import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminForm, { type FieldDef, type TranslationSection } from '@/components/admin/AdminForm'
import styles from '../../../admin.module.css'

const baseFields: FieldDef[] = [
  { name: 'imageUrl', label: 'Изображение', type: 'file' },
  { name: 'published', label: 'Опубликовано', type: 'checkbox' },
]

const translationSections: TranslationSection[] = [
  {
    locale: 'ru',
    label: 'RU',
    fields: [
      { name: 'title', label: 'Заголовок', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'excerpt', label: 'Анонс', type: 'textarea' },
      { name: 'content', label: 'Содержание', type: 'textarea', required: true },
      { name: 'tags', label: 'Теги (через запятую)', type: 'tags' },
    ],
  },
  {
    locale: 'en',
    label: 'EN',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { name: 'content', label: 'Content', type: 'textarea', required: true },
      { name: 'tags', label: 'Tags (comma separated)', type: 'tags' },
    ],
  },
]

export default async function BlogPostEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session) redirect('/login')

  const { id } = await params
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: { translations: true },
  })

  const initialTranslations = post?.translations.reduce<Record<string, Record<string, unknown>>>(
    (acc, t) => {
      acc[t.locale] = {
        title: t.title ?? '',
        slug: t.slug ?? '',
        excerpt: t.excerpt ?? '',
        content: t.content ?? '',
        tags: t.tags ?? [],
      }
      return acc
    },
    {}
  )

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>{post ? 'Редактировать статью' : 'Новая статья'}</h1>
      </div>
      <div className={styles.adminCard}>
        {post ? (
          <AdminForm
            entity="blog-posts"
            fields={baseFields}
            initialData={post as unknown as Record<string, unknown>}
            translationSections={translationSections}
            initialTranslations={initialTranslations}
            redirectPath="/admin/blog-posts"
          />
        ) : (
          <p className={styles.adminEmpty}>Статья не найдена.</p>
        )}
      </div>
    </div>
  )
}
