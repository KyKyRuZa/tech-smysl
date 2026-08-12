import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { Role } from '@prisma/client'
import { logger } from '@/lib/logger'

async function main() {
  const email = 'admin@techsmysl.ru'
  const password = process.env.DEFAULT_ADMIN_PASSWORD
  if (!password) {
    throw new Error('DEFAULT_ADMIN_PASSWORD is not set. Refusing to seed with a known default password.')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: Role.ADMIN },
    create: { email, passwordHash, role: Role.ADMIN },
  })

  await prisma.blogPostTranslation.deleteMany()
  await prisma.projectTranslation.deleteMany()
  await prisma.heroSlideTranslation.deleteMany()
  await prisma.reviewTranslation.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.project.deleteMany()
  await prisma.heroSlide.deleteMany()
  await prisma.review.deleteMany()

  logger.info('Admin seeded/updated', { email })

  const imageUrl = '/example/default.webp'

  const heroSlides = [
    {
      imageUrl,
      ctaLink: '#projects',
      order: 0,
      published: true,
      translations: {
        ru: { title: 'Тех Смысл', subtitle: '3D-визуализация, AR и интерактивные решения для недвижимости', ctaText: 'Смотреть проекты', imageAlt: '3D-визуализация жилого комплекса' },
        en: { title: 'Tech Smysl', subtitle: '3D visualization, AR and interactive solutions for real estate', ctaText: 'View projects', imageAlt: 'Residential complex 3D visualization' },
      },
    },
    {
      imageUrl,
      ctaLink: '#projects',
      order: 1,
      published: true,
      translations: {
        ru: { title: 'Дополненная реальность', subtitle: 'Оценивайте объекты не выходя из дома', ctaText: 'Узнать больше', imageAlt: 'AR-просмотр объекта' },
        en: { title: 'Augmented reality', subtitle: 'Evaluate properties without leaving home', ctaText: 'Learn more', imageAlt: 'AR property preview' },
      },
    },
  ]

  for (const slide of heroSlides) {
    const existing = await prisma.heroSlide.findFirst({ where: { order: slide.order } })
    const base = existing ? await prisma.heroSlide.update({ where: { id: existing.id }, data: { imageUrl: slide.imageUrl, ctaLink: slide.ctaLink, order: slide.order, published: slide.published } }) : await prisma.heroSlide.create({ data: { imageUrl: slide.imageUrl, ctaLink: slide.ctaLink, order: slide.order, published: slide.published } })

    for (const [locale, translation] of Object.entries(slide.translations)) {
      await prisma.heroSlideTranslation.upsert({
        where: { locale_slideId: { locale, slideId: base.id } },
        update: translation,
        create: { ...translation, locale, slideId: base.id },
      })
    }
  }
  logger.info('Hero slides seeded')

  const projects = [
    { imageUrl, order: 0, published: true, translations: { ru: { slug: '3d-nav', title: 'Интерактивная 3D-навигация', subtitle: 'Цифровая модель с перемещением: маршруты, помещения, парковки. –40% времени поиска.', benefits: ['Снижение времени поиска на 40%', 'Интерактивный интерфейс'], tags: ['3D', 'навигация'] }, en: { slug: 'interactive-3d-navigation', title: 'Interactive 3D Navigation', subtitle: 'Digital walkable model: routes, rooms, parking. –40% search time.', benefits: ['40% less search time', 'Interactive interface'], tags: ['3D', 'navigation'] } } },
    { imageUrl, order: 1, published: true, translations: { ru: { slug: '3d-houses', title: '3D-визуализация частных домов', subtitle: 'Фотореалистичные модели: архитектура, отделка, ландшафт. –25% на инвестиции.', benefits: ['Фотореалистичные рендеры', 'Экономия на инвестициях'], tags: ['3D', 'инвестиции'] }, en: { slug: '3d-houses', title: '3D Visualization of Private Houses', subtitle: 'Photorealistic models: architecture, finishes, landscape. –25% investment cost.', benefits: ['Photorealistic renders', 'Investment savings'], tags: ['3D', 'investment'] } } },
    { imageUrl, order: 2, published: true, translations: { ru: { slug: '3d-complex', title: '3D-визуализация жилых комплексов', subtitle: 'Детализированные модели: +45% эффективность продаж.', benefits: ['Рост продаж на 45%', 'Детализация уровня комнат'], tags: ['3D', 'жилые комплексы'] }, en: { slug: '3d-complex', title: '3D Visualization of Residential Complexes', subtitle: 'Detailed models: +45% sales efficiency.', benefits: ['45% sales growth', 'Room-level detail'], tags: ['3D', 'residential'] } } },
    { imageUrl, order: 3, published: true, translations: { ru: { slug: '3d-mall', title: '3D-визуализация ТЦ и коммерции', subtitle: 'Презентация торговых центров: +50% инвестиций на ранних стадиях.', benefits: ['Рост инвестиций на 50%', 'Ранняя стадия презентации'], tags: ['3D', 'коммерция'] }, en: { slug: '3d-mall', title: '3D Visualization of Malls and Retail', subtitle: 'Shopping center presentations: +50% early-stage investment.', benefits: ['50% more investment', 'Early-stage presentation'], tags: ['3D', 'retail'] } } },
    { imageUrl, order: 4, published: true, translations: { ru: { slug: 'ar-app', title: 'AR-приложения для просмотра объектов', subtitle: 'Дополненная реальность: оценка объектов не выходя из дома. +55% готовности к покупке.', benefits: ['Рост готовности к покупке на 55%', 'Мобильное приложение'], tags: ['AR', 'мобильное'] }, en: { slug: 'ar-app', title: 'AR Apps for Property Viewing', subtitle: 'Augmented reality: evaluate properties from home. +55% purchase intent.', benefits: ['55% higher purchase intent', 'Mobile app'], tags: ['AR', 'mobile'] } } },
    { imageUrl, order: 5, published: true, translations: { ru: { slug: 'interactive', title: 'Интерактивные столы и инсталляции', subtitle: 'Решения для презентаций и навигации. +70% вовлечённости.', benefits: ['Вовлечённость +70%', 'Сенсорное управление'], tags: ['интерактивные', 'презентации'] }, en: { slug: 'interactive', title: 'Interactive Tables and Installations', subtitle: 'Presentation and navigation solutions. +70% engagement.', benefits: ['70% more engagement', 'Touch control'], tags: ['interactive', 'presentations'] } } },
  ]

  for (const project of projects) {
    const existing = await prisma.project.findFirst({ where: { order: project.order } })
    const base = existing ? await prisma.project.update({ where: { id: existing.id }, data: { imageUrl: project.imageUrl, order: project.order, published: project.published } }) : await prisma.project.create({ data: { imageUrl: project.imageUrl, order: project.order, published: project.published } })

    for (const [locale, translation] of Object.entries(project.translations)) {
      await prisma.projectTranslation.upsert({
        where: { locale_projectId: { locale, projectId: base.id } },
        update: translation,
        create: { ...translation, locale, projectId: base.id },
      })
    }
  }
  logger.info('Projects seeded')

  const reviews = [
    { avatarUrl: imageUrl, rating: 5, order: 0, published: true, translations: { ru: { headline: 'Корпоративный портал: 500+ сотрудников, 0 багов в продакшене', body: 'Тех Смысл реализовала внутренний портал за 45 дней. Оперативная доставка, чистая архитектура, стабильная работа. +35% производительности команды.', author: 'Руководитель цифровой трансформации', role: 'Корпоративный клиент' }, en: { headline: 'Corporate portal: 500+ employees, 0 production bugs', body: 'Tech Smysl delivered an internal portal in 45 days. Fast delivery, clean architecture, stable operation. +35% team productivity.', author: 'Head of Digital Transformation', role: 'Corporate client' } } },
    { avatarUrl: imageUrl, rating: 5, order: 1, published: true, translations: { ru: { headline: 'MVP стартапа: инвестиции привлечены, приложение в App Store', body: 'Разработали React-приложение с AI-функциями за 6 недель. Вышли на рынок, привлекли 2.5 млн ₽ инвестиций. Сэкономили клиенту 400 тыс. ₽.', author: 'CEO стартапа', role: 'Технологический сектор' }, en: { headline: 'Startup MVP: funding raised, app in the App Store', body: 'Built a React app with AI features in 6 weeks. Launched to market, raised 2.5M RUB in funding. Saved the client 400K RUB.', author: 'Startup CEO', role: 'Technology sector' } } },
    { avatarUrl: imageUrl, rating: 5, order: 2, published: true, translations: { ru: { headline: 'Миграция в облако AWS: без простоя 99,9% времени', body: 'Перешли инфраструктуру на AWS, настроили Kubernetes и CI/CD. Downtime — нулевой, поддержка круглосуточная. –30% на инфраструктурные расходы.', author: 'CTO', role: 'Финтех компания' }, en: { headline: 'AWS cloud migration: 99.9% uptime, zero downtime', body: 'Migrated infrastructure to AWS, set up Kubernetes and CI/CD. Zero downtime, 24/7 support. –30% infrastructure costs.', author: 'CTO', role: 'Fintech company' } } },
    { avatarUrl: imageUrl, rating: 5, order: 3, published: true, translations: { ru: { headline: 'Мобильное приложение: 5★ из 5, 10 000+ скачиваний', body: 'Flutter-приложение собрало сотни положительных отзывов. Чистый код, отзывчивый интерфейс. +70% удержание пользователей.', author: 'Продукт-менеджер', role: 'Ритейл' }, en: { headline: 'Mobile app: 5★ rating, 10,000+ downloads', body: 'Flutter app gathered hundreds of positive reviews. Clean code, responsive UI. +70% user retention.', author: 'Product Manager', role: 'Retail' } } },
  ]

  for (const review of reviews) {
    const existing = await prisma.review.findFirst({ where: { order: review.order } })
    const base = existing ? await prisma.review.update({ where: { id: existing.id }, data: { avatarUrl: review.avatarUrl, rating: review.rating, order: review.order, published: review.published } }) : await prisma.review.create({ data: { avatarUrl: review.avatarUrl, rating: review.rating, order: review.order, published: review.published } })

    for (const [locale, translation] of Object.entries(review.translations)) {
      await prisma.reviewTranslation.upsert({
        where: { locale_reviewId: { locale, reviewId: base.id } },
        update: translation,
        create: { ...translation, locale, reviewId: base.id },
      })
    }
  }
  logger.info('Reviews seeded')

  const posts = [
    { imageUrl, authorId: null, published: true, publishedAt: new Date(), translations: { ru: { slug: 'stack-startup', title: 'Как выбрать стек для стартапа', excerpt: 'Сравнение популярных технологий для MVP: React vs Vue, Node vs Python, PostgreSQL vs MongoDB.', content: 'Выбор стека технологий — одно из ключевых решений при запуске стартапа. В этой статье мы разбираем плюсы и минусы популярных комбинаций и даём рекомендации, которые помогут принять взвешенное решение.', tags: ['разработка', 'startup'] }, en: { slug: 'how-to-choose-startup-stack', title: 'How to choose a startup tech stack', excerpt: 'Comparing popular MVP tech stacks: React vs Vue, Node vs Python, PostgreSQL vs MongoDB.', content: 'Choosing a tech stack is one of the key decisions when launching a startup. In this article we break down the pros and cons of popular combinations and give recommendations to help you make a balanced decision.', tags: ['development', 'startup'] } } },
    { imageUrl, authorId: null, published: true, publishedAt: new Date(), translations: { ru: { slug: '3d-visualization-when', title: '3D-визуализация: когда это оправдано', excerpt: 'Когда фотореалистичный рендер даёт +45% к конверсии, а когда достаточно обычных изображений.', content: '3D-визуализация — мощный инструмент маркетинга недвижимости. Но когда она действительно даёт результат, а когда становится излишней? Мы собрали данные по десяткам проектов и готовы поделиться выводами.', tags: ['3D', 'недвижимость'] }, en: { slug: '3d-visualization-when', title: '3D visualization: when it pays off', excerpt: 'When photorealistic rendering gives +45% conversion, and when ordinary images are enough.', content: '3D visualization is a powerful real estate marketing tool. But when does it actually deliver results, and when does it become excessive? We gathered data from dozens of projects and are ready to share our findings.', tags: ['3D', 'real estate'] } } },
    { imageUrl, authorId: null, published: true, publishedAt: new Date(), translations: { ru: { slug: 'ar-retail-roi', title: 'AR в ритейле: примеры и ROI', excerpt: 'Как дополненная реальность увеличивает конверсию на 55% и снижает возвраты на 15%.', content: 'Дополненная реальность перестаёт быть экспериментальной технологией. В ритейле она уже показывает измеримый ROI: от снижения возвратов товаров до взрывного роста конверсии. Вот несколько кейсов и метрик.', tags: ['AR', 'ритейл'] }, en: { slug: 'ar-in-retail-examples-and-roi', title: 'AR in retail: examples and ROI', excerpt: 'How augmented reality increases conversion by 55% and reduces returns by 15%.', content: 'Augmented reality is no longer an experimental technology. In retail, it already shows measurable ROI: from reducing product returns to explosive conversion growth. Here are several cases and metrics.', tags: ['AR', 'retail'] } } },
  ]

  for (const post of posts) {
    const existing = await prisma.blogPost.findFirst({ where: { publishedAt: post.publishedAt } })
    const base = existing ? await prisma.blogPost.update({ where: { id: existing.id }, data: { imageUrl: post.imageUrl, authorId: post.authorId, published: post.published, publishedAt: post.publishedAt } }) : await prisma.blogPost.create({ data: { imageUrl: post.imageUrl, authorId: post.authorId, published: post.published, publishedAt: post.publishedAt } })

    for (const [locale, translation] of Object.entries(post.translations)) {
      await prisma.blogPostTranslation.upsert({
        where: { locale_postId: { locale, postId: base.id } },
        update: translation,
        create: { ...translation, locale, postId: base.id },
      })
    }
  }
  logger.info('Blog posts seeded')

  const applications = [
    { name: 'Иван Петров', email: 'ivan@example.com', phone: '+79990000001', service: '3D-визуализация', message: 'Нужна визуализация жилого комплекса из 3 зданий. Срок — 2 недели.', createdAt: new Date() },
    { name: 'Анна Смирнова', email: 'anna@example.com', phone: '+79990000002', service: 'AR-приложение', message: 'Хочу разработать AR-приложение для просмотра квартир в новостройке.', createdAt: new Date() },
    { name: 'ООО СтройИнвест', email: 'info@stroyinvest.ru', phone: '+78121234567', service: 'Интерактивное решение', message: 'Требуется интерактивный стол для презентационного зала. Обсуждаем техническое задание.', createdAt: new Date() },
  ]

  for (const app of applications) {
    const existing = await prisma.application.findFirst({ where: { email: app.email, message: app.message } })
    if (!existing) {
      await prisma.application.create({ data: app })
    }
  }
  logger.info('Applications seeded')
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
