import { useState } from 'react'

import SegmentedTabs, { type SegmentedTabItem } from '@/shared/ui/segmented-tabs'

import type { OrderHistoryResponse } from '../api/fetch-order'
import {
  formatAmount,
  getSubmitColor,
  getSubmitLabel,
  type OrderTab,
  type PriceMode,
  priceTick,
  resolveErrorMessage
} from '../lib/order-form-utils'
import {
  useBuyMutation,
  useCancelOrderMutation,
  useLimitBuyMutation,
  useLimitSellMutation,
  useModifyOrderMutation,
  useSellMutation
} from '../model/use-order-mutations'
import { usePendingOrdersQuery } from '../model/use-order-queries'
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

  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryResponse | null>(null)

  const buyMutation = useBuyMutation()
  const sellMutation = useSellMutation()
  const limitBuyMutation = useLimitBuyMutation()
  const limitSellMutation = useLimitSellMutation()
  const modifyMutation = useModifyOrderMutation()
  const cancelMutation = useCancelOrderMutation()
  const { data: pendingOrders } = usePendingOrdersQuery()

  const stockPendingOrders = (pendingOrders ?? []).filter((o) => o.stockCode === stockCode)

  const effectiveLimitPrice = limitPrice > 0 ? limitPrice : currentPrice
  const effectivePrice = priceMode === 'market' ? currentPrice : effectiveLimitPrice
  const qtyNumber = Number(quantity || 0)
  const totalAmount = qtyNumber * effectivePrice
  const activeMutation =
    activeTab === 'modify'
      ? modifyMutation
      : priceMode === 'limit'
        ? activeTab === 'buy'
          ? limitBuyMutation
          : limitSellMutation
        : activeTab === 'buy'
          ? buyMutation
          : sellMutation
  const isPending =
    buyMutation.isPending ||
    sellMutation.isPending ||
    limitBuyMutation.isPending ||
    limitSellMutation.isPending ||
    modifyMutation.isPending ||
    cancelMutation.isPending
  const canSubmit =
    activeTab === 'modify'
      ? !!selectedOrder && qtyNumber >= 1 && !isPending
      : qtyNumber >= 1 && !isPending
  const maxQuantity =
    activeTab === 'buy'
      ? (accountState.maxQuantity ?? 0)
      : activeTab === 'sell'
        ? (holdingQuantity ?? 0)
        : 0
  const ratioDisabled = activeTab === 'modify' || maxQuantity <= 0

  const handleSelectOrder = (order: OrderHistoryResponse) => {
    setSelectedOrder(order)
    setLimitPrice(order.requestPrice ?? currentPrice)
    setQuantity(String(order.quantity))
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    if (activeTab === 'modify' && selectedOrder) {
      modifyMutation.mutate(
        { orderNo: selectedOrder.orderNo, requestPrice: effectiveLimitPrice, quantity: qtyNumber },
        {
          onSuccess: () => {
            setSelectedOrder(null)
            setQuantity('')
          }
        }
      )
    } else if (priceMode === 'limit') {
      const mutation = activeTab === 'buy' ? limitBuyMutation : limitSellMutation
      mutation.mutate(
        { stockCode, quantity: qtyNumber, requestPrice: effectiveLimitPrice },
        { onSuccess: () => setQuantity('') }
      )
    } else {
      const mutation = activeTab === 'buy' ? buyMutation : sellMutation
      mutation.mutate({ stockCode, quantity: qtyNumber }, { onSuccess: () => setQuantity('') })
    }
  }

  const handleCancel = () => {
    if (!selectedOrder || cancelMutation.isPending) return
    cancelMutation.mutate(selectedOrder.orderNo, {
      onSuccess: () => {
        setSelectedOrder(null)
        setQuantity('')
      }
    })
  }

  const handleRatio = (ratio: number) => {
    if (ratioDisabled) return
    setQuantity(String(Math.max(1, Math.floor(maxQuantity * ratio))))
  }

  const adjustPrice = (dir: 1 | -1) => {
    if (activeTab !== 'modify' && priceMode !== 'limit') return
    const tick = priceTick(limitPrice || currentPrice)
    setLimitPrice((p) => Math.max(0, (p || currentPrice) + dir * tick))
  }

  const errorMessage = resolveErrorMessage(activeMutation.error)

  if (activeTab === 'modify') {
    return (
      <div>
        <div className="flex h-11 items-center justify-between px-3">
          <span className="text-sm font-semibold text-wefin-text">주문하기</span>
          <SegmentedTabs
            items={ORDER_TABS}
            activeKey={activeTab}
            onChange={setActiveTab}
            shape="square"
          />
        </div>
        <div className="space-y-3 p-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-wefin-text">미체결 주문</span>
            {stockPendingOrders.length === 0 ? (
              <p className="py-4 text-center text-xs text-wefin-subtle">미체결 주문이 없습니다</p>
            ) : (
              <ul className="max-h-32 space-y-1 overflow-y-auto">
                {stockPendingOrders.map((order) => (
                  <li key={order.orderNo}>
                    <button
                      type="button"
                      onClick={() => handleSelectOrder(order)}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors ${
                        selectedOrder?.orderNo === order.orderNo
                          ? 'bg-wefin-mint-soft ring-1 ring-wefin-mint'
                          : 'bg-wefin-bg hover:bg-wefin-line/60'
                      }`}
                    >
                      <span
                        className={`font-semibold ${order.side === 'BUY' ? 'text-red-500' : 'text-blue-500'}`}
                      >
                        {order.side === 'BUY' ? '매수' : '매도'}
                      </span>
                      <span className="tabular-nums text-wefin-text">
                        {(order.requestPrice ?? 0).toLocaleString()}원
                      </span>
                      <span className="tabular-nums text-wefin-subtle">
                        {order.quantity.toLocaleString()}주
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedOrder && (
            <>
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-wefin-text">정정 가격</span>
                <PriceInput
                  value={effectiveLimitPrice}
                  disabled={false}
                  onChange={setLimitPrice}
                  onIncrement={() => adjustPrice(1)}
                  onDecrement={() => adjustPrice(-1)}
                />
              </div>
              <QuantityInput
                value={quantity}
                disabled={false}
                onChange={setQuantity}
                onRatio={() => {}}
                ratioDisabled={true}
                maxQuantity={null}
                maxLabel="최대"
              />
              {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full rounded-md bg-wefin-text py-2.5 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {modifyMutation.isPending ? '정정 중...' : '정정하기'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                className="w-full rounded-md border border-wefin-line py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelMutation.isPending ? '취소 중...' : '주문 취소'}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex h-11 items-center justify-between px-3">
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
            <span className="text-xs font-bold text-wefin-text">
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
          disabled={false}
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
          disabled={!canSubmit}
          className={`w-full rounded-md py-2.5 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${getSubmitColor(activeTab)}`}
        >
          {getSubmitLabel(activeTab, isPending)}
        </button>
      </div>
    </div>
  )
}
