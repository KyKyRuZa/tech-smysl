import type { Metadata } from 'next'
import AdminShell from './AdminShell'
import './admin.module.css'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Админ панель',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminShell>{children}</AdminShell>
}
