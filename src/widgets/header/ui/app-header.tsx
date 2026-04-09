import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

import AuthDialog from '@/features/auth-dialog/ui/auth-dialog'
import LoginDialog from '@/features/auth-dialog/ui/login-dialog'
import { navigationItems, routes } from '@/shared/config/routes'

type AuthUser = {
  isLoggedIn: boolean
  nickname: string
}

function getAuthUser(): AuthUser {
  const token = localStorage.getItem('accessToken')
  const nickname = localStorage.getItem('nickname') ?? ''

  return {
    isLoggedIn: !!token,
    nickname
  }
}

function AppHeader() {
  const [authUser, setAuthUser] = useState<AuthUser>(() => getAuthUser())

  useEffect(() => {
    const syncAuthUser = () => {
      setAuthUser(getAuthUser())
    }

    window.addEventListener('auth-changed', syncAuthUser)
    window.addEventListener('storage', syncAuthUser)

    return () => {
      window.removeEventListener('auth-changed', syncAuthUser)
      window.removeEventListener('storage', syncAuthUser)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('nickname')

    window.dispatchEvent(new Event('auth-changed'))
  }

  return (
    <header className="sticky top-0 z-20 border-b border-wefin-line bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[52px] w-[min(1400px,calc(100%-32px))] items-center justify-between gap-4 max-md:w-[min(100%,calc(100%-24px))] max-md:flex-col max-md:items-start max-md:py-2">
        <div className="flex min-w-0 items-center gap-5 max-md:w-full max-md:flex-col max-md:items-start max-md:gap-3.5">
          <NavLink
            to={routes.home}
            className="text-[1.6rem] leading-none font-extrabold tracking-[-0.06em] text-wefin-mint max-md:text-[1.4rem]"
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
          {authUser.isLoggedIn ? (
            <>
              <span className="text-sm font-semibold text-wefin-text">{authUser.nickname}님</span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-[34px] min-w-[88px] items-center justify-center rounded-[9px] border border-wefin-line px-4 text-sm font-semibold text-wefin-text transition-colors hover:bg-wefin-mint-soft/60"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <LoginDialog />
              <AuthDialog />
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default AppHeader
