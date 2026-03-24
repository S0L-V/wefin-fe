import * as Dialog from '@radix-ui/react-dialog'
import { BellRing, ChartNoAxesCombined, LockKeyhole, X } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { useAppShellQuery } from '../features/app-shell/use-app-shell-query'
import { useUiStore } from '../stores/ui-store'

const navigationItems = [
  { to: '/', label: '홈', end: true },
  { to: '/stocks', label: '실시간 주식' },
  { to: '/history', label: '과거 기반' },
  { to: '/chat', label: '채팅' },
  { to: '/settings', label: '설정' }
]

function AppLayout() {
  const { data } = useAppShellQuery()
  const isLoginDialogOpen = useUiStore((state) => state.isLoginDialogOpen)
  const setLoginDialogOpen = useUiStore((state) => state.setLoginDialogOpen)

  return (
    <div className="min-h-screen bg-wefin-bg">
      <header className="sticky top-0 z-20 border-b border-wefin-line bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[74px] w-[min(1216px,calc(100%-32px))] items-center justify-between gap-4 max-md:w-[min(100%,calc(100%-24px))] max-md:flex-col max-md:items-start max-md:py-3">
          <div className="flex min-w-0 items-center gap-5 max-md:w-full max-md:flex-col max-md:items-start max-md:gap-3.5">
            <div className="flex items-center gap-3">
              <NavLink
                to="/"
                className="text-[2.3rem] leading-none font-extrabold tracking-[-0.06em] text-wefin-mint max-md:text-[2rem]"
                aria-label="wefin 홈"
              >
                wefin
              </NavLink>

              {data ? (
                <div className="hidden items-center gap-1 rounded-full border border-wefin-line bg-slate-50 px-2.5 py-1 text-[12px] font-medium text-wefin-subtle md:inline-flex">
                  <ChartNoAxesCombined className="size-3.5 text-wefin-mint" />
                  <span>{data.market}</span>
                  <span className="text-slate-300">/</span>
                  <span>{data.status}</span>
                </div>
              ) : null}
            </div>

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
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-full border border-wefin-line bg-white text-wefin-subtle transition-colors hover:border-wefin-mint/30 hover:text-wefin-mint"
              aria-label="알림"
            >
              <BellRing className="size-4" />
            </button>

            <Dialog.Root open={isLoginDialogOpen} onOpenChange={setLoginDialogOpen}>
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  className="inline-flex h-[34px] min-w-[88px] items-center justify-center rounded-[9px] bg-[#56c1c9] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#48b4bc]"
                >
                  로그인
                </button>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="dialog-content">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-wefin-mint-soft px-3 py-1 text-xs font-semibold text-wefin-mint">
                        <LockKeyhole className="size-3.5" />
                        Radix UI Dialog
                      </div>
                      <Dialog.Title className="text-xl font-semibold text-slate-900">
                        로그인 모달 기본 세팅
                      </Dialog.Title>
                      <Dialog.Description className="text-sm leading-6 text-slate-500">
                        Zustand로 열림 상태를 관리하고 있습니다. 이후 실제 로그인 폼을 이 안에
                        붙이면 됩니다.
                      </Dialog.Description>
                    </div>

                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100"
                        aria-label="닫기"
                      >
                        <X className="size-4" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Data layer</span>
                      <span className="font-semibold text-slate-900">Axios + Zod</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Server state</span>
                      <span className="font-semibold text-slate-900">TanStack Query</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>UI state</span>
                      <span className="font-semibold text-slate-900">Zustand</span>
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </header>

      <main className="mx-auto w-[min(1216px,calc(100%-32px))] pt-6 pb-8 max-md:w-[min(100%,calc(100%-24px))] max-md:pt-4">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
