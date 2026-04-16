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
        <span className="text-xs text-wefin-subtle">수량</span>
        {maxQuantity !== null && maxQuantity > 0 && (
          <span className="text-xs text-wefin-subtle">
            {maxLabel}{' '}
            <span className="font-medium text-wefin-text">{maxQuantity.toLocaleString()}</span>주
            {maxLabel === '최대' && ' 가능'}
          </span>
        )}
      </div>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        disabled={disabled}
        className="w-full rounded-md border border-wefin-line px-3 py-2 text-right text-sm outline-none focus:border-wefin-mint disabled:bg-wefin-bg"
      />
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
