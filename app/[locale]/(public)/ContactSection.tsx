import ContactsForm from './ContactsForm'
import styles from './ContactSection.module.css'
import { getTranslations } from '@/lib/i18n/translations'

type Props = {
  locale: 'ru' | 'en'
}

export default function ContactSection({ locale }: Props) {
  const t = getTranslations(locale)

  return (
    <section id="discuss" className={styles.container}>
      <div className={styles.head}>
        <h2 className={styles.title}>{t.contact.title}</h2>
        <p className={styles.subtitle}>
          {t.contact.subtitle}
        </p>
      </div>

      <div className={styles.grid}>
        <aside className={styles.aside}>
          <p className={styles.asideLabel}>{locale === 'ru' ? 'Или напишите нам напрямую' : 'Or write to us directly'}</p>
          <a href="mailto:digital@techsmysl.ru" className={styles.asideLink}>
            digital@techsmysl.ru
          </a>
        </aside>

        <div className={styles.formWrap}>
          <ContactsForm locale={locale} />
        </div>
      </div>
    </section>
  )
}
