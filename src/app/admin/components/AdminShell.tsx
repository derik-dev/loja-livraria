'use client'

import { useState } from 'react'
import Sidebar, { type Page } from './Sidebar'
import Dashboard from './Dashboard'
import Pedidos from './Pedidos'
import AdminDashboard from './AdminDashboard'
import Clientes from './Clientes'
import Descontos from './Descontos'
import Configuracoes from './Configuracoes'
import Categorias from './Categorias'

export default function AdminShell({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<Page>('dashboard')

  return (
    <div className="flex min-h-screen bg-zinc-50" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <Sidebar page={page} onNavigate={setPage} onLogout={onLogout} />
      <main className="flex-1 min-w-0">
        {page === 'dashboard' && <Dashboard />}
        {page === 'pedidos' && <Pedidos />}
        {page === 'produtos' && <AdminDashboard onLogout={onLogout} />}
        {page === 'categorias' && <Categorias />}
        {page === 'clientes' && <Clientes />}
        {page === 'descontos' && <Descontos />}
        {page === 'configuracoes' && <Configuracoes />}
      </main>
    </div>
  )
}
