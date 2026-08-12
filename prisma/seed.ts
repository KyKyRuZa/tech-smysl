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

  logger.info('Admin seeded/updated', { email })

  const imageUrl = '/example/default.webp'

  const heroSlides = [
    { imageUrl, imageAlt: '3D-визуализация жилого комплекса', title: 'Тех Смысл', subtitle: '3D-визуализация, AR и интерактивные решения для недвижимости', ctaText: 'Смотреть проекты', ctaLink: '#projects', order: 0, published: true },
    { imageUrl, imageAlt: 'AR-просмотр объекта', title: 'Дополненная реальность', subtitle: 'Оценивайте объекты не выходя из дома', ctaText: 'Узнать больше', ctaLink: '#projects', order: 1, published: true },
  ]

  for (const slide of heroSlides) {
    const existing = await prisma.heroSlide.findFirst({ where: { title: slide.title } })
    if (existing) {
      await prisma.heroSlide.update({ where: { id: existing.id }, data: slide })
    } else {
      await prisma.heroSlide.create({ data: slide })
    }
  }
  logger.info('Hero slides seeded')

  const projects = [
    { slug: '3d-nav', title: 'Интерактивная 3D-навигация', subtitle: 'Цифровая модель с перемещением: маршруты, помещения, парковки. –40% времени поиска.', imageUrl, benefits: ['Снижение времени поиска на 40%', 'Интерактивный интерфейс'], tags: ['3D', 'навигация'], published: true, order: 0 },
    { slug: '3d-houses', title: '3D-визуализация частных домов', subtitle: 'Фотореалистичные модели: архитектура, отделка, ландшафт. –25% на инвестиции.', imageUrl, benefits: ['Фотореалистичные рендеры', 'Экономия на инвестициях'], tags: ['3D', 'инвестиции'], published: true, order: 1 },
    { slug: '3d-complex', title: '3D-визуализация жилых комплексов', subtitle: 'Детализированные модели: +45% эффективность продаж.', imageUrl, benefits: ['Рост продаж на 45%', 'Детализация уровня комнат'], tags: ['3D', 'жилые комплексы'], published: true, order: 2 },
    { slug: '3d-mall', title: '3D-визуализация ТЦ и коммерции', subtitle: 'Презентация торговых центров: +50% инвестиций на ранних стадиях.', imageUrl, benefits: ['Рост инвестиций на 50%', 'Ранняя стадия презентации'], tags: ['3D', 'коммерция'], published: true, order: 3 },
    { slug: 'ar-app', title: 'AR-приложения для просмотра объектов', subtitle: 'Дополненная реальность: оценка объектов не выходя из дома. +55% готовности к покупке.', imageUrl, benefits: ['Рост готовности к покупке на 55%', 'Мобильное приложение'], tags: ['AR', 'мобильное'], published: true, order: 4 },
    { slug: 'interactive', title: 'Интерактивные столы и инсталляции', subtitle: 'Решения для презентаций и навигации. +70% вовлечённости.', imageUrl, benefits: ['Вовлечённость +70%', 'Сенсорное управление'], tags: ['интерактивные', 'презентации'], published: true, order: 5 },
  ]

  for (const project of projects) {
    const existing = await prisma.project.findUnique({ where: { slug: project.slug } })
    if (existing) {
      await prisma.project.update({ where: { id: existing.id }, data: project })
    } else {
      await prisma.project.create({ data: project })
    }
  }
  logger.info('Projects seeded')

  const reviews = [
    { headline: 'Корпоративный портал: 500+ сотрудников, 0 багов в продакшене', body: 'Тех Смысл реализовала внутренний портал за 45 дней. Оперативная доставка, чистая архитектура, стабильная работа. +35% производительности команды.', author: 'Руководитель цифровой трансформации', role: 'Корпоративный клиент', avatarUrl: imageUrl, rating: 5, order: 0, published: true },
    { headline: 'MVP стартапа: инвестиции привлечены, приложение в App Store', body: 'Разработали React-приложение с AI-функциями за 6 недель. Вышли на рынок, привлекли 2.5 млн ₽ инвестиций. Сэкономили клиенту 400 тыс. ₽.', author: 'CEO стартапа', role: 'Технологический сектор', avatarUrl: imageUrl, rating: 5, order: 1, published: true },
    { headline: 'Миграция в облако AWS: без простоя 99,9% времени', body: 'Перешли инфраструктуру на AWS, настроили Kubernetes и CI/CD. Downtime — нулевой, поддержка круглосуточная. –30% на инфраструктурные расходы.', author: 'CTO', role: 'Финтех компания', avatarUrl: imageUrl, rating: 5, order: 2, published: true },
    { headline: 'Мобильное приложение: 5★ из 5, 10 000+ скачиваний', body: 'Flutter-приложение собрало сотни положительных отзывов. Чистый код, отзывчивый интерфейс. +70% удержание пользователей.', author: 'Продукт-менеджер', role: 'Ритейл', avatarUrl: imageUrl, rating: 5, order: 3, published: true },
  ]

  for (const review of reviews) {
    const existing = await prisma.review.findFirst({ where: { headline: review.headline } })
    if (existing) {
      await prisma.review.update({ where: { id: existing.id }, data: review })
    } else {
      await prisma.review.create({ data: review })
    }
  }
  logger.info('Reviews seeded')

  const posts = [
    { slug: 'stack-startup', title: 'Как выбрать стек для стартапа', excerpt: 'Сравнение популярных технологий для MVP: React vs Vue, Node vs Python, PostgreSQL vs MongoDB.', content: 'Выбор стека технологий — одно из ключевых решений при запуске стартапа. В этой статье мы разбираем плюсы и минусы популярных комбинаций и даём рекомендации, которые помогут принять взвешенное решение.', imageUrl, authorId: null, published: true, publishedAt: new Date(), tags: ['разработка', 'startup'] },
    { slug: '3d-visualization-when', title: '3D-визуализация: когда это оправдано', excerpt: 'Когда фотореалистичный рендер даёт +45% к конверсии, а когда достаточно обычных изображений.', content: '3D-визуализация — мощный инструмент маркетинга недвижимости. Но когда она действительно даёт результат, а когда становится излишней? Мы собрали данные по десяткам проектов и готовы поделиться выводами.', imageUrl, authorId: null, published: true, publishedAt: new Date(), tags: ['3D', 'недвижимость'] },
    { slug: 'ar-retail-roi', title: 'AR в ритейле: примеры и ROI', excerpt: 'Как дополненная реальность увеличивает конверсию на 55% и снижает возвраты на 15%.', content: 'Дополненная реальность перестаёт быть экспериментальной технологией. В ритейле она уже показывает измеримый ROI: от снижения возвратов товаров до взрывного роста конверсии. Вот несколько кейсов и метрик.', imageUrl, authorId: null, published: true, publishedAt: new Date(), tags: ['AR', 'ритейл'] },
  ]

  for (const post of posts) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } })
    if (existing) {
      await prisma.blogPost.update({ where: { id: existing.id }, data: post })
    } else {
      await prisma.blogPost.create({ data: post })
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
    logger.error('Seed failed', { error })
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
