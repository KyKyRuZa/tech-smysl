import styles from './blog-post.module.css'
import { getLocalizedBlogPostBySlug } from '@/lib/i18n/queries'
import { isValidLocale } from '@/lib/i18n/get-locale'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!locale || !isValidLocale(locale)) return {}

  const post = await getLocalizedBlogPostBySlug(locale, slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: {
      canonical: `/${locale}/blog/${post.slug}`,
      languages: {
        ru: `/ru/blog/${slug}`,
        en: `/en/blog/${slug}`,
      },
    },
  }
}

export default async function BlogPostDetail({ params }: Props) {
  const { locale, slug } = await params
  if (!locale || !isValidLocale(locale)) notFound()

  const post = await getLocalizedBlogPostBySlug(locale, slug)

  if (!post || !post.published) {
    notFound()
  }

  const tags = post.tags?.filter(Boolean) ?? []
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <Link href={`/${locale}/blog`} className={styles.backLink}>
          <span>←</span>
          <span>{locale === 'ru' ? 'Назад к блогу' : 'Back to blog'}</span>
        </Link>

        <header className={styles.header}>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.meta}>
            {date && <span className={styles.date}>{date}</span>}
            {tags.length > 0 && (
              <div className={styles.tagsList}>
                {tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        </header>

        {post.imageUrl && (
          <div className={styles.imageWrapper}>
            <Image
              src={post.imageUrl}
              alt={post.title}
              className={styles.image}
              width={1200}
              height={675}
              priority
            />
          </div>
        )}

        {post.excerpt && (
          <p className={styles.excerpt}>{post.excerpt}</p>
        )}

        {post.content && (
          <div className={styles.content}>{post.content}</div>
        )}
      </div>
    </div>
  )
}
