import { Minus, Plus } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'

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
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingDigitsBeforeCaret = useRef<number | null>(null)

  // 콤마 포맷 후 caret이 끝으로 튀는 문제 보정 — 입력 직전 caret 앞 숫자 개수 기준으로 위치 복원
  useLayoutEffect(() => {
    const input = inputRef.current
    const target = pendingDigitsBeforeCaret.current
    pendingDigitsBeforeCaret.current = null
    if (!input || target === null) return
    const formatted = input.value
    let count = 0
    let pos = 0
    for (let i = 0; i < formatted.length; i++) {
      if (count >= target) break
      if (/\d/.test(formatted[i])) count++
      pos = i + 1
    }
    input.setSelectionRange(pos, pos)
  })

  return (
    <div
      className={`flex items-center rounded-md border-[1.5px] border-wefin-line ${
        disabled ? 'bg-wefin-bg' : 'bg-white'
      }`}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={value ? value.toLocaleString() : ''}
        onChange={(e) => {
          const caret = e.target.selectionStart ?? e.target.value.length
          const digitsBefore = e.target.value.substring(0, caret).replace(/[^\d]/g, '').length
          pendingDigitsBeforeCaret.current = digitsBefore
          const digits = e.target.value.replace(/[^\d]/g, '')
          onChange(digits ? Number(digits) : 0)
        }}
        disabled={disabled}
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-right text-sm font-medium tabular-nums text-wefin-text outline-none disabled:cursor-not-allowed"
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
