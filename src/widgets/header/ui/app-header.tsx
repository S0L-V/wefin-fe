import { NavLink } from 'react-router-dom'

import LoginDialog from '@/features/auth-dialog/ui/login-dialog'
import { navigationItems, routes } from '@/shared/config/routes'

function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-wefin-line bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[74px] w-[min(1216px,calc(100%-32px))] items-center justify-between gap-4 max-md:w-[min(100%,calc(100%-24px))] max-md:flex-col max-md:items-start max-md:py-3">
        <div className="flex min-w-0 items-center gap-5 max-md:w-full max-md:flex-col max-md:items-start max-md:gap-3.5">
          <NavLink
            to={routes.home}
            className="text-[2.3rem] leading-none font-extrabold tracking-[-0.06em] text-wefin-mint max-md:text-[2rem]"
            aria-label="wefin 홈"
          >
            wefin
          </NavLink>

          <nav
            className="flex flex-wrap items-center gap-1.5 max-md:w-full max-md:gap-2"
            aria-label="Primary"
          >
            {navigationItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    'inline-flex h-9 items-center rounded-[10px] border border-transparent px-3 text-sm font-semibold whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-wefin-mint-soft text-wefin-mint'
                      : 'text-wefin-text hover:bg-wefin-mint-soft/60'
                  ].join(' ')
                }
              >
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 max-md:self-end">
          <LoginDialog />
        </div>
      </div>
    </header>
  )
}

export default AppHeader
