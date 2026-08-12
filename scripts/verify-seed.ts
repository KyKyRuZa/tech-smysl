import 'dotenv/config'
import { prisma } from '@/lib/prisma'

async function main() {
  console.log('Projects:', await prisma.project.count())
  console.log('ProjectTranslations:', await prisma.projectTranslation.count())
  console.log('BlogPosts:', await prisma.blogPost.count())
  console.log('BlogPostTranslations:', await prisma.blogPostTranslation.count())
  console.log('HeroSlides:', await prisma.heroSlide.count())
  console.log('HeroSlideTranslations:', await prisma.heroSlideTranslation.count())
  console.log('Reviews:', await prisma.review.count())
  console.log('ReviewTranslations:', await prisma.reviewTranslation.count())
}

main().finally(async () => await prisma.$disconnect())
