import { useState } from 'react'

type HistoryTab = 'pending' | 'completed' | 'conditional'

export default function OrderHistoryPanel() {
  const [activeTab, setActiveTab] = useState<HistoryTab>('pending')

  return (
    <div>
      <div className="flex items-center gap-0.5 border-b border-gray-100 px-2 py-1.5">
        <span className="mr-1 text-xs font-medium text-wefin-text">주문내역</span>
        {(['pending', 'completed', 'conditional'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-tight transition-colors ${
              activeTab === tab ? 'bg-wefin-text text-white' : 'text-wefin-subtle hover:bg-gray-100'
            }`}
          >
            {tab === 'pending' ? '대기' : tab === 'completed' ? '완료' : '조건\n주문'}
          </button>
        ))}
      </div>
      <div className="px-3 py-4 text-center text-[10px] text-gray-400">대기중인 주문이 없어요</div>
    </div>
  )
}
