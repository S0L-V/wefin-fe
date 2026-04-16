import { Check, ChevronDown, Newspaper, Search, X } from 'lucide-react'
import { useRef, useState } from 'react'

import type { PopularTag } from '../api/fetch-popular-tags'

export type FilterMode = 'ALL' | 'SECTOR' | 'STOCK'

interface NewsFilterBarProps {
  mode: FilterMode
  onModeChange: (mode: FilterMode) => void
  selectedTags: PopularTag[]
  onTagsChange: (tags: PopularTag[]) => void
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
  selectedTags,
  onTagsChange,
  sectorTags,
  stockTags
}: NewsFilterBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const rawTags = mode === 'SECTOR' ? sectorTags : mode === 'STOCK' ? stockTags : []
  const allTags = rawTags.filter(
    (tag, idx, arr) => arr.findIndex((t) => t.name === tag.name) === idx
  )
  const q = search.trim().toLowerCase()
  const filteredTags = q ? allTags.filter((t) => t.name.toLowerCase().includes(q)) : allTags

  const selectedNames = selectedTags.map((t) => t.name)
  const dropdownLabel =
    selectedTags.length === 0
      ? mode === 'SECTOR'
        ? '분야 전체'
        : '종목 전체'
      : selectedTags.length === 1
        ? selectedTags[0].name
        : `${selectedTags[0].name} 외 ${selectedTags.length - 1}개`

  function handleModeChange(newMode: FilterMode) {
    onModeChange(newMode)
    onTagsChange([])
    setDropdownOpen(false)
    setSearch('')
  }

  function toggleTag(tag: PopularTag) {
    const exists = selectedTags.some((t) => t.name === tag.name)
    if (exists) {
      onTagsChange(selectedTags.filter((t) => t.name !== tag.name))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  function removeTag(tag: PopularTag) {
    onTagsChange(selectedTags.filter((t) => t.name !== tag.name))
  }

  function openDropdown() {
    setDropdownOpen(true)
    setSearch('')
    setTimeout(() => searchRef.current?.focus(), 0)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wefin-mint">
          <Newspaper className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-wefin-text">뉴스</span>
      </div>

      <div className="h-5 w-px bg-gray-200" />

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

      {mode !== 'ALL' && (
        <div className="relative">
          <button
            onClick={dropdownOpen ? () => setDropdownOpen(false) : openDropdown}
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
              <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-xl border border-wefin-line bg-white py-1 shadow-lg">
                <div className="px-3 pb-2 pt-1">
                  <div className="flex items-center gap-2 rounded-lg border border-wefin-line px-2.5 py-1.5">
                    <Search className="h-3.5 w-3.5 text-wefin-subtle" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="검색..."
                      className="w-full bg-transparent text-[13px] text-wefin-text outline-none placeholder:text-wefin-subtle"
                    />
                  </div>
                </div>

                <div className="max-h-[240px] overflow-y-auto scrollbar-thin">
                  {filteredTags.length === 0 ? (
                    <p className="px-4 py-3 text-center text-xs text-wefin-subtle">결과 없음</p>
                  ) : (
                    filteredTags.map((tag, idx) => (
                      <button
                        key={`${tag.code}-${idx}`}
                        onClick={() => toggleTag(tag)}
                        className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-[13px] transition-colors hover:bg-wefin-bg"
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            selectedNames.includes(tag.name)
                              ? 'border-wefin-mint bg-wefin-mint text-white'
                              : 'border-wefin-line'
                          }`}
                        >
                          {selectedNames.includes(tag.name) && <Check className="h-3 w-3" />}
                        </span>
                        <span
                          className={
                            selectedNames.includes(tag.name)
                              ? 'font-semibold text-wefin-mint'
                              : 'text-wefin-text'
                          }
                        >
                          {tag.name}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Selected tag chips */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedTags.map((tag) => (
            <span
              key={tag.name}
              className="inline-flex items-center gap-1 rounded-full bg-wefin-mint-soft px-2.5 py-1 text-xs font-medium text-wefin-mint"
            >
              {tag.name}
              <button
                onClick={() => removeTag(tag)}
                aria-label={`${tag.name} 필터 제거`}
                className="cursor-pointer hover:text-wefin-text"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
