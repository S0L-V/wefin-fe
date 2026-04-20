import { type ReactNode, useEffect, useRef, useState } from 'react'

export type SegmentedTone = 'mint' | 'red' | 'blue' | 'gray'

export interface SegmentedTabItem<T extends string> {
  key: T
  label: ReactNode
  tone?: SegmentedTone
}

interface SegmentedTabsProps<T extends string> {
  items: SegmentedTabItem<T>[]
  activeKey: T
  onChange: (key: T) => void
  size?: 'sm' | 'md'
  shape?: 'pill' | 'square'
}

const SIZE_CLASSES: Record<NonNullable<SegmentedTabsProps<string>['size']>, string> = {
  sm: 'h-7 text-[11px] px-3',
  md: 'h-9 text-sm px-4'
}

const TONE_BG: Record<SegmentedTone, string> = {
  mint: 'bg-wefin-mint',
  red: 'bg-wefin-red',
  blue: 'bg-wefin-blue',
  gray: 'bg-wefin-subtle'
}

export default function SegmentedTabs<T extends string>({
  items,
  activeKey,
  onChange,
  size = 'sm',
  shape = 'pill'
}: SegmentedTabsProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<T, HTMLButtonElement>>(new Map())
  const [thumb, setThumb] = useState({ left: 0, width: 0, ready: false })

  useEffect(() => {
    const button = tabRefs.current.get(activeKey)
    const container = containerRef.current
    if (!button || !container) return
    const containerRect = container.getBoundingClientRect()
    const btnRect = button.getBoundingClientRect()
    setThumb({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
      ready: true
    })
  }, [activeKey, items])

  const sizeClass = SIZE_CLASSES[size]
  const activeItem = items.find((i) => i.key === activeKey)
  const thumbBg = TONE_BG[activeItem?.tone ?? 'mint']
  const containerRadius = shape === 'pill' ? 'rounded-full' : 'rounded-md'
  const thumbRadius = shape === 'pill' ? 'rounded-full' : 'rounded'
  const buttonRadius = shape === 'pill' ? 'rounded-full' : 'rounded'

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center bg-wefin-line/50 p-1 ${containerRadius}`}
      role="tablist"
    >
      <span
        aria-hidden
        className={`absolute top-1 bottom-1 ${thumbRadius} shadow-sm transition-all duration-200 ease-out ${thumbBg} ${
          thumb.ready ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ left: thumb.left, width: thumb.width }}
      />
      {items.map((item) => {
        const isActive = item.key === activeKey
        return (
          <button
            key={item.key}
            ref={(el) => {
              if (el) tabRefs.current.set(item.key, el)
              else tabRefs.current.delete(item.key)
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.key)}
            className={`relative z-10 inline-flex items-center justify-center font-bold leading-none transition-colors ${buttonRadius} ${sizeClass} ${
              isActive ? 'text-white' : 'text-wefin-subtle hover:text-wefin-text'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
