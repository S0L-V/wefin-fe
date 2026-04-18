import type { ClusterTab } from '../api/fetch-news-clusters'

const TABS: { value: ClusterTab; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'FINANCE', label: '경제' },
  { value: 'TECH', label: 'IT/과학' },
  { value: 'INDUSTRY', label: '산업' },
  { value: 'ENERGY', label: '에너지' },
  { value: 'BIO', label: '바이오' },
  { value: 'CRYPTO', label: '암호화폐' }
]

interface NewsCategoryTabsProps {
  activeTab: ClusterTab
  onTabChange: (tab: ClusterTab) => void
}

export default function NewsCategoryTabs({ activeTab, onTabChange }: NewsCategoryTabsProps) {
  return (
    <div className="flex items-center gap-1">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`origin-center cursor-pointer px-3 py-1.5 text-sm font-semibold transition-all ${
            activeTab === tab.value
              ? 'scale-110 text-wefin-mint-deep underline decoration-2 underline-offset-6'
              : 'text-wefin-subtle hover:scale-105 hover:text-wefin-text'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
