import { useState } from 'react'

import InterestSectorsPanel from './interest-sectors-panel'
import InterestStocksPanel from './interest-stocks-panel'

type Tab = 'stocks' | 'sectors'

const TABS: { id: Tab; label: string }[] = [
  { id: 'stocks', label: '관심 종목' },
  { id: 'sectors', label: '관심 분야' }
]

export default function InterestsPage() {
  const [tab, setTab] = useState<Tab>('stocks')

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-wefin-line bg-white p-6 shadow-sm">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-wefin-text">관심 목록 관리</h1>
        <p className="mt-1 text-sm text-wefin-subtle">
          관심 종목과 관심 분야를 등록하면 맞춤 금융 동향과 피드에 반영됩니다. 타입별 최대 10개까지
          등록할 수 있어요.
        </p>
      </header>

      <div
        className="mb-5 flex gap-1 rounded-full bg-gray-100 p-1"
        role="tablist"
        aria-label="관심사 타입"
      >
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active ? 'bg-white text-wefin-text shadow-sm' : 'text-wefin-subtle'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'stocks' && <InterestStocksPanel />}
      {tab === 'sectors' && <InterestSectorsPanel />}
    </div>
  )
}
