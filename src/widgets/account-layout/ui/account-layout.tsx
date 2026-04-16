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
  { key: 'profit-analysis', label: '리포트' }
]

const SECTION_DESCRIPTION: Record<AccountTab, string> = {
  asset: '예수금과 보유 자산 현황을 확인할 수 있어요.',
  'trade-history': '체결된 거래 기록을 날짜별로 확인하세요.',
  'order-history': '주문 상태별로 내역을 확인할 수 있어요.',
  'profit-analysis': '자산 추이와 손익을 한눈에 살펴보세요.'
}

export default function AccountLayout({ activeTab, onTabChange, children }: AccountLayoutProps) {
  const activeLabel = TABS.find((t) => t.key === activeTab)?.label ?? ''

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-[180px_minmax(0,1fr)] gap-4 pt-12">
      <aside className="sticky top-20 self-start">
        <div className="mb-7 text-[11px] font-bold uppercase tracking-widest text-wefin-subtle">
          My Account
        </div>
        <nav className="flex flex-col">
          {TABS.map(({ key, label }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onTabChange(key)}
                className={`relative px-3 py-3 text-left text-base transition-colors ${
                  isActive
                    ? 'font-bold text-wefin-mint-deep'
                    : 'font-medium text-wefin-subtle hover:text-wefin-text'
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

      <main className="max-w-md">
        <header className="mb-10">
          <h1 className="text-[28px] font-bold leading-tight text-wefin-text">{activeLabel}</h1>
          <p className="mt-1.5 text-sm text-wefin-subtle">{SECTION_DESCRIPTION[activeTab]}</p>
        </header>

        <div key={activeTab} className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
