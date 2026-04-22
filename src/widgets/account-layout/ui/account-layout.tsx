import type { ReactNode } from 'react'

import type { AccountTab } from '@/shared/config/routes'

interface AccountLayoutProps {
  activeTab: AccountTab
  onTabChange: (tab: AccountTab) => void
  children: ReactNode
}

const TABS: { key: AccountTab; label: string }[] = [
  { key: 'asset', label: '자산' },
  { key: 'trade-history', label: '거래내역' },
  { key: 'order-history', label: '주문내역' },
  { key: 'profit-analysis', label: '투자현황' },
  { key: 'ranking', label: '랭킹' }
]

const SECTION_DESCRIPTION: Record<AccountTab, string> = {
  asset: '예수금과 보유 자산 현황을 확인할 수 있어요.',
  'trade-history': '체결된 거래 기록을 날짜별로 확인하세요.',
  'order-history': '주문 상태별로 내역을 확인할 수 있어요.',
  'profit-analysis': '자산 추이와 손익을 한눈에 살펴보세요.',
  ranking: '일일 수익 랭킹을 확인하세요.'
}

export default function AccountLayout({ activeTab, onTabChange, children }: AccountLayoutProps) {
  const activeLabel = TABS.find((t) => t.key === activeTab)?.label ?? ''

  return (
    <div className="mx-auto max-w-6xl pt-6 sm:pt-12">
      {/* 모바일: 가로 탭 */}
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-wefin-line px-4 scrollbar-thin sm:hidden">
        {TABS.map(({ key, label }) => {
          const isActive = activeTab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              className={`shrink-0 border-b-2 px-3 pb-2.5 pt-1 text-[13px] font-bold transition-colors ${
                isActive
                  ? 'border-wefin-mint text-wefin-mint'
                  : 'border-transparent text-wefin-subtle'
              }`}
            >
              {label}
            </button>
          )
        })}
      </nav>

      <div className="grid sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
        {/* 데스크탑: 사이드 네비 */}
        <aside className="sticky top-20 hidden self-start sm:block">
          <nav className="flex flex-col">
            {TABS.map(({ key, label }) => {
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onTabChange(key)}
                  className={`relative origin-left px-3 py-3 text-left transition-all ${
                    isActive
                      ? 'text-lg font-bold text-wefin-mint-deep'
                      : 'text-base font-medium text-wefin-subtle hover:scale-105 hover:text-wefin-text'
                  }`}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-wefin-mint-deep"
                    />
                  )}
                  {label}
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="px-4 sm:max-w-md sm:px-0">
          <header className="mb-6 sm:mb-10">
            <h1 className="text-xl font-bold leading-tight text-wefin-text sm:text-[28px]">
              {activeLabel}
            </h1>
            <p className="mt-1 text-sm text-wefin-subtle sm:mt-1.5">
              {SECTION_DESCRIPTION[activeTab]}
            </p>
          </header>

          <div key={activeTab} className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
