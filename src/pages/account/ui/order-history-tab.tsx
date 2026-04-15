import { useState } from 'react'

import OrderHistoryList from '@/features/order/ui/order-history-list'
import TradeHistoryList from '@/features/trade/ui/trade-history-list'

type OrderSubTab = 'filled' | 'pending' | 'cancelled'

const SUB_TABS: { key: OrderSubTab; label: string }[] = [
  { key: 'filled', label: '체결' },
  { key: 'pending', label: '미체결' },
  { key: 'cancelled', label: '취소' }
]

export default function OrderHistoryTab() {
  const [subTab, setSubTab] = useState<OrderSubTab>('filled')

  return (
    <div className="space-y-6">
      <div className="flex gap-6 border-b border-wefin-line">
        {SUB_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSubTab(key)}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              subTab === key ? 'text-wefin-text' : 'text-wefin-subtle hover:text-wefin-text'
            }`}
          >
            {label}
            {subTab === key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-wefin-mint" />
            )}
          </button>
        ))}
      </div>

      {subTab === 'filled' && <TradeHistoryList />}
      {subTab === 'pending' && <OrderHistoryList statuses={['PENDING', 'PARTIAL']} />}
      {subTab === 'cancelled' && <OrderHistoryList statuses={['CANCELLED']} />}
    </div>
  )
}
