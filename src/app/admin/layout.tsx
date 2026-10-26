import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Papelada Admin' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div data-admin>{children}</div>
}
