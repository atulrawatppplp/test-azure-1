import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { config } from '../../lib/config'
import { cn } from '../../lib/format'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { notificationService } from '../../services/notificationService'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/products', label: 'Products' },
  { to: '/cart', label: 'Cart' },
  { to: '/orders', label: 'Orders' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/profile', label: 'Profile' },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    notificationService.getUnreadCount().then(setUnreadCount).catch(() => setUnreadCount(0))
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const badgeFor = (to: string) => {
    if (to === '/cart' && itemCount > 0) return itemCount
    if (to === '/notifications' && unreadCount > 0) return unreadCount
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setIsSidebarOpen((open) => !open)}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path strokeLinecap="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-sm font-bold text-white">
              M
            </span>
            <span className="truncate text-sm font-semibold text-slate-900 sm:text-base">{config.appName}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
              {user?.name?.charAt(0) ?? 'U'}
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 top-16 z-20 bg-slate-900/40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        <aside
          className={cn(
            'fixed inset-y-0 top-16 left-0 z-20 w-64 shrink-0 border-r border-slate-200 bg-white p-3 transition-transform lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <nav className="flex h-full flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100',
                  )
                }
              >
                {item.label}
                {badgeFor(item.to) !== null && (
                  <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {badgeFor(item.to)}
                  </span>
                )}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-auto rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
            >
              Sign out
            </button>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
