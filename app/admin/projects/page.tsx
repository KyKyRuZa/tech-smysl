import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getAdminProjects } from '@/lib/admin-queries'
import Link from 'next/link'
import RowActions from '@/components/admin/RowActions'
import styles from '../admin.module.css'

export default async function ProjectsPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  const projects = await getAdminProjects()

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>Проекты</h1>
        <Link href="/admin/projects/new" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}>
          Новый проект
        </Link>
      </div>
      <div className={styles.adminCard}>
        {projects.length === 0 ? (
          <div className={styles.adminEmpty}>
            <p>Проектов пока нет.</p>
            <Link href="/admin/projects/new" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}>
              Создать первый проект
            </Link>
          </div>
        ) : (
          <div className={styles.adminTableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Название (RU)</th>
                  <th>Название (EN)</th>
                  <th>Slug</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const ru = project.translations.find((t) => t.locale === 'ru')
                  const en = project.translations.find((t) => t.locale === 'en')
                  return (
                    <tr key={project.id}>
                      <td className={styles.adminTableTitle}>{ru?.title ?? '—'}</td>
                      <td>{en?.title ?? '—'}</td>
                      <td>{ru?.slug ?? project.slug ?? '—'}</td>
                      <td>
                        <span
                          className={`${styles.adminBadge} ${project.published ? styles.adminBadgePublished : styles.adminBadgeDraft}`}
                        >
                          {project.published ? 'Опубликован' : 'Черновик'}
                        </span>
                      </td>
                      <td>
                        <RowActions entity="projects" id={project.id} redirectPath="/admin/projects" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
