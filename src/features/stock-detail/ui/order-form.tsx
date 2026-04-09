import { useState } from 'react'

import { useStockPriceQuery } from '@/features/stock-detail/model/use-stock-detail-queries'

interface OrderFormProps {
  code: string
}

type OrderTab = 'buy' | 'sell' | 'modify'

export default function OrderForm({ code }: OrderFormProps) {
  const [activeTab, setActiveTab] = useState<OrderTab>('buy')
  const [quantity, setQuantity] = useState('')
  const { data: price } = useStockPriceQuery(code)

  const currentPrice = price?.currentPrice ?? 0
  const totalAmount = Number(quantity || 0) * currentPrice

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center border-b border-gray-100">
        <span className="px-3 py-1.5 text-xs font-medium text-wefin-text">주문하기</span>
        <div className="ml-auto flex">
          <OrderTabButton
            label="구매"
            active={activeTab === 'buy'}
            color="red"
            onClick={() => setActiveTab('buy')}
          />
          <OrderTabButton
            label="판매"
            active={activeTab === 'sell'}
            color="blue"
            onClick={() => setActiveTab('sell')}
          />
          <OrderTabButton
            label="정정"
            active={activeTab === 'modify'}
            color="gray"
            onClick={() => setActiveTab('modify')}
          />
        </div>
      </div>

      <div className="space-y-2 p-3">
        {price && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
            <InfoRow label="시작" value={`${price.openPrice.toLocaleString()}`} />
            <InfoRow label="최고" value={`${price.highPrice.toLocaleString()}`} />
            <InfoRow label="최저" value={`${price.lowPrice.toLocaleString()}`} />
            <InfoRow label="거래량" value={`${price.volume.toLocaleString()}`} />
          </div>
        )}

        <hr className="border-gray-100" />

        <div>
          <label className="mb-0.5 block text-[10px] text-wefin-subtle">수량</label>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-wefin-mint"
          />
        </div>

        <div className="grid grid-cols-4 gap-1">
          {['10%', '25%', '50%', '최대'].map((label) => (
            <button
              key={label}
              className="rounded-md border border-gray-200 py-1 text-[10px] text-wefin-subtle transition-colors hover:bg-gray-50"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span className="text-wefin-subtle">구매가능 금액</span>
            <span className="font-medium text-wefin-text">- 원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-wefin-subtle">총 주문 금액</span>
            <span className="font-medium text-wefin-text">{totalAmount.toLocaleString()}원</span>
          </div>
        </div>

        <button
          className={`w-full rounded-md py-2 text-xs font-bold text-white transition-colors ${
            activeTab === 'buy'
              ? 'bg-red-500 hover:bg-red-600'
              : activeTab === 'sell'
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-400 hover:bg-gray-500'
          }`}
        >
          {activeTab === 'buy' ? '구매하기' : activeTab === 'sell' ? '판매하기' : '정정하기'}
        </button>
      </div>
    </div>
  )
}

function OrderTabButton({
  label,
  active,
  color,
  onClick
}: {
  label: string
  active: boolean
  color: 'red' | 'blue' | 'gray'
  onClick: () => void
}) {
  const activeClasses = {
    red: 'bg-red-500 text-white',
    blue: 'bg-blue-500 text-white',
    gray: 'bg-gray-500 text-white'
  }

  return (
    <button
      onClick={onClick}
      className={`px-2 py-1.5 text-[10px] font-medium transition-colors ${
        active ? activeClasses[color] : 'text-wefin-subtle hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-wefin-subtle">{label}</span>
      <span className="text-wefin-text">{value}</span>
    </div>
  )
}
