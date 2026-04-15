import { useState } from 'react'

import { ApiError } from '@/shared/api/base-api'

import { useBuyMutation, useSellMutation } from '../model/use-order-mutations'
import OrderTabButton from './order-tab-button'

interface OrderFormProps {
  stockCode: string
  currentPrice: number
  accountState: {
    balance: number | null
    maxQuantity: number | null
  }
}

type OrderTab = 'buy' | 'sell' | 'modify'

const RATIO_OPTIONS = [
  { label: '10%', ratio: 0.1 },
  { label: '25%', ratio: 0.25 },
  { label: '50%', ratio: 0.5 },
  { label: '최대', ratio: 1 }
] as const

export default function OrderForm({ stockCode, currentPrice, accountState }: OrderFormProps) {
  const [activeTab, setActiveTab] = useState<OrderTab>('buy')
  const [quantity, setQuantity] = useState('')

  const buyMutation = useBuyMutation()
  const sellMutation = useSellMutation()

  const qtyNumber = Number(quantity || 0)
  const totalAmount = qtyNumber * currentPrice
  const activeMutation = activeTab === 'buy' ? buyMutation : sellMutation
  const isPending = buyMutation.isPending || sellMutation.isPending
  const canSubmit = activeTab !== 'modify' && qtyNumber >= 1 && !isPending

  const maxQuantity = activeTab === 'buy' ? (accountState.maxQuantity ?? 0) : 0
  const ratioDisabled = activeTab !== 'buy' || maxQuantity <= 0

  const handleSubmit = () => {
    if (!canSubmit) return
    const mutation = activeTab === 'buy' ? buyMutation : sellMutation
    mutation.mutate({ stockCode, quantity: qtyNumber }, { onSuccess: () => setQuantity('') })
  }

  const handleRatio = (ratio: number) => {
    if (ratioDisabled) return
    setQuantity(String(Math.max(1, Math.floor(maxQuantity * ratio))))
  }

  const errorMessage = resolveErrorMessage(activeMutation.error)

  return (
    <div>
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
        <div>
          <label className="mb-0.5 block text-[10px] text-wefin-subtle">수량</label>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            disabled={activeTab === 'modify'}
            className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-wefin-mint disabled:bg-gray-50"
          />
        </div>

        <div className="grid grid-cols-4 gap-1">
          {RATIO_OPTIONS.map(({ label, ratio }) => (
            <button
              key={label}
              type="button"
              disabled={ratioDisabled}
              onClick={() => handleRatio(ratio)}
              className="rounded-md border border-gray-200 py-1 text-[10px] text-wefin-subtle transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span className="text-wefin-subtle">구매가능 금액</span>
            <span className="font-medium text-wefin-text">
              {formatAmount(accountState.balance)}원
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-wefin-subtle">총 주문 금액</span>
            <span className="font-medium text-wefin-text">{totalAmount.toLocaleString()}원</span>
          </div>
        </div>

        {errorMessage && <p className="text-[10px] text-red-500">{errorMessage}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full rounded-md py-2 text-xs font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${getSubmitColor(activeTab)}`}
        >
          {getSubmitLabel(activeTab, isPending)}
        </button>
      </div>
    </div>
  )
}

function getSubmitColor(tab: OrderTab): string {
  if (tab === 'buy') return 'bg-red-500 hover:bg-red-600'
  if (tab === 'sell') return 'bg-blue-500 hover:bg-blue-600'
  return 'bg-gray-400 hover:bg-gray-500'
}

function getSubmitLabel(tab: OrderTab, isPending: boolean): string {
  if (isPending) return '처리중...'
  if (tab === 'buy') return '구매하기'
  if (tab === 'sell') return '판매하기'
  return '정정하기'
}

function formatAmount(value: number | null): string {
  if (value === null || value === undefined) return '-'
  return value.toLocaleString()
}

function resolveErrorMessage(error: unknown): string | null {
  if (!error) return null
  if (error instanceof ApiError) return error.message
  return '주문 처리 중 오류가 발생했어요.'
}
