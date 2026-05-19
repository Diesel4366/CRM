'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Monitor, ClipboardList,
  BookOpen, Bell, LogOut, Settings
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const nav = [
  { href: '/',         label: 'Дашборд',   icon: LayoutDashboard },
  { href: '/clients',  label: 'Клиенты',   icon: Users },
  { href: '/kkt',      label: 'Кассы',     icon: Monitor },
  { href: '/orders',   label: 'Заказы',    icon: ClipboardList },
  { href: '/catalog',  label: 'Каталог',   icon: BookOpen },
  { href: '/alerts',   label: 'Алерты',    icon: Bell },
  { href: '/settings', label: 'Настройки', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="flex h-screen w-56 flex-col" style={{ background: 'linear-gradient(180deg, #0c6b61 0%, #0a5a51 100%)' }}>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 shrink-0">
          <span className="text-white font-black text-sm tracking-tight">IT</span>
        </div>
        <div className="flex flex-col leading-none gap-1">
          <span className="text-white font-black text-sm tracking-widest uppercase">ДОКТОР</span>
          <span className="text-white/45 text-[10px] tracking-wide">CRM система</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-white' : 'text-white/50')} />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 transition-all hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Выйти
        </button>
      </div>
    </aside>
  )
}
