import { TrendingUp } from 'lucide-react'

import { type OrderSide, type OrderType, useOrderForm } from '../model/use-order-form'
import StockSearch from './stock-search'

interface OrderPanelProps {
  roomId: string
  cash: number
}

function OrderPanel({ roomId, cash }: OrderPanelProps) {
  const form = useOrderForm({ roomId, cash })
  const isDisabled = !form.selectedStock || form.quantity === 0
  const sideAccent =
    form.side === 'buy' ? 'bg-red-500 shadow-red-500/20' : 'bg-blue-500 shadow-blue-500/20'
  const submitLabel = resolveSubmitLabel(form.side, form.selectedStock != null)

  return (
    <section className="rounded-3xl border border-wefin-line bg-white p-5 shadow-sm">
      <header className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wefin-mint">
          <TrendingUp size={14} className="text-white" />
        </div>
        <h3 className="text-sm font-bold text-wefin-text">주문 패널</h3>
      </header>

      <div className="space-y-4">
        <StockSearch roomId={roomId} />

        <SideTabs side={form.side} onChange={form.setSide} />
        <TypeTabs type={form.type} onChange={form.setType} />

        <QuantityControl
          quantity={form.quantity}
          maxQuantity={form.maxQuantity}
          onIncrement={form.increment}
          onDecrement={form.decrement}
          onChange={form.setQuantityRaw}
          onPercent={form.setPercent}
        />

        <SummaryRows
          type={form.type}
          currentPrice={form.currentPrice}
          quantity={form.quantity}
          totalAmount={form.totalAmount}
          cash={cash}
        />

        {form.errorMessage && (
          <div className="flex items-center justify-between rounded-xl bg-red-50 px-3 py-2">
            <span className="text-xs font-medium text-red-500">{form.errorMessage}</span>
            <button
              type="button"
              onClick={form.clearError}
              className="text-xs text-red-400 hover:text-red-600"
            >
              닫기
            </button>
          </div>
        )}

        <button
          type="button"
          disabled={isDisabled || form.isSubmitting}
          onClick={form.submit}
          className={`w-full rounded-2xl py-3.5 text-base font-bold shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
            !form.selectedStock ? 'bg-wefin-line text-wefin-subtle' : `${sideAccent} text-white`
          }`}
        >
          {form.isSubmitting ? '주문 중...' : submitLabel}
        </button>
      </div>
    </section>
  )
}

function resolveSubmitLabel(side: OrderSide, hasStock: boolean): string {
  if (!hasStock) return '종목을 선택하세요'
  return side === 'buy' ? '매수' : '매도'
}

function SideTabs({ side, onChange }: { side: OrderSide; onChange: (next: OrderSide) => void }) {
  return (
    <div className="flex rounded-2xl bg-wefin-bg p-1">
      <TabButton
        active={side === 'buy'}
        onClick={() => onChange('buy')}
        activeClass="bg-red-500 shadow-lg shadow-red-500/20"
      >
        매수
      </TabButton>
      <TabButton
        active={side === 'sell'}
        onClick={() => onChange('sell')}
        activeClass="bg-blue-500 shadow-lg shadow-blue-500/20"
      >
        매도
      </TabButton>
    </div>
  )
}

function TypeTabs({ type, onChange }: { type: OrderType; onChange: (next: OrderType) => void }) {
  return (
    <div className="flex rounded-2xl bg-wefin-bg p-1">
      <TabButton
        active={type === 'market'}
        onClick={() => onChange('market')}
        activeClass="bg-wefin-text"
        size="sm"
      >
        시장가
      </TabButton>
      <TabButton
        active={type === 'limit'}
        onClick={() => onChange('limit')}
        activeClass="bg-wefin-text"
        size="sm"
      >
        지정가
      </TabButton>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  activeClass,
  size = 'md',
  children
}: {
  active: boolean
  onClick: () => void
  activeClass: string
  size?: 'sm' | 'md'
  children: React.ReactNode
}) {
  const sizeClass = size === 'sm' ? 'py-1.5 text-[10px]' : 'py-2.5 text-xs'
  const stateClass = active ? `${activeClass} text-white` : 'text-wefin-subtle'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl font-bold transition-all ${sizeClass} ${stateClass}`}
    >
      {children}
    </button>
  )
}

interface QuantityControlProps {
  quantity: number
  maxQuantity: number
  onIncrement: () => void
  onDecrement: () => void
  onChange: (value: number) => void
  onPercent: (percent: number) => void
}

function QuantityControl({
  quantity,
  maxQuantity,
  onIncrement,
  onDecrement,
  onChange,
  onPercent
}: QuantityControlProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[10px] font-bold text-wefin-subtle">수량</label>
        <span className="text-[10px] text-wefin-subtle">최대 {maxQuantity}주</span>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <StepButton onClick={onDecrement} label="감소">
          -
        </StepButton>
        <input
          type="text"
          inputMode="numeric"
          className="flex-1 rounded-xl border border-wefin-line bg-wefin-bg py-2 text-center text-sm font-bold text-wefin-text focus:outline-none"
          value={quantity === 0 ? '' : quantity}
          placeholder="0"
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '')
            onChange(raw === '' ? 0 : parseInt(raw, 10))
          }}
        />
        <StepButton onClick={onIncrement} label="증가">
          +
        </StepButton>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {[10, 25, 50, 100].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPercent(p)}
            className="rounded-xl border border-wefin-line bg-white py-1.5 text-[10px] font-bold text-wefin-text shadow-sm transition-colors hover:bg-wefin-bg"
          >
            {p}%
          </button>
        ))}
      </div>
    </div>
  )
}

function StepButton({
  onClick,
  label,
  children
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-wefin-line bg-white font-bold text-wefin-text shadow-sm"
    >
      {children}
    </button>
  )
}

interface SummaryRowsProps {
  type: OrderType
  currentPrice: number
  quantity: number
  totalAmount: number
  cash: number
}

function SummaryRows({ type, currentPrice, quantity, totalAmount, cash }: SummaryRowsProps) {
  const priceLabel = type === 'market' ? '시장가' : `${currentPrice.toLocaleString()}원`
  return (
    <div className="space-y-1.5 border-t border-wefin-line pt-3">
      <SummaryRow label="주문 단가" value={priceLabel} />
      <SummaryRow label="주문 수량" value={`${quantity}주`} />
      <div className="flex justify-between pt-1 text-xs">
        <span className="font-bold text-wefin-text">총 주문 금액</span>
        <span className="font-bold text-wefin-text">{totalAmount.toLocaleString()}원</span>
      </div>
      <div className="flex justify-between text-[9px]">
        <span className="text-wefin-subtle">보유 현금</span>
        <span className="text-wefin-subtle">{cash.toLocaleString()}원</span>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[10px]">
      <span className="text-wefin-subtle">{label}</span>
      <span className="font-bold text-wefin-text">{value}</span>
    </div>
  )
}

export default OrderPanel
