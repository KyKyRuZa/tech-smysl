'use client';

import dynamic from 'next/dynamic'

const AdminShell = dynamic(() => import('./AdminShell'), { ssr: false })

export default function AdminShellClient({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
