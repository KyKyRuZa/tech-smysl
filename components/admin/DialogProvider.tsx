'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import Modal from './Modal'
import styles from './Dialog.module.css'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

export interface AlertOptions {
  title?: string
  message: string
  okText?: string
}

interface DialogApi {
  confirm: (opts: ConfirmOptions) => Promise<boolean>
  alert: (opts: AlertOptions) => Promise<void>
}

const DialogContext = createContext<DialogApi | null>(null)

export function useDialog(): DialogApi {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialog must be used within DialogProvider')
  return ctx
}

type DialogState =
  | (ConfirmOptions & { kind: 'confirm'; resolve: (v: boolean) => void })
  | (AlertOptions & { kind: 'alert'; resolve: () => void })
  | null

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>(null)

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setState({
          kind: 'confirm',
          resolve,
          confirmText: 'Удалить',
          cancelText: 'Отмена',
          destructive: true,
          ...opts,
        })
      }),
    []
  )

  const alert = useCallback(
    (opts: AlertOptions) =>
      new Promise<void>((resolve) => {
        setState({ kind: 'alert', resolve, okText: 'OK', ...opts })
      }),
    []
  )

  const close = (value: boolean | undefined) => {
    setState((current) => {
      if (!current) return null
      current.resolve(value as never)
      return null
    })
  }

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      <Modal
        open={state !== null}
        onClose={() => close(state?.kind === 'confirm' ? false : undefined)}
      >
        {state?.kind === 'confirm' && (
          <div className={styles.card}>
            {state.title && <h2 className={styles.title}>{state.title}</h2>}
            <p className={styles.message}>{state.message}</p>
            <div className={styles.actions}>
              <button type="button" className={styles.cancel} onClick={() => close(false)}>
                {state.cancelText}
              </button>
              <button
                type="button"
                className={`${styles.confirm} ${state.destructive ? styles.danger : ''}`}
                onClick={() => close(true)}
              >
                {state.confirmText}
              </button>
            </div>
          </div>
        )}

        {state?.kind === 'alert' && (
          <div className={styles.card}>
            {state.title && <h2 className={styles.title}>{state.title}</h2>}
            <p className={styles.message}>{state.message}</p>
            <div className={styles.actions}>
              <button type="button" className={styles.confirm} onClick={() => close(undefined)}>
                {state.okText}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DialogContext.Provider>
  )
}
