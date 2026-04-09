import { ChevronDown, Newspaper } from 'lucide-react'
import { useRef, useState } from 'react'

import type { PopularTag } from '../api/fetch-popular-tags'

export type FilterMode = 'ALL' | 'SECTOR' | 'STOCK'

interface NewsFilterBarProps {
  mode: FilterMode
  onModeChange: (mode: FilterMode) => void
  selectedTag: PopularTag | null
  onTagChange: (tag: PopularTag | null) => void
  sectorTags: PopularTag[]
  stockTags: PopularTag[]
}

const MODE_TABS: { value: FilterMode; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'SECTOR', label: '분야' },
  { value: 'STOCK', label: '종목' }
]

export default function NewsFilterBar({
  mode,
  onModeChange,
  selectedTag,
  onTagChange,
  sectorTags,
  stockTags
}: NewsFilterBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeTags = mode === 'SECTOR' ? sectorTags : mode === 'STOCK' ? stockTags : []
  const dropdownLabel = selectedTag
    ? selectedTag.name
    : mode === 'SECTOR'
      ? '분야 전체'
      : '종목 전체'

  function handleModeChange(newMode: FilterMode) {
    onModeChange(newMode)
    onTagChange(null)
    setDropdownOpen(false)
  }

  function handleTagSelect(tag: PopularTag | null) {
    onTagChange(tag)
    setDropdownOpen(false)
  }

  return (
    <div className="flex items-center gap-4">
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wefin-mint">
          <Newspaper className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-wefin-text">뉴스</span>
      </div>

      <div className="h-5 w-px bg-gray-200" />

      {/* Mode Tabs */}
      <div className="flex items-center gap-0.5 rounded-xl bg-gray-100 p-1">
        {MODE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleModeChange(tab.value)}
            className={`cursor-pointer rounded-lg px-4 py-1.5 text-[13px] font-medium transition-all ${
              mode === tab.value
                ? 'bg-white font-semibold text-wefin-text shadow-sm'
                : 'text-wefin-subtle hover:text-wefin-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tag Dropdown */}
      {mode !== 'ALL' && (
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-wefin-mint bg-white px-4 py-1.5 text-[13px] font-medium text-wefin-text transition-colors hover:bg-wefin-mint-soft"
          >
            {dropdownLabel}
            <ChevronDown
              className={`h-3.5 w-3.5 text-wefin-mint transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-xl border border-wefin-line bg-white py-1 shadow-lg">
                <DropdownItem
                  label={mode === 'SECTOR' ? '분야 전체' : '종목 전체'}
                  active={selectedTag === null}
                  onClick={() => handleTagSelect(null)}
                />
                {activeTags.map((tag) => (
                  <DropdownItem
                    key={tag.code}
                    label={tag.name}
                    active={selectedTag?.code === tag.code}
                    onClick={() => handleTagSelect(tag)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function DropdownItem({
  label,
  active,
  onClick
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full cursor-pointer px-4 py-2 text-left text-[13px] transition-colors ${
        active ? 'font-semibold text-wefin-mint' : 'text-wefin-text hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )
}
