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
    <div className="mx-auto grid max-w-6xl grid-cols-[220px_minmax(0,1fr)] gap-10">
      <aside className="sticky top-20 self-start">
        <div className="mb-6 text-xs font-semibold uppercase tracking-wider text-wefin-subtle">
          My Account
        </div>
        <nav className="flex flex-col gap-1">
          {TABS.map(({ key, label }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onTabChange(key)}
                className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-wefin-mint-soft text-wefin-mint-deep'
                    : 'text-wefin-subtle hover:bg-wefin-bg hover:text-wefin-text'
                }`}
              >
                {label}
              </button>
            )
          })}
        </nav>
      </aside>

      <main>
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-wefin-text">{activeLabel}</h1>
          <p className="mt-1 text-sm text-wefin-subtle">{SECTION_DESCRIPTION[activeTab]}</p>
        </header>

        <div key={activeTab} className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
