import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getAdminProjects } from '@/lib/admin-queries'
import styles from '../admin.module.css'

export default async function ProjectsPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  const projects = await getAdminProjects()

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>Проекты</h1>
        <a href="/admin/projects/new" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}>
          Новый проект
        </a>
      </div>
      <div className={styles.adminCard}>
        {projects.length === 0 ? (
          <div className={styles.adminEmpty}>
            <p>Проектов пока нет.</p>
            <a href="/admin/projects/new" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}>
              Создать первый проект
            </a>
          </div>
        ) : (
          <div className={styles.adminTableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Slug</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td className={styles.adminTableTitle}>{project.title}</td>
                    <td>{project.slug}</td>
                    <td>
                      <span
                        className={`${styles.adminBadge} ${project.published ? styles.adminBadgePublished : styles.adminBadgeDraft}`}
                      >
                        {project.published ? 'Опубликован' : 'Черновик'}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`/admin/projects/${project.id}/edit`}
                        className={`${styles.adminBtn} ${styles.adminBtnSecondary} ${styles.adminBtnSm}`}
                      >
                        Редактировать
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
