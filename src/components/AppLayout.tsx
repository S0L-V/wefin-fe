import { NavLink, Outlet } from 'react-router-dom'

const navigationItems = [
  { to: '/', label: '홈', end: true },
  { to: '/stocks', label: '실시간 주식' },
  { to: '/history', label: '과거 기반' },
  { to: '/chat', label: '채팅' },
  { to: '/settings', label: '설정' }
]

function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand-group">
            <NavLink to="/" className="brand-mark" aria-label="wefin 홈">
              wefin
            </NavLink>

            <nav className="app-nav" aria-label="Primary">
              {navigationItems.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    isActive ? 'app-nav-link app-nav-link-active' : 'app-nav-link'
                  }
                >
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <button type="button" className="login-button">
            로그인
          </button>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
