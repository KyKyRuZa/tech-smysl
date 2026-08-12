import 'dotenv/config'
import { prisma } from '@/lib/prisma'

async function main() {
  await prisma.blogPostTranslation.deleteMany()
  await prisma.projectTranslation.deleteMany()
  await prisma.heroSlideTranslation.deleteMany()
  await prisma.reviewTranslation.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.project.deleteMany()
  await prisma.heroSlide.deleteMany()
  await prisma.review.deleteMany()

  const imageUrl = '/example/default.webp'

  const heroSlides = [
    { imageUrl, ctaLink: '#projects', order: 0, published: true, translations: { ru: { title: 'Тех Смысл', subtitle: '3D-визуализация, AR и интерактивные решения для недвижимости', ctaText: 'Смотреть проекты', imageAlt: '3D-визуализация жилого комплекса' } } },
    { imageUrl, ctaLink: '#projects', order: 1, published: true, translations: { ru: { title: 'Дополненная реальность', subtitle: 'Оценивайте объекты не выходя из дома', ctaText: 'Узнать больше', imageAlt: 'AR-просмотр объекта' } } },
  ]

  for (const slide of heroSlides) {
    const base = await prisma.heroSlide.create({ data: { imageUrl: slide.imageUrl, ctaLink: slide.ctaLink, order: slide.order, published: slide.published } })
    const ru = slide.translations.ru
    await prisma.heroSlideTranslation.create({ data: { ...ru, locale: 'ru', slideId: base.id } })
  }

  const projects = [
    { imageUrl, order: 0, published: true, translations: { ru: { slug: '3d-nav', title: 'Интерактивная 3D-навигация', subtitle: 'Цифровая модель с перемещением: маршруты, помещения, парковки. –40% времени поиска.', benefits: ['Снижение времени поиска на 40%', 'Интерактивный интерфейс'], tags: ['3D', 'навигация'] } } },
    { imageUrl, order: 1, published: true, translations: { ru: { slug: '3d-houses', title: '3D-визуализация частных домов', subtitle: 'Фотореалистичные модели: архитектура, отделка, ландшафт. –25% на инвестиции.', benefits: ['Фотореалистичные рендеры', 'Экономия на инвестициях'], tags: ['3D', 'инвестиции'] } } },
    { imageUrl, order: 2, published: true, translations: { ru: { slug: '3d-complex', title: '3D-визуализация жилых комплексов', subtitle: 'Детализированные модели: +45% эффективность продаж.', benefits: ['Рост продаж на 45%', 'Детализация уровня комнат'], tags: ['3D', 'жилые комплексы'] } } },
    { imageUrl, order: 3, published: true, translations: { ru: { slug: '3d-mall', title: '3D-визуализация ТЦ и коммерции', subtitle: 'Презентация торговых центров: +50% инвестиций на ранних стадиях.', benefits: ['Рост инвестиций на 50%', 'Ранняя стадия презентации'], tags: ['3D', 'коммерция'] } } },
    { imageUrl, order: 4, published: true, translations: { ru: { slug: 'ar-app', title: 'AR-приложения для просмотра объектов', subtitle: 'Дополненная реальность: оценка объектов не выходя из дома. +55% готовности к покупке.', benefits: ['Рост готовности к покупке на 55%', 'Мобильное приложение'], tags: ['AR', 'мобильное'] } } },
    { imageUrl, order: 5, published: true, translations: { ru: { slug: 'interactive', title: 'Интерактивные столы и инсталляции', subtitle: 'Решения для презентаций и навигации. +70% вовлечённости.', benefits: ['Вовлечённость +70%', 'Сенсорное управление'], tags: ['интерактивные', 'презентации'] } } },
  ]

  for (const project of projects) {
    const base = await prisma.project.create({ data: { imageUrl: project.imageUrl, order: project.order, published: project.published } })
    const ru = project.translations.ru
    await prisma.projectTranslation.create({ data: { ...ru, locale: 'ru', projectId: base.id } })
  }

  const reviews = [
    { avatarUrl: imageUrl, rating: 5, order: 0, published: true, translations: { ru: { headline: 'Корпоративный портал: 500+ сотрудников, 0 багов в продакшене', body: 'Тех Смысл реализовала внутренний портал за 45 дней. Оперативная доставка, чистая архитектура, стабильная работа. +35% производительности команды.', author: 'Руководитель цифровой трансформации', role: 'Корпоративный клиент' } } },
    { avatarUrl: imageUrl, rating: 5, order: 1, published: true, translations: { ru: { headline: 'MVP стартапа: инвестиции привлечены, приложение в App Store', body: 'Разработали React-приложение с AI-функциями за 6 недель. Вышли на рынок, привлекли 2.5 млн ₽ инвестиций. Сэкономили клиенту 400 тыс. ₽.', author: 'CEO стартапа', role: 'Технологический сектор' } } },
    { avatarUrl: imageUrl, rating: 5, order: 2, published: true, translations: { ru: { headline: 'Миграция в облако AWS: без простоя 99,9% времени', body: 'Перешли инфраструктуру на AWS, настроили Kubernetes и CI/CD. Downtime — нулевой, поддержка круглосуточная. –30% на инфраструктурные расходы.', author: 'CTO', role: 'Финтех компания' } } },
    { avatarUrl: imageUrl, rating: 5, order: 3, published: true, translations: { ru: { headline: 'Мобильное приложение: 5★ из 5, 10 000+ скачиваний', body: 'Flutter-приложение собрало сотни положительных отзывов. Чистый код, отзывчивый интерфейс. +70% удержание пользователей.', author: 'Продукт-менеджер', role: 'Ритейл' } } },
  ]

  for (const review of reviews) {
    const base = await prisma.review.create({ data: { avatarUrl: review.avatarUrl, rating: review.rating, order: review.order, published: review.published } })
    const ru = review.translations.ru
    await prisma.reviewTranslation.create({ data: { ...ru, locale: 'ru', reviewId: base.id } })
  }

  const posts = [
    { imageUrl, authorId: null, published: true, publishedAt: new Date(), translations: { ru: { slug: 'stack-startup', title: 'Как выбрать стек для стартапа', excerpt: 'Сравнение популярных технологий для MVP: React vs Vue, Node vs Python, PostgreSQL vs MongoDB.', content: 'Выбор стека технологий — одно из ключевых решений при запуске стартапа. В этой статье мы разбираем плюсы и минусы популярных комбинаций и даём рекомендации, которые помогут принять взвешенное решение.', tags: ['разработка', 'startup'] } } },
    { imageUrl, authorId: null, published: true, publishedAt: new Date(), translations: { ru: { slug: '3d-visualization-when', title: '3D-визуализация: когда это оправдано', excerpt: 'Когда фотореалистичный рендер даёт +45% к конверсии, а когда достаточно обычных изображений.', content: '3D-визуализация — мощный инструмент маркетинга недвижимости. Но когда она действительно даёт результат, а когда становится излишней? Мы собрали данные по десяткам проектов и готовы поделиться выводами.', tags: ['3D', 'недвижимость'] } } },
    { imageUrl, authorId: null, published: true, publishedAt: new Date(), translations: { ru: { slug: 'ar-retail-roi', title: 'AR в ритейле: примеры и ROI', excerpt: 'Как дополненная реальность увеличивает конверсию на 55% и снижает возвраты на 15%.', content: 'Дополненная реальность перестаёт быть экспериментальной технологией. В ритейле она уже показывает измеримый ROI: от снижения возвратов товаров до взрывного роста конверсии. Вот несколько кейсов и метрик.', tags: ['AR', 'ритейл'] } } },
  ]

  for (const post of posts) {
    const base = await prisma.blogPost.create({ data: { imageUrl: post.imageUrl, authorId: post.authorId, published: post.published, publishedAt: post.publishedAt } })
    const ru = post.translations.ru
    await prisma.blogPostTranslation.create({ data: { ...ru, locale: 'ru', postId: base.id } })
  }

  console.log('Reseed complete')
}

main().finally(async () => await prisma.$disconnect())
