'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDialog } from '@/components/admin/DialogProvider'
import styles from '@/app/admin/admin.module.css'

interface RowActionsProps {
  entity: 'blog-posts' | 'projects' | 'reviews' | 'hero-slides'
  id: string
  redirectPath: string
}

export default function RowActions({ entity, id, redirectPath }: RowActionsProps) {
  const router = useRouter()
  const dialog = useDialog()

  const handleDelete = useCallback(async () => {
    const confirmed = await dialog.confirm({
      title: 'Удалить?',
      message: 'Вы уверены, что хотите удалить этот элемент?',
      destructive: true,
    })
    if (!confirmed) return

    const res = await fetch(`/api/${entity}/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      await dialog.alert({ title: 'Ошибка', message: 'Не удалось удалить' })
      return
    }
    await router.push(redirectPath)
    router.refresh()
  }, [dialog, entity, id, redirectPath, router])

  return (
    <div className={styles.adminRowActions}>
      <Link
        href={`/admin/${entity}/${id}/edit`}
        className={`${styles.adminIconBtn} ${styles.adminIconBtnEdit}`}
        title="Редактировать"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        className={`${styles.adminIconBtn} ${styles.adminIconBtnDelete}`}
        title="Удалить"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>
    </div>
  )
}
