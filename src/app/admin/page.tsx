'use client'

import { useState, useEffect } from 'react'
import AdminLogin from './components/AdminLogin'
import AdminShell from './components/AdminShell'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    setAuthed(sessionStorage.getItem('admin_authed') === '1')
    setChecking(false)
  }, [])

  if (checking) return null
  if (!authed) return <AdminLogin onLogin={() => { sessionStorage.setItem('admin_authed', '1'); setAuthed(true) }} />
  return <AdminShell onLogout={() => { sessionStorage.removeItem('admin_authed'); setAuthed(false) }} />
}
