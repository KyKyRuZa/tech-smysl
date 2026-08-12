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
        { title: 'Бриф и анализ', desc: 'Изучаем вашу задачу, рынок и конкурентов. Формируем ТЗ и оценку.' },
        { title: 'Прототип и дизайн', desc: 'Создаём UX/UI, согласовываем сценарии и визуал.' },
        { title: 'Разработка и тесты', desc: 'Пишем код, настраиваем инфраструктуру, проводим QA.' },
        { title: 'Запуск и поддержка', desc: 'Выводим в прод, отслеживаем метрики, дорабатываем.' },
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
      readMore: 'Все статьи →',
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
        { title: 'Brief & analysis', desc: 'We study your task, market and competitors. Form TOR and estimate.' },
        { title: 'Prototype & design', desc: 'Create UX/UI, agree scenarios and visuals.' },
        { title: 'Development & QA', desc: 'Write code, set up infrastructure, run QA.' },
        { title: 'Launch & support', desc: 'Go live, track metrics, iterate.' },
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
      readMore: 'All articles →',
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
  },
}

export type TranslationKey = keyof typeof translations.ru

export function getTranslations(locale: 'ru' | 'en') {
  return translations[locale] ?? translations.ru
}
