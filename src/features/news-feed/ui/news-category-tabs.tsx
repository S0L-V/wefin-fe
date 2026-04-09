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
    <div className="flex items-center gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
            activeTab === tab.value
              ? 'bg-wefin-text text-white'
              : 'bg-gray-100 text-wefin-subtle hover:bg-gray-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
