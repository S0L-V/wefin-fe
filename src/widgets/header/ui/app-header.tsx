import { useQueryClient } from '@tanstack/react-query'
import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

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
  const [scrolled, setScrolled] = useState(false)
  const guardActive = useLeaveGuardStore((s) => s.active)
  const requestLeave = useLeaveGuardStore((s) => s.requestLeave)
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const navRef = useRef<HTMLElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isNavActive = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname.startsWith(to)

  useEffect(() => {
    if (!navRef.current || !indicatorRef.current) return
    const activeLink = navRef.current.querySelector<HTMLElement>('[data-active="true"]')
    if (activeLink) {
      const navRect = navRef.current.getBoundingClientRect()
      const linkRect = activeLink.getBoundingClientRect()
      indicatorRef.current.style.width = `${linkRect.width}px`
      indicatorRef.current.style.transform = `translateX(${linkRect.left - navRect.left}px)`
      indicatorRef.current.style.opacity = '1'
    } else {
      indicatorRef.current.style.opacity = '0'
    }
  }, [location.pathname])

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

    // 사용자 스코프 캐시(그룹/계정 등) 제거 — 다른 사용자가 로그인 시 stale data 방지
    queryClient.removeQueries({ queryKey: ['settings', 'my-group'] })
    window.dispatchEvent(new Event('auth-changed'))
  }

  return (
    <header
      className={`sticky top-0 z-20 bg-white/80 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ${
        scrolled ? 'shadow-[0_1px_3px_rgba(0,0,0,0.06)]' : 'shadow-none'
      }`}
    >
      <div
        className={`flex w-full items-center justify-between gap-6 px-6 transition-all duration-300 ${
          scrolled ? 'h-12' : 'h-16'
        }`}
      >
        <div className="flex min-w-0 items-center gap-10">
          <NavLink
            to={routes.home}
            onClick={(e) => handleNavClick(e, routes.home)}
            className={`font-extrabold tracking-tight text-wefin-mint-deep transition-all duration-300 hover:[text-shadow:0_0_20px_rgba(36,168,171,0.35),0_0_40px_rgba(36,168,171,0.15)] ${
              scrolled ? 'text-[26px]' : 'text-[32px]'
            }`}
            aria-label="wefin 홈"
          >
            wefin
          </NavLink>

          <nav ref={navRef} className="relative flex items-center gap-1" aria-label="Primary">
            <div
              ref={indicatorRef}
              className="absolute bottom-0 h-[2px] rounded-full bg-wefin-mint-deep opacity-0 transition-all duration-300"
            />
            {navigationItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={(e) => handleNavClick(e, to)}
                className={({ isActive }) =>
                  [
                    'inline-flex h-10 items-center px-4 text-base font-bold whitespace-nowrap transition-colors',
                    isActive ? 'text-wefin-mint-deep' : 'text-wefin-subtle hover:text-wefin-text'
                  ].join(' ')
                }
                {...(isNavActive(to, end) ? { 'data-active': 'true' } : {})}
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
              onSettingsClick={() => navigate(routes.settings)}
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
  onAccountClick,
  onSettingsClick
}: {
  user: AuthUser
  onLogout: () => void
  onAccountClick: () => void
  onSettingsClick: () => void
}) {
  const initial = (user.nickname || '?').charAt(0).toUpperCase()

  return (
    <div className="group relative">
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-full pl-1 pr-4 text-base font-bold text-wefin-text transition-colors hover:bg-wefin-bg"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-wefin-mint-soft text-sm font-bold text-wefin-mint-deep">
          {initial}
        </span>
        {user.nickname}
      </button>
      {/* 호버 영역 끊기지 않도록 padding-top으로 다리 */}
      <div className="invisible absolute right-0 top-full z-30 pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
        <div className="w-60 overflow-hidden rounded-xl border border-wefin-line bg-white shadow-[0_8px_24px_-8px_rgba(36,168,171,0.2)]">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-wefin-mint-soft text-sm font-bold text-wefin-mint-deep">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-wefin-text">{user.nickname}</p>
              {user.email && <p className="truncate text-xs text-wefin-subtle">{user.email}</p>}
            </div>
          </div>
          <div className="border-t border-wefin-line py-1">
            <button
              type="button"
              onClick={onAccountClick}
              className="block w-full px-4 py-2.5 text-left text-sm font-medium text-wefin-text transition-colors hover:bg-wefin-bg"
            >
              내 계좌
            </button>
            <button
              type="button"
              onClick={onSettingsClick}
              className="block w-full px-4 py-2.5 text-left text-sm font-medium text-wefin-text transition-colors hover:bg-wefin-bg"
            >
              설정
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="block w-full px-4 py-2.5 text-left text-sm font-medium text-rose-500 transition-colors hover:bg-rose-50"
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
