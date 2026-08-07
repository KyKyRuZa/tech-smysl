'use client'

import { useEffect } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  open: boolean
  onClose?: () => void
  closeOnBackdrop?: boolean
  children: React.ReactNode
}

export default function Modal({
  open,
  onClose,
  closeOnBackdrop = true,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={styles.backdrop}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
