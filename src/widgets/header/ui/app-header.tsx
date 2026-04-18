import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown, LogOut, Settings, Wallet } from 'lucide-react'
import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

import { useAccountQuery } from '@/features/account/model/use-account-queries'
import AuthDialog from '@/features/auth-dialog/ui/auth-dialog'
import LoginDialog from '@/features/auth-dialog/ui/login-dialog'
import { useLeaveGuardStore } from '@/features/game-room/model/use-leave-guard-store'
import { usePortfolioQuery } from '@/features/portfolio/model/use-portfolio-queries'
import { navigationItems, routes } from '@/shared/config/routes'
import ConfirmDialog from '@/shared/ui/confirm-dialog'
import WefinLogoIcon from '@/shared/ui/wefin-logo-icon'

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
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isNavActive = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname.startsWith(to)

  useEffect(() => {
    if (!navRef.current || !indicatorRef.current) return
    const indicator = indicatorRef.current
    const activeLink = navRef.current.querySelector<HTMLElement>('[data-active="true"]')
    if (activeLink) {
      const navRect = navRef.current.getBoundingClientRect()
      const linkRect = activeLink.getBoundingClientRect()
      indicator.style.transition = 'none'
      indicator.style.width = `${linkRect.width}px`
      indicator.style.transform = `translateX(${linkRect.left - navRect.left}px)`
      indicator.style.opacity = '1'
      requestAnimationFrame(() => {
        indicator.style.transition = ''
      })
    } else {
      indicator.style.opacity = '0'
    }
  }, [location.pathname, scrolled])

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
            className={`group/logo font-extrabold tracking-tight text-wefin-mint-deep transition-all duration-300 hover:[text-shadow:0_0_20px_rgba(36,168,171,0.35),0_0_40px_rgba(36,168,171,0.15)] ${
              scrolled ? 'text-[26px]' : 'text-[32px]'
            }`}
            aria-label="wefin 홈"
          >
            <span className="inline-flex items-baseline">
              <WefinLogoIcon
                size={scrolled ? 24 : 30}
                className="mr-[-3px] translate-y-[5px] transition-all duration-300 group-hover/logo:drop-shadow-[0_0_12px_rgba(36,168,171,0.5)]"
              />
              <span>efin</span>
            </span>
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const initial = (user.nickname || '?').charAt(0).toUpperCase()
  const { data: account } = useAccountQuery()
  const { data: portfolio } = usePortfolioQuery()
  const balance = Math.trunc(account?.balance ?? 0)
  const evaluationAmount = Math.trunc(
    (portfolio ?? []).reduce((sum, item) => sum + (item.evaluationAmount ?? 0), 0)
  )
  const totalAsset = balance + evaluationAmount

  return (
    <div className="group relative">
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-transparent pl-0.5 pr-3 text-sm font-bold text-wefin-text transition-all hover:border-wefin-mint-deep/20 hover:shadow-[0_0_12px_rgba(36,168,171,0.15)]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-wefin-mint-deep to-emerald-400 text-sm font-bold text-white ring-2 ring-wefin-mint-soft">
          {initial}
        </span>
        {user.nickname}
        <ChevronDown
          size={14}
          className="text-wefin-subtle transition-transform group-hover:rotate-180"
        />
      </button>
      <div className="invisible absolute right-0 top-full z-30 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
        <div className="w-64 overflow-hidden rounded-2xl border border-wefin-line bg-white shadow-[0_12px_32px_-8px_rgba(36,168,171,0.2)]">
          <div className="bg-gradient-to-br from-wefin-mint-deep/5 to-transparent px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-wefin-mint-deep to-emerald-400 text-base font-bold text-white ring-2 ring-wefin-mint-soft">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-wefin-text">{user.nickname}</p>
                {user.email && <p className="truncate text-xs text-wefin-subtle">{user.email}</p>}
              </div>
            </div>
            {account && (
              <p className="mt-3 rounded-lg bg-white/60 px-3 py-2 text-right text-sm font-bold tabular-nums text-wefin-text">
                {totalAsset.toLocaleString()}원
              </p>
            )}
          </div>
          <div className="border-t border-wefin-line py-1">
            <button
              type="button"
              onClick={onAccountClick}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-wefin-text transition-colors hover:bg-wefin-bg"
            >
              <Wallet size={16} className="text-wefin-subtle" />내 계좌
            </button>
            <button
              type="button"
              onClick={onSettingsClick}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-wefin-text transition-colors hover:bg-wefin-bg"
            >
              <Settings size={16} className="text-wefin-subtle" />
              설정
            </button>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-rose-500 transition-colors hover:bg-rose-50"
            >
              <LogOut size={16} />
              로그아웃
            </button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={showLogoutConfirm}
        onConfirm={() => {
          setShowLogoutConfirm(false)
          onLogout()
        }}
        onCancel={() => setShowLogoutConfirm(false)}
        title="로그아웃 하시겠어요?"
        description="다시 로그인하면 이어서 이용할 수 있어요"
        confirmLabel="로그아웃"
        cancelLabel="취소"
        confirmVariant="danger"
        icon={<LogOut size={22} className="text-rose-500" />}
      />
    </div>
  )
}

export default AppHeader
