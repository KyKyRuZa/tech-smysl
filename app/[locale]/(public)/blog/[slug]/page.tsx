import { getLocalizedBlogPostBySlug } from '@/lib/i18n/queries'
import { getLocaleFromPath, isValidLocale } from '@/lib/i18n/get-locale'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Metadata } from 'next'

type Props = {
  params: { locale: string; slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = getLocaleFromPath(`/${params.locale}`)
  if (!locale || !isValidLocale(locale)) return {}

  const post = await getLocalizedBlogPostBySlug(locale, params.slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: {
      canonical: `/${locale}/blog/${post.slug}`,
      languages: {
        ru: `/ru/blog/${params.slug}`,
        en: `/en/blog/${params.slug}`,
      },
    },
  }
}

export default async function BlogPostDetail({ params }: Props) {
  const locale = getLocaleFromPath(`/${params.locale}`)
  if (!locale || !isValidLocale(locale)) notFound()

  const post = await getLocalizedBlogPostBySlug(locale, params.slug)

  if (!post || !post.published) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      {post.excerpt && <p className="text-lg text-gray-600 mb-6">{post.excerpt}</p>}
      {post.imageUrl && (
        <Image
          src={post.imageUrl}
          alt={post.title}
          width={1200}
          height={600}
          className="mb-8 rounded"
        />
      )}
      {post.content && (
        <div className="prose max-w-none whitespace-pre-wrap">{post.content}</div>
      )}
    </div>
  )
}
