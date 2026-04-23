import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown, LogOut, Moon, Settings, Sun, Wallet } from 'lucide-react'
import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

import { useAccountQuery } from '@/features/account/model/use-account-queries'
import AuthDialog from '@/features/auth-dialog/ui/auth-dialog'
import LoginDialog from '@/features/auth-dialog/ui/login-dialog'
import { useLeaveGuardStore } from '@/features/game-room/model/use-leave-guard-store'
import { MY_SUBSCRIPTION_KEY } from '@/features/payment/model/use-my-subscription-query'
import { usePortfolioQuery } from '@/features/portfolio/model/use-portfolio-queries'
import { getProfileGradient } from '@/features/settings/lib/profile-gradient'
import { navigationItems, routes } from '@/shared/config/routes'
import { useTheme } from '@/shared/model/use-theme'
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
  const hasMeasuredRef = useRef(false)

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
      if (!hasMeasuredRef.current) {
        indicator.style.transition = 'none'
      }
      indicator.style.width = `${linkRect.width}px`
      indicator.style.transform = `translateX(${linkRect.left - navRect.left}px)`
      indicator.style.opacity = '1'
      if (!hasMeasuredRef.current) {
        requestAnimationFrame(() => {
          indicator.style.transition = ''
        })
        hasMeasuredRef.current = true
      }
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

    // 사용자 스코프 캐시 제거
    queryClient.removeQueries({ queryKey: ['settings', 'my-group'] })
    queryClient.removeQueries({ queryKey: ['portfolio', 'list'] })
    queryClient.removeQueries({ queryKey: MY_SUBSCRIPTION_KEY })

    window.dispatchEvent(new Event('auth-changed'))
  }

  return (
    <header
      className={`sticky top-0 z-20 bg-wefin-surface/80 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ${
        scrolled ? 'shadow-[0_1px_3px_rgba(0,0,0,0.06)]' : 'shadow-none'
      }`}
    >
      <div
        className={`flex w-full items-center justify-between gap-3 px-4 transition-all duration-300 sm:gap-6 sm:px-6 ${
          scrolled ? 'h-12' : 'h-14 sm:h-16'
        }`}
      >
        <div className="flex min-w-0 items-center gap-4 sm:gap-10">
          <NavLink
            to={routes.home}
            onClick={(e) => handleNavClick(e, routes.home)}
            className="group/logo inline-flex items-baseline transition-all hover:[text-shadow:0_0_20px_rgba(20,184,166,0.3),0_0_40px_rgba(20,184,166,0.1)]"
            aria-label="wefin 홈"
          >
            <WefinLogoIcon
              size={28}
              className="mr-[-4px] translate-y-[4px] text-wefin-mint transition-all duration-300 group-hover/logo:drop-shadow-[0_0_12px_rgba(20,184,166,0.4)] sm:hidden"
            />
            <WefinLogoIcon
              size={38}
              className="mr-[-6px] translate-y-[6px] text-wefin-mint transition-all duration-300 group-hover/logo:drop-shadow-[0_0_12px_rgba(20,184,166,0.4)] hidden sm:block"
            />
            <span className="hidden text-[28px] font-extrabold text-wefin-mint sm:inline">
              efin
            </span>
          </NavLink>

          <nav
            ref={navRef}
            className="relative flex items-center gap-0 sm:gap-1"
            aria-label="Primary"
          >
            <div
              ref={indicatorRef}
              className="absolute bottom-0 h-[2px] rounded-full bg-wefin-mint opacity-0 transition-all duration-300"
            />
            {navigationItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={(e) => handleNavClick(e, to)}
                className={({ isActive }) =>
                  [
                    'inline-flex h-10 items-center px-2 text-sm font-bold whitespace-nowrap transition-colors sm:px-4 sm:text-base',
                    isActive ? 'text-wefin-mint' : 'text-wefin-text-2 hover:text-wefin-text'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileGrad, setProfileGrad] = useState(getProfileGradient)
  const { theme, setTheme } = useTheme()
  const menuRef = useRef<HTMLDivElement>(null)
  const initial = (user.nickname || '?').charAt(0).toUpperCase()

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  useEffect(() => {
    const sync = () => setProfileGrad(getProfileGradient())
    window.addEventListener('profile-color-changed', sync)
    return () => window.removeEventListener('profile-color-changed', sync)
  }, [])
  const { data: account } = useAccountQuery()
  const { data: portfolio } = usePortfolioQuery()
  const balance = Math.trunc(account?.balance ?? 0)
  const evaluationAmount = Math.trunc(
    (portfolio ?? []).reduce((sum, item) => sum + (item.evaluationAmount ?? 0), 0)
  )
  const totalAsset = balance + evaluationAmount

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-transparent pl-0.5 pr-1 text-sm font-bold text-wefin-text transition-all hover:border-wefin-mint-deep/20 hover:shadow-[0_0_12px_rgba(36,168,171,0.15)] sm:pr-3"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-white/50"
          style={{ background: `linear-gradient(135deg, ${profileGrad.from}, ${profileGrad.to})` }}
        >
          {initial}
        </span>
        <span className="hidden sm:inline">{user.nickname}</span>
        <ChevronDown
          size={14}
          className={`hidden text-wefin-subtle transition-transform sm:block ${menuOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`absolute right-0 top-full z-30 pt-2 transition-all ${menuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
      >
        <div className="w-64 overflow-hidden rounded-2xl border border-wefin-line bg-wefin-surface shadow-[0_12px_32px_-8px_rgba(36,168,171,0.2)]">
          <div className="bg-gradient-to-br from-wefin-mint-deep/5 to-transparent px-4 py-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full text-base font-bold text-white ring-2 ring-white/50"
                style={{
                  background: `linear-gradient(135deg, ${profileGrad.from}, ${profileGrad.to})`
                }}
              >
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-wefin-text">{user.nickname}</p>
                {user.email && <p className="truncate text-xs text-wefin-subtle">{user.email}</p>}
              </div>
            </div>
            {account && (
              <p className="mt-3 rounded-lg bg-wefin-surface-2 px-3 py-2 text-right text-sm font-bold tabular-nums text-wefin-text">
                {totalAsset.toLocaleString()}원
              </p>
            )}
          </div>
          <div className="border-t border-wefin-line py-1">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onAccountClick()
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-wefin-text transition-colors hover:bg-wefin-bg"
            >
              <Wallet size={16} className="text-wefin-subtle" />내 계좌
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onSettingsClick()
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-wefin-text transition-colors hover:bg-wefin-bg"
            >
              <Settings size={16} className="text-wefin-subtle" />
              설정
            </button>
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon size={16} className="text-wefin-subtle" />
                ) : (
                  <Sun size={16} className="text-wefin-subtle" />
                )}
                <span className="text-sm font-medium text-wefin-text">다크 모드</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={theme === 'dark'}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-wefin-mint' : 'bg-wefin-line-2'
                }`}
              >
                <span
                  className={`inline-block h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform ${
                    theme === 'dark' ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-rose-500 transition-colors hover:bg-wefin-red-soft"
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
