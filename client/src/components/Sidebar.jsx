import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Outline icons (Heroicons paths) so we don't need an icon library.
function Icon({ d }) {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}
const icons = {
  menu: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
  close: 'M6 18 18 6M6 6l12 12',
  list: 'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm0 5.25h.007v.008H3.75V12Zm0 5.25h.007v.008H3.75v-.008Z',
  plus: 'M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  collapse: 'm18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5',
  expand: 'm5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5',
  logout: 'M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9',
  login: 'M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75',
  register: 'M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z'
}

const COLLAPSED_KEY = 'sidebarCollapsed'

// localStorage can throw (private mode, blocked storage), so never let it break the page.
function readCollapsed() {
  try { return localStorage.getItem(COLLAPSED_KEY) === '1' } catch { return false }
}

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?'
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false) // drawer on small screens
  const [collapsed, setCollapsed] = useState(readCollapsed) // icon-only mode on large screens

  // Close the mobile drawer whenever the page changes.
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Remember collapsed/expanded between visits.
  useEffect(() => {
    try { localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0') } catch { /* ignore */ }
  }, [collapsed])

  // While the drawer is open: Esc closes it, and the page behind can't scroll.
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = e => { if (e.key === 'Escape') setMobileOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // If the window grows to desktop size, the drawer no longer applies.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = e => { if (e.matches) setMobileOpen(false) }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const links = [
    { to: '/items', label: 'Items', icon: icons.list, end: true }, // `end`: don't light up on /items/new
    ...(user ? [{ to: '/items/new', label: 'Report Item', icon: icons.plus }] : [])
  ]

  // Text that disappears in collapsed mode (desktop only — the mobile drawer always shows labels).
  const hideWhenCollapsed = collapsed ? 'lg:hidden' : ''

  return (
    <>
      {/* Top bar with the menu button — small screens only */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center gap-2 bg-white border-b border-zinc-200 px-4 py-3">
        <button
          className="btn btn-ghost px-2"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="sidebar"
        >
          <Icon d={icons.menu} />
        </button>
        <Link to="/" className="font-bold">Campus Lost & Found</Link>
      </div>

      {/* Dimmed backdrop behind the open drawer; clicking it closes the drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      <aside
        id="sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-white border-r border-zinc-200
          transition-[transform,width] duration-200
          lg:sticky lg:bottom-auto lg:h-screen lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${collapsed ? 'lg:w-16' : 'lg:w-64'}`}
      >
        {/* Brand + collapse / close buttons */}
        <div className={`flex h-16 items-center justify-between gap-2 border-b border-zinc-200 px-3 ${collapsed ? 'lg:justify-center' : ''}`}>
          <Link to="/" className={`font-bold leading-tight pl-1 ${hideWhenCollapsed}`}>Campus Lost & Found</Link>
          <button
            className="btn btn-ghost px-2 hidden lg:inline-flex"
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon d={collapsed ? icons.expand : icons.collapse} />
          </button>
          <button className="btn btn-ghost px-2 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <Icon d={icons.close} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              title={collapsed ? l.label : undefined}
              className={`side-link ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
            >
              <Icon d={l.icon} />
              <span className={hideWhenCollapsed}>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom: who is logged in + Logout (or Login / Register when logged out) */}
        <div className="border-t border-zinc-200 p-3 space-y-3">
          {user ? (
            <>
              <div
                className={`flex items-center gap-3 ${collapsed ? 'lg:justify-center' : ''}`}
                title={collapsed ? `${user.name} (${user.email})` : undefined}
              >
                <div className="avatar">{initials(user.name)}</div>
                <div className={`min-w-0 ${hideWhenCollapsed}`}>
                  <div className="truncate text-sm font-semibold">{user.name}</div>
                  <div className="truncate text-xs text-zinc-500">{user.email}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className={`btn btn-secondary w-full ${collapsed ? 'lg:px-0' : ''}`}
                title="Logout"
              >
                <Icon d={icons.logout} />
                <span className={hideWhenCollapsed}>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`btn btn-primary w-full ${collapsed ? 'lg:px-0' : ''}`} title="Login">
                <Icon d={icons.login} />
                <span className={hideWhenCollapsed}>Login</span>
              </Link>
              <Link to="/register" className={`btn btn-secondary w-full ${collapsed ? 'lg:px-0' : ''}`} title="Register">
                <Icon d={icons.register} />
                <span className={hideWhenCollapsed}>Register</span>
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
