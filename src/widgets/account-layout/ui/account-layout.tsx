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
  { key: 'profit-analysis', label: '수익분석' }
]

export default function AccountLayout({ activeTab, onTabChange, children }: AccountLayoutProps) {
  return (
    <div className="grid justify-start gap-8 lg:grid-cols-[160px_minmax(0,720px)]">
      <aside className="sticky top-20 self-start">
        <nav className="flex flex-col gap-1 rounded-2xl bg-gray-100 p-2">
          {TABS.map(({ key, label }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onTabChange(key)}
                className={`flex items-center rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-white font-semibold text-wefin-text shadow-sm'
                    : 'text-wefin-subtle hover:bg-white/60 hover:text-wefin-text'
                }`}
              >
                {label}
              </button>
            )
          })}
        </nav>
      </aside>

      <section className="min-h-[640px] rounded-3xl border border-wefin-line bg-white p-6 shadow-sm">
        {children}
      </section>
    </div>
  )
}
