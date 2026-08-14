export const translations = {
  ru: {
    hero: {
      eyebrow: 'Начнём работать вместе прямо сейчас',
      title: 'Техсмысл: +30 IT-решений ежегодно',
      cta: 'Обсудить проект',
      microNote: 'Ответ в течение 15 минут · Можно в Telegram',
    },
    directions: {
      title: 'Проекты',
      subtitle: '3D-визуализация, AR и интерактивные решения',
      allProjects: 'Все проекты',
      prev: 'Назад',
      next: 'Вперёд',
      empty: 'Пока нет проектов',
    },
    process: {
      title: 'Как мы работаем',
      subtitle: 'Прозрачный процесс от идеи до запуска',
      steps: [
        { title: 'Анализ и аудит', desc: 'Изучаем бизнес, аудит существующих решений, определяем цели и KPI.' },
        { title: 'Дизайн и прототипирование', desc: 'Создаём прототип, согласуем визуал и архитектуру продукта.' },
        { title: 'Разработка', desc: 'Пишем код, тестируем, итерируем. Еженедельные демо и прозрачная коммуникация.' },
        { title: 'Запуск и поддержка', desc: 'Деплой, мониторинг, оптимизация. Гарантируем аптайм и стабильность.' },
      ],
    },
    testimonials: {
      title: 'Истории успеха',
      titleLine2: 'от 50+ клиентов',
      note: 'Более 50 успешных проектов по веб-разработке, мобильным приложениям и AI',
      allReviews: 'Все отзывы',
      empty: 'Пока нет отзывов',
    },
    articles: {
      title: 'Полезное',
      subtitle: 'Гайды и статьи по разработке',
      readMore: 'Все статьи',
      empty: 'Пока нет статей',
    },
    contact: {
      title: 'Свяжитесь с нами',
      subtitle: 'Расскажите о задаче — ответим в течение 15 минут',
      name: 'Имя',
      email: 'Email',
      phone: 'Телефон',
      service: 'Услуга',
      message: 'Сообщение',
      send: 'Отправить',
      success: 'Заявка отправлена',
    },
    projects: {
      title: 'Проекты',
      empty: 'Проектов пока нет.',
    },
    blog: {
      title: 'Блог',
      empty: 'Статей пока нет.',
    },
    footer: {
      brandName: 'Tech Smysl',
      brandDesc: 'Разрабатываем IT-решения для бизнеса: 3D, AR, веб и мобильные продукты.',
      navTitle: 'Навигация',
      contactsTitle: 'Контакты',
      copyright: 'Все права защищены.',
      about: 'Об агентстве',
      projects: 'Портфолио',
      discuss: 'Обсудить проект',
      phone: '+7 800 555 35 35',
      email: 'digital@techsmysl.ru',
      address: 'ул. Вишневского, 26А',
    },
  },
  en: {
    hero: {
      eyebrow: "Let's start working together right now",
      title: 'Tech Smysl: +30 IT solutions yearly',
      cta: 'Discuss project',
      microNote: 'Reply within 15 minutes · Available on Telegram',
    },
    directions: {
      title: 'Projects',
      subtitle: '3D visualization, AR and interactive solutions',
      allProjects: 'All projects',
      prev: 'Previous',
      next: 'Next',
      empty: 'No projects yet.',
    },
    process: {
      title: 'How we work',
      subtitle: 'Transparent process from idea to launch',
      steps: [
        { title: 'Analysis and audit', desc: 'We study the business, audit existing solutions, define goals and KPIs.' },
        { title: 'Design and prototyping', desc: 'We build a prototype, align visuals and product architecture.' },
        { title: 'Development', desc: 'We write code, run tests, and iterate. Weekly demos and transparent communication.' },
        { title: 'Launch and support', desc: 'Deployment, monitoring, optimization. We guarantee uptime and stability.' },
      ],
    },
    testimonials: {
      title: 'Success stories',
      titleLine2: 'from 50+ clients',
      note: 'More than 50 successful projects in web development, mobile apps and AI',
      allReviews: 'All reviews',
      empty: 'No reviews yet',
    },
    articles: {
      title: 'Insights',
      subtitle: 'Guides and articles on development',
      readMore: 'All articles',
      empty: 'No articles yet',
    },
    contact: {
      title: 'Contact us',
      subtitle: 'Tell us about your task — we reply within 15 minutes',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      service: 'Service',
      message: 'Message',
      send: 'Send',
      success: 'Application sent',
    },
    projects: {
      title: 'Projects',
      empty: 'No projects yet.',
    },
    blog: {
      title: 'Blog',
      empty: 'No articles yet.',
    },
    footer: {
      brandName: 'Tech Smysl',
      brandDesc: 'We build IT solutions for business: 3D, AR, web and mobile products.',
      navTitle: 'Navigation',
      contactsTitle: 'Contacts',
      copyright: 'All rights reserved.',
      about: 'About',
      projects: 'Portfolio',
      discuss: 'Discuss project',
      phone: '+7 800 555 35 35',
      email: 'digital@techsmysl.ru',
      address: '26A Vishnevskogo St.',
    },
  },
}

export type TranslationKey = keyof typeof translations.ru

export function getTranslations(locale: 'ru' | 'en') {
  return translations[locale] ?? translations.ru
}
