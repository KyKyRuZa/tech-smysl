import ContactsForm from './ContactsForm'
import styles from './ContactSection.module.css'

export default function ContactSection() {
  return (
    <section id="discuss" className={styles.container}>
      <div className={styles.head}>
        <h2 className={styles.title}>Обсудить проект</h2>
        <p className={styles.subtitle}>
          Готовы обсудить проект? Оставьте заявку — и мы свяжемся с вами в течение 15 минут.
        </p>
      </div>

      <div className={styles.grid}>
        <aside className={styles.aside}>
          <p className={styles.asideLabel}>Или напишите нам напрямую</p>
          <a href="mailto:digital@techsmysl.ru" className={styles.asideLink}>
            digital@techsmysl.ru
          </a>
        </aside>

        <div className={styles.formWrap}>
          <ContactsForm />
        </div>
      </div>
    </section>
  )
}
