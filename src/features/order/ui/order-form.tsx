import { useState } from 'react'

import SegmentedTabs, { type SegmentedTabItem } from '@/shared/ui/segmented-tabs'

import {
  formatAmount,
  getSubmitColor,
  getSubmitLabel,
  type OrderTab,
  type PriceMode,
  priceTick,
  resolveErrorMessage
} from '../lib/order-form-utils'
import { useBuyMutation, useSellMutation } from '../model/use-order-mutations'
import PriceInput from './price-input'
import QuantityInput from './quantity-input'

interface OrderFormProps {
  stockCode: string
  currentPrice: number
  accountState: {
    balance: number | null
    maxQuantity: number | null
  }
  holdingQuantity?: number | null
  priceFromOrderbook?: number | null
}

const ORDER_TABS: SegmentedTabItem<OrderTab>[] = [
  { key: 'buy', label: '구매', tone: 'red' },
  { key: 'sell', label: '판매', tone: 'blue' },
  { key: 'modify', label: '정정', tone: 'gray' }
]

const PRICE_MODE_TABS: SegmentedTabItem<PriceMode>[] = [
  { key: 'limit', label: '지정가' },
  { key: 'market', label: '시장가' }
]

export default function OrderForm({
  stockCode,
  currentPrice,
  accountState,
  holdingQuantity,
  priceFromOrderbook
}: OrderFormProps) {
  const [activeTab, setActiveTab] = useState<OrderTab>('buy')
  const [priceMode, setPriceMode] = useState<PriceMode>('limit')
  const [limitPrice, setLimitPrice] = useState<number>(0)
  const [quantity, setQuantity] = useState('')
  const [prevOrderbookPrice, setPrevOrderbookPrice] = useState<number | null | undefined>(
    priceFromOrderbook
  )

  // 호가창 클릭으로 priceFromOrderbook이 바뀌면 (지정가 모드일 때) limitPrice 동기화
  if (priceFromOrderbook !== prevOrderbookPrice) {
    setPrevOrderbookPrice(priceFromOrderbook)
    if (priceMode === 'limit' && priceFromOrderbook && priceFromOrderbook > 0) {
      setLimitPrice(priceFromOrderbook)
    }
  }

  const buyMutation = useBuyMutation()
  const sellMutation = useSellMutation()

  const effectiveLimitPrice = limitPrice > 0 ? limitPrice : currentPrice
  const effectivePrice = priceMode === 'market' ? currentPrice : effectiveLimitPrice
  const qtyNumber = Number(quantity || 0)
  const totalAmount = qtyNumber * effectivePrice
  const activeMutation = activeTab === 'buy' ? buyMutation : sellMutation
  const isPending = buyMutation.isPending || sellMutation.isPending
  const canSubmit = activeTab !== 'modify' && qtyNumber >= 1 && !isPending
  const maxQuantity =
    activeTab === 'buy'
      ? (accountState.maxQuantity ?? 0)
      : activeTab === 'sell'
        ? (holdingQuantity ?? 0)
        : 0
  const ratioDisabled = activeTab === 'modify' || maxQuantity <= 0

  const handleSubmit = () => {
    if (!canSubmit || priceMode === 'limit') return
    const mutation = activeTab === 'buy' ? buyMutation : sellMutation
    mutation.mutate({ stockCode, quantity: qtyNumber }, { onSuccess: () => setQuantity('') })
  }

  const handleRatio = (ratio: number) => {
    if (ratioDisabled) return
    setQuantity(String(Math.max(1, Math.floor(maxQuantity * ratio))))
  }

  const adjustPrice = (dir: 1 | -1) => {
    if (priceMode !== 'limit') return
    const tick = priceTick(limitPrice || currentPrice)
    setLimitPrice((p) => Math.max(0, (p || currentPrice) + dir * tick))
  }

  const errorMessage =
    priceMode === 'limit' && canSubmit
      ? '지정가 주문은 곧 출시됩니다'
      : resolveErrorMessage(activeMutation.error)

  return (
    <div>
      <div className="flex h-11 items-center justify-between border-b border-wefin-line px-3">
        <span className="text-sm font-semibold text-wefin-text">주문하기</span>
        <SegmentedTabs
          items={ORDER_TABS}
          activeKey={activeTab}
          onChange={setActiveTab}
          shape="square"
        />
      </div>

      <div className="space-y-3 p-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-wefin-subtle">
              {activeTab === 'sell' ? '판매 가격' : '구매 가격'}
            </span>
            <SegmentedTabs
              items={PRICE_MODE_TABS}
              activeKey={priceMode}
              onChange={setPriceMode}
              shape="square"
            />
          </div>
          <PriceInput
            value={effectivePrice}
            disabled={priceMode === 'market'}
            onChange={setLimitPrice}
            onIncrement={() => adjustPrice(1)}
            onDecrement={() => adjustPrice(-1)}
          />
        </div>

        <QuantityInput
          value={quantity}
          disabled={activeTab === 'modify'}
          onChange={setQuantity}
          onRatio={handleRatio}
          ratioDisabled={ratioDisabled}
          maxQuantity={maxQuantity > 0 ? maxQuantity : null}
          maxLabel={activeTab === 'sell' ? '보유' : '최대'}
        />

        <div className="space-y-1.5 border-t border-wefin-line pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-wefin-subtle">
              {activeTab === 'sell' ? '보유 수량' : '구매가능 금액'}
            </span>
            <span className="font-semibold text-wefin-text">
              {activeTab === 'sell'
                ? `${(holdingQuantity ?? 0).toLocaleString()}주`
                : `${formatAmount(accountState.balance)}원`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-wefin-subtle">
              {activeTab === 'sell' ? '예상 수령 금액' : '총 주문 금액'}
            </span>
            <span className="font-semibold text-wefin-text">
              {Math.trunc(totalAmount).toLocaleString()}원
            </span>
          </div>
        </div>

        {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || priceMode === 'limit'}
          className={`w-full rounded-md py-2.5 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${getSubmitColor(activeTab)}`}
        >
          {getSubmitLabel(activeTab, isPending)}
        </button>
      </div>
    </div>
  )
}
