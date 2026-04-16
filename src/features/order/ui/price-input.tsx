import { Minus, Plus } from 'lucide-react'

interface PriceInputProps {
  value: number
  disabled: boolean
  onChange: (v: number) => void
  onIncrement: () => void
  onDecrement: () => void
}

export default function PriceInput({
  value,
  disabled,
  onChange,
  onIncrement,
  onDecrement
}: PriceInputProps) {
  return (
    <div
      className={`flex items-center rounded-md border border-wefin-line ${
        disabled ? 'bg-wefin-bg' : 'bg-white'
      }`}
    >
      <input
        type="number"
        min="0"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-right text-sm font-medium text-wefin-text outline-none disabled:cursor-not-allowed"
      />
      <span className="pr-2 text-xs text-wefin-subtle">원</span>
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled}
        className="flex h-8 w-8 items-center justify-center text-wefin-subtle transition-colors hover:text-wefin-text disabled:opacity-30"
        aria-label="가격 감소"
      >
        <Minus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled}
        className="flex h-8 w-8 items-center justify-center text-wefin-subtle transition-colors hover:text-wefin-text disabled:opacity-30"
        aria-label="가격 증가"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
