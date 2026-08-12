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
    const ru = slide.translations.ru as {
      title: string
      subtitle: string
      ctaText?: string
      imageAlt?: string
    }
    const base = existing ? await prisma.heroSlide.update({ where: { id: existing.id }, data: { imageUrl: slide.imageUrl, ctaLink: slide.ctaLink, order: slide.order, published: slide.published, title: ru.title, subtitle: ru.subtitle, imageAlt: ru.imageAlt } }) : await prisma.heroSlide.create({ data: { imageUrl: slide.imageUrl, ctaLink: slide.ctaLink, order: slide.order, published: slide.published, title: ru.title, subtitle: ru.subtitle, imageAlt: ru.imageAlt } })

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
    { imageUrl, order: 0, published: true, translations: { ru: { slug: '3d-nav', title: 'Интерактивная 3D-навигация', subtitle: 'Цифровая модель с перемещением: маршруты, помещения, парковки. –40% времени поиска.', description: 'Интерактивная 3D-навигация представляет собой цифровую модель объекта с возможностью свободного перемещения по территории или зданию. Пользователь может изучать маршруты, находить необходимые помещения, магазины, офисы, парковки и другие объекты инфраструктуры.', content: 'Интерактивная 3D-навигация представляет собой цифровую модель объекта с возможностью свободного перемещения по территории или зданию. Пользователь может изучать маршруты, находить необходимые помещения, магазины, офисы, парковки и другие объекты инфраструктуры. Такие решения востребованы в аэропортах, торговых центрах, жилых комплексах, бизнес-центрах и общественных пространствах. Интеграция с мобильными приложениями, веб-платформами и интерактивными терминалами позволяет повысить удобство пользователей и сократить время поиска необходимых объектов.', useCases: 'Аэропорты, торговые центры, жилые комплексы, бизнес-центры, общественные пространства.', benefits: ['Снижение времени поиска на 40%', 'Интерактивный интерфейс'], tags: ['3D', 'навигация'] }, en: { slug: 'interactive-3d-navigation', title: 'Interactive 3D Navigation', subtitle: 'Digital walkable model: routes, rooms, parking. –40% search time.', description: 'Interactive 3D navigation is a digital model of an object with the ability to freely move around the territory or building. Users can explore routes, find necessary rooms, shops, offices, parking lots and other infrastructure objects.', content: 'Interactive 3D navigation is a digital model of an object with the ability to freely move around the territory or building. Users can explore routes, find necessary rooms, shops, offices, parking lots and other infrastructure objects. Such solutions are in demand at airports, shopping malls, residential complexes, business centers and public spaces. Integration with mobile apps, web platforms and interactive terminals improves user convenience and reduces the time to find the necessary objects.', useCases: 'Airports, shopping malls, residential complexes, business centers, public spaces.', benefits: ['40% less search time', 'Interactive interface'], tags: ['3D', 'navigation'] } } },
    { imageUrl, order: 1, published: true, translations: { ru: { slug: '3d-houses', title: '3D-визуализация частных домов', subtitle: 'Фотореалистичные модели: архитектура, отделка, ландшафт. –25% на инвестиции.', description: 'Фотореалистичная 3D-визуализация частных домов позволяет заказчику увидеть будущий объект до начала строительства. Модели включают детализацию архитектуры, отделки фасадов, ландшафтного дизайна и интерьеров.', content: 'Фотореалистичная 3D-визуализация частных домов позволяет заказчику увидеть будущий объект до начала строительства. Модели включают детализацию архитектуры, отделки фасадов, ландшафтного дизайна и интерьеров. Это сокращает количество правок на этапе строительства и повышает удовлетворённость заказчика.', useCases: 'Частное домостроение, загородная недвижимость, инвестиционные проекты.', benefits: ['Фотореалистичные рендеры', 'Экономия на инвестициях'], tags: ['3D', 'инвестиции'] }, en: { slug: '3d-houses', title: '3D Visualization of Private Houses', subtitle: 'Photorealistic models: architecture, finishes, landscape. –25% investment cost.', description: 'Photorealistic 3D visualization of private houses allows the customer to see the future object before construction starts. Models include detailing of architecture, facade finishes, landscape design and interiors.', content: 'Photorealistic 3D visualization of private houses allows the customer to see the future object before construction starts. Models include detailing of architecture, facade finishes, landscape design and interiors. This reduces the number of revisions during construction and increases customer satisfaction.', useCases: 'Private house building, suburban real estate, investment projects.', benefits: ['Photorealistic renders', 'Investment savings'], tags: ['3D', 'investment'] } } },
    { imageUrl, order: 2, published: true, translations: { ru: { slug: '3d-complex', title: '3D-визуализация жилых комплексов', subtitle: 'Детализированные модели: +45% эффективность продаж.', description: '3D-визуализация жилых комплексов включает детализацию фасадов, отделки мест общего пользования, придомовой территории и инфраструктуры. Такой подход повышает конверсию на этапе презентации проекта.', content: '3D-визуализация жилых комплексов включает детализацию фасадов, отделки мест общего пользования, придомовой территории и инфраструктуры. Такой подход повышает конверсию на этапе презентации проекта. Разработка визуальных материалов для маркетинговых кампаний и площадок продаж позволяет ускорить формирование базы покупателей.', useCases: 'Девелопмент, продажа новостроек, инвестиционно-строительные компании.', benefits: ['Рост продаж на 45%', 'Детализация уровня комнат'], tags: ['3D', 'жилые комплексы'] }, en: { slug: '3d-complex', title: '3D Visualization of Residential Complexes', subtitle: 'Detailed models: +45% sales efficiency.', description: '3D visualization of residential complexes includes detailing of facades, common areas finishes, landscaping and infrastructure. This approach increases conversion at the project presentation stage.', content: '3D visualization of residential complexes includes detailing of facades, common areas finishes, landscaping and infrastructure. This approach increases conversion at the project presentation stage. Developing visual materials for marketing campaigns and sales platforms speeds up building a buyer base.', useCases: 'Development, new construction sales, investment and construction companies.', benefits: ['45% sales growth', 'Room-level detail'], tags: ['3D', 'residential'] } } },
    { imageUrl, order: 3, published: true, translations: { ru: { slug: '3d-mall', title: '3D-визуализация ТЦ и коммерции', subtitle: 'Презентация торговых центров: +50% инвестиций на ранних стадиях.', description: '3D-визуализация торговых центров и коммерческих объектов помогает инвесторам и арендаторам оценить проект на ранней стадии. Визуализации включают планировку, зонирование, общественные зоны и парковки.', content: '3D-визуализация торговых центров и коммерческих объектов помогает инвесторам и арендаторам оценить проект на ранней стадии. Визуализации включают планировку, зонирование, общественные зоны и парковки. Это ускоряет принятие решений и повышает привлекательность проекта для арендаторов.', useCases: 'Торговые центры, магазины, фуд-корты, бизнес-центры.', benefits: ['Рост инвестиций на 50%', 'Ранняя стадия презентации'], tags: ['3D', 'коммерция'] }, en: { slug: '3d-mall', title: '3D Visualization of Malls and Retail', subtitle: 'Shopping center presentations: +50% early-stage investment.', description: '3D visualization of shopping malls and commercial objects helps investors and tenants evaluate the project at an early stage. Visualizations include layout, zoning, public areas and parking.', content: '3D visualization of shopping malls and commercial objects helps investors and tenants evaluate the project at an early stage. Visualizations include layout, zoning, public areas and parking. This speeds up decision making and increases the project attractiveness for tenants.', useCases: 'Shopping malls, stores, food courts, business centers.', benefits: ['50% more investment', 'Early-stage presentation'], tags: ['3D', 'retail'] } } },
    { imageUrl, order: 4, published: true, translations: { ru: { slug: 'ar-app', title: 'AR-приложения для просмотра объектов', subtitle: 'Дополненная реальность: оценка объектов не выходя из дома. +55% готовности к покупке.', description: 'AR-приложения позволяют пользователям просматривать объекты недвижимости в дополненной реальности прямо с мобильного устройства. Это повышает вовлечённость и позволяет принять решение о покупке без визита на объект.', content: 'AR-приложения позволяют пользователям просматривать объекты недвижимости в дополненной реальности прямо с мобильного устройства. Это повышает вовлечённость и позволяет принять решение о покупке без визита на объект. Интеграция с CRM и платформами застройщиков упрощает сбор заявок и повышает конверсию.', useCases: 'Новостройки, загородная недвижимость, выставки, магазины.', benefits: ['Рост готовности к покупке на 55%', 'Мобильное приложение'], tags: ['AR', 'мобильное'] }, en: { slug: 'ar-app', title: 'AR Apps for Property Viewing', subtitle: 'Augmented reality: evaluate properties from home. +55% purchase intent.', description: 'AR apps allow users to view real estate objects in augmented reality directly from a mobile device. This increases engagement and allows making a purchase decision without visiting the object.', content: 'AR apps allow users to view real estate objects in augmented reality directly from a mobile device. This increases engagement and allows making a purchase decision without visiting the object. Integration with CRM and developer platforms simplifies lead collection and increases conversion.', useCases: 'New buildings, suburban real estate, exhibitions, stores.', benefits: ['55% higher purchase intent', 'Mobile app'], tags: ['AR', 'mobile'] } } },
    { imageUrl, order: 5, published: true, translations: { ru: { slug: 'interactive', title: 'Интерактивные столы и инсталляции', subtitle: 'Решения для презентаций и навигации. +70% вовлечённости.', description: 'Интерактивные столы и инсталляции используются для презентаций, навигации и вовлечения аудитории в публичных пространствах. Решения поддерживают сенсорное управление, интеграцию с контентом и аналитику взаимодействия.', content: 'Интерактивные столы и инсталляции используются для презентаций, навигации и вовлечения аудитории в публичных пространствах. Решения поддерживают сенсорное управление, интеграцию с контентом и аналитику взаимодействия. Это повышает вовлечённость гостей и оставляет измеримый след после мероприятия.', useCases: 'Выставочные центры, музеи, торговые центры, корпоративные пространства.', benefits: ['Вовлечённость +70%', 'Сенсорное управление'], tags: ['интерактивные', 'презентации'] }, en: { slug: 'interactive', title: 'Interactive Tables and Installations', subtitle: 'Presentation and navigation solutions. +70% engagement.', description: 'Interactive tables and installations are used for presentations, navigation and audience engagement in public spaces. Solutions support touch control, content integration and interaction analytics.', content: 'Interactive tables and installations are used for presentations, navigation and audience engagement in public spaces. Solutions support touch control, content integration and interaction analytics. This increases guest engagement and leaves a measurable impact after the event.', useCases: 'Exhibition centers, museums, shopping malls, corporate spaces.', benefits: ['70% more engagement', 'Touch control'], tags: ['interactive', 'presentations'] } } },
  ]

  for (const project of projects) {
    const existing = await prisma.project.findFirst({ where: { order: project.order } })
    const ru = project.translations.ru as {
      slug: string
      title: string
      subtitle: string
      description?: string
      content?: string
      useCases?: string
      benefits: string[]
      tags: string[]
    }
    const base = existing ? await prisma.project.update({ where: { id: existing.id }, data: { imageUrl: project.imageUrl, order: project.order, published: project.published, title: ru.title, slug: ru.slug, subtitle: ru.subtitle, description: ru.description, content: ru.content, benefits: ru.benefits, useCases: ru.useCases, tags: ru.tags } }) : await prisma.project.create({ data: { imageUrl: project.imageUrl, order: project.order, published: project.published, title: ru.title, slug: ru.slug, subtitle: ru.subtitle, description: ru.description, content: ru.content, benefits: ru.benefits, useCases: ru.useCases, tags: ru.tags } })

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
    const ru = review.translations.ru as {
      headline: string
      body: string
      author?: string
      role?: string
    }
    const base = existing ? await prisma.review.update({ where: { id: existing.id }, data: { avatarUrl: review.avatarUrl, rating: review.rating, order: review.order, published: review.published, headline: ru.headline, body: ru.body, author: ru.author, role: ru.role } }) : await prisma.review.create({ data: { avatarUrl: review.avatarUrl, rating: review.rating, order: review.order, published: review.published, headline: ru.headline, body: ru.body, author: ru.author, role: ru.role } })

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
    const ru = post.translations.ru as {
      slug: string
      title: string
      excerpt?: string
      content: string
      tags: string[]
    }
    const base = existing ? await prisma.blogPost.update({ where: { id: existing.id }, data: { imageUrl: post.imageUrl, authorId: post.authorId, published: post.published, publishedAt: post.publishedAt, slug: ru.slug, title: ru.title, excerpt: ru.excerpt, content: ru.content, tags: ru.tags } }) : await prisma.blogPost.create({ data: { imageUrl: post.imageUrl, authorId: post.authorId, published: post.published, publishedAt: post.publishedAt, slug: ru.slug, title: ru.title, excerpt: ru.excerpt, content: ru.content, tags: ru.tags } })

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
