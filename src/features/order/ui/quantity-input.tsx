import { Minus, Plus } from 'lucide-react'

interface QuantityInputProps {
  value: string
  disabled: boolean
  onChange: (v: string) => void
  onRatio: (ratio: number) => void
  ratioDisabled: boolean
  maxQuantity: number | null
  maxLabel?: '최대' | '보유'
}

const RATIO_OPTIONS = [
  { label: '10%', ratio: 0.1 },
  { label: '25%', ratio: 0.25 },
  { label: '50%', ratio: 0.5 },
  { label: '최대', ratio: 1 }
] as const

export default function QuantityInput({
  value,
  disabled,
  onChange,
  onRatio,
  ratioDisabled,
  maxQuantity,
  maxLabel = '최대'
}: QuantityInputProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-wefin-text">수량</span>
        {maxQuantity !== null && maxQuantity > 0 && (
          <span className="text-xs text-wefin-subtle">
            {maxLabel}{' '}
            <span className="font-medium text-wefin-text">{maxQuantity.toLocaleString()}</span>주
            {maxLabel === '최대' && ' 가능'}
          </span>
        )}
      </div>
      <div
        className={`flex items-center rounded-md border-[1.5px] border-wefin-line ${
          disabled ? 'bg-wefin-bg' : 'bg-white'
        }`}
      >
        <input
          type="text"
          inputMode="numeric"
          value={value ? Number(value).toLocaleString() : ''}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, '')
            onChange(digits)
          }}
          placeholder="0"
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-right text-sm font-medium tabular-nums text-wefin-text outline-none disabled:cursor-not-allowed"
        />
        <span className="pr-2 text-xs text-wefin-subtle">주</span>
        <button
          type="button"
          onClick={() => {
            const n = Number(value || 0)
            const next = Math.max(0, n - 1)
            onChange(String(next))
          }}
          disabled={disabled}
          className="flex h-8 w-8 items-center justify-center text-wefin-subtle transition-colors hover:text-wefin-text disabled:opacity-30"
          aria-label="수량 감소"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            const n = Number(value || 0)
            const next = maxQuantity !== null ? Math.min(maxQuantity, n + 1) : n + 1
            onChange(String(next))
          }}
          disabled={disabled}
          className="flex h-8 w-8 items-center justify-center text-wefin-subtle transition-colors hover:text-wefin-text disabled:opacity-30"
          aria-label="수량 증가"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {RATIO_OPTIONS.map(({ label, ratio }) => (
          <button
            key={label}
            type="button"
            disabled={ratioDisabled}
            onClick={() => onRatio(ratio)}
            className="rounded-md border border-wefin-line py-1.5 text-xs text-wefin-subtle transition-colors hover:bg-wefin-bg disabled:opacity-50"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
