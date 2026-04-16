import { ChevronDown } from 'lucide-react'
import { type MouseEvent, useCallback, useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import AuthDialog from '@/features/auth-dialog/ui/auth-dialog'
import LoginDialog from '@/features/auth-dialog/ui/login-dialog'
import { useLeaveGuardStore } from '@/features/game-room/model/use-leave-guard-store'
import { navigationItems, routes } from '@/shared/config/routes'

type AuthUser = {
  isLoggedIn: boolean
  nickname: string
  email: string
}

function getAuthUser(): AuthUser {
  const token = localStorage.getItem('accessToken')
  const nickname = localStorage.getItem('nickname') ?? ''
  const email = localStorage.getItem('email') ?? ''

  return {
    isLoggedIn: !!token,
    nickname,
    email
  }
}

function AppHeader() {
  const [authUser, setAuthUser] = useState<AuthUser>(() => getAuthUser())
  const guardActive = useLeaveGuardStore((s) => s.active)
  const requestLeave = useLeaveGuardStore((s) => s.requestLeave)
  const navigate = useNavigate()

  const handleNavClick = useCallback(
    (e: MouseEvent, to: string) => {
      if (guardActive) {
        e.preventDefault()
        requestLeave(to)
      }
    },
    [guardActive, requestLeave]
  )

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
    localStorage.removeItem('email')

    window.dispatchEvent(new Event('auth-changed'))
  }

  return (
    <header className="sticky top-0 z-20 bg-white/70 shadow-[0_4px_24px_-8px_rgba(36,168,171,0.25)] backdrop-blur-xl backdrop-saturate-150 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-wefin-mint/50 after:to-transparent">
      <div className="flex h-14 w-full items-center justify-between gap-6 px-6">
        <div className="flex min-w-0 items-center gap-8">
          <NavLink
            to={routes.home}
            onClick={(e) => handleNavClick(e, routes.home)}
            className="text-xl font-extrabold tracking-tight text-wefin-mint"
            aria-label="wefin 홈"
          >
            wefin
          </NavLink>

          <nav className="flex items-center gap-1" aria-label="Primary">
            {navigationItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={(e) => handleNavClick(e, to)}
                className={({ isActive }) =>
                  [
                    'inline-flex h-9 items-center rounded-lg px-3.5 text-sm whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-wefin-mint-soft font-bold text-wefin-mint-deep'
                      : 'font-medium text-wefin-subtle hover:bg-wefin-bg hover:text-wefin-text'
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {authUser.isLoggedIn ? (
            <UserMenu
              user={authUser}
              onLogout={handleLogout}
              onAccountClick={() => navigate(routes.account)}
            />
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

function UserMenu({
  user,
  onLogout,
  onAccountClick
}: {
  user: AuthUser
  onLogout: () => void
  onAccountClick: () => void
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className="inline-flex h-[34px] items-center gap-1 rounded-[9px] border border-wefin-line px-3 text-sm font-semibold text-wefin-text transition-colors group-hover:bg-wefin-mint-soft/60"
      >
        {user.nickname}님
        <ChevronDown className="h-3.5 w-3.5 text-wefin-subtle transition-transform group-hover:rotate-180" />
      </button>
      {/* 호버 영역 끊기지 않도록 padding-top으로 다리 */}
      <div className="invisible absolute right-0 top-full z-30 pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
        <div className="w-56 overflow-hidden rounded-xl border border-wefin-line bg-white shadow-lg">
          <div className="border-b border-wefin-line px-4 py-3">
            <p className="text-sm font-semibold text-wefin-text">{user.nickname}</p>
            {user.email && (
              <p className="mt-0.5 truncate text-xs text-wefin-subtle">{user.email}</p>
            )}
          </div>
          <div className="py-1">
            <button
              type="button"
              onClick={onAccountClick}
              className="block w-full px-4 py-2 text-left text-sm text-wefin-text transition-colors hover:bg-wefin-bg"
            >
              내 계좌
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="block w-full px-4 py-2 text-left text-sm text-wefin-text transition-colors hover:bg-wefin-bg"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppHeader
