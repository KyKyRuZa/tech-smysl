import styles from './page.module.css'
import { getLocalizedBlogPosts } from '@/lib/i18n/queries'
import Image from 'next/image'
import Link from 'next/link'
import { getLocaleFromPath, isValidLocale } from '@/lib/i18n/get-locale'
import { getTranslations } from '@/lib/i18n/translations'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  if (!locale || !isValidLocale(locale)) return {}

  const t = getTranslations(locale)

  return {
    title: t.blog.title,
    description: locale === 'ru'
      ? 'Статьи о разработке, 3D-визуализации, AR и AI-решениях от Tech Smysl.'
      : 'Articles about development, 3D visualization, AR and AI solutions by Tech Smysl.',
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        ru: '/ru/blog',
        en: '/en/blog',
      },
    },
  }
}

export default async function Blog({ params }: Props) {
  const { locale } = await params
  if (!locale || !isValidLocale(locale)) notFound()

  const t = getTranslations(locale)
  const posts = await getLocalizedBlogPosts(locale)

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <ol className={styles.breadcrumbList}>
          <li className={styles.breadcrumbItem}>
            <Link href={`/${locale}`} className={styles.breadcrumbLink}>
              {t.blog.home}
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
          </li>
          <li className={styles.breadcrumbItem}>
            <span className={styles.breadcrumbCurrent}>{t.blog.title}</span>
          </li>
        </ol>
      </nav>
      <h1 className={styles.title}>{t.blog.title}</h1>
      {posts.length === 0 ? (
        <p className={styles.placeholder}>{t.blog.empty}</p>
      ) : (
        <ul className={styles.grid}>
          {posts.map((post) => (
            <li key={post.id} className={styles.card}>
              <Link href={`/${locale}/blog/${post.slug}`} className={styles.cardLink}>
                {post.imageUrl && (
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    className={styles.cardImg}
                    width={800}
                    height={600}
                    loading="lazy"
                  />
                )}
                <h2 className={styles.cardTitle}>{post.title}</h2>
                {post.excerpt && <p className={styles.cardText}>{post.excerpt}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
