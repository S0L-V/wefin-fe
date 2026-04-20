import { Check, ChevronDown, Heart, Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'
import { useSectorInterestsQuery } from '@/features/sector-interest/model/use-sector-interest-queries'
import { useWatchlistQuery } from '@/features/watchlist/model/use-watchlist-queries'

import type { PopularTag } from '../api/fetch-popular-tags'
import InterestsModal from './interests-modal'

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
  const [interestsModalOpen, setInterestsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const tabContainerRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tabContainerRef.current || !indicatorRef.current) return
    const activeBtn = tabContainerRef.current.querySelector<HTMLElement>('[data-active="true"]')
    if (activeBtn) {
      const containerRect = tabContainerRef.current.getBoundingClientRect()
      const btnRect = activeBtn.getBoundingClientRect()
      indicatorRef.current.style.width = `${btnRect.width}px`
      indicatorRef.current.style.transform = `translateX(${btnRect.left - containerRect.left}px)`
    }
  }, [mode])

  const userId = useAuthUserId()
  const { data: watchlist = [] } = useWatchlistQuery()
  const { data: sectorInterests = [] } = useSectorInterestsQuery()
  const hasAnyInterest = watchlist.length > 0 || sectorInterests.length > 0

  // 관심사가 없어도 빈 상태에서 편집 버튼을 띄우려면 하트를 눌러 켤 수 있어야 한다.
  // 실제 필터 적용은 interestFilterApplied(태그 일치)로, 단순 토글 상태는 emptyHeartOn으로 분리
  const [emptyHeartOn, setEmptyHeartOn] = useState(false)

  const interestTagsForMode: PopularTag[] =
    mode === 'SECTOR'
      ? sectorInterests.map((s) => ({ code: s.code, name: s.name, clusterCount: 0 }))
      : mode === 'STOCK'
        ? watchlist.map((w) => ({
            code: w.stockCode,
            name: w.stockName || w.stockCode,
            clusterCount: 0
          }))
        : []
  const interestFilterApplied =
    mode !== 'ALL' &&
    interestTagsForMode.length > 0 &&
    selectedTags.length === interestTagsForMode.length &&
    selectedTags.every((t) => interestTagsForMode.some((i) => i.code === t.code))
  // 하트/편집 토글 상태: 실제 필터가 적용됐거나, 현재 모드에 관심사가 없어 빈 상태로 눌린 경우
  const interestModeActive =
    interestFilterApplied || (interestTagsForMode.length === 0 && emptyHeartOn)

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

  function openDropdown() {
    setDropdownOpen(true)
    setSearch('')
    setTimeout(() => searchRef.current?.focus(), 0)
  }

  function handleInterestFilterClick() {
    if (interestModeActive) {
      onTagsChange([])
      setEmptyHeartOn(false)
      return
    }
    // 현재 모드에 등록된 관심사가 있으면 그 타입 태그를 적용. 없으면(ALL 포함) 타입을 바꾸지 않고 편집 버튼만 띄우는 빈 토글
    if (interestTagsForMode.length > 0) {
      onTagsChange(interestTagsForMode)
      return
    }
    setEmptyHeartOn(true)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-base font-bold text-wefin-text">뉴스</span>

      <div
        ref={tabContainerRef}
        className="relative flex items-center gap-0.5 rounded-xl bg-wefin-mint-soft p-1"
      >
        <div
          ref={indicatorRef}
          className="absolute top-1 left-0 h-[calc(100%-8px)] rounded-lg bg-wefin-surface shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-300"
        />
        {MODE_TABS.map((tab) => (
          <button
            key={tab.value}
            data-active={mode === tab.value}
            onClick={() => handleModeChange(tab.value)}
            className={`relative z-10 cursor-pointer rounded-lg px-4 py-1.5 text-[13px] font-medium transition-colors ${
              mode === tab.value
                ? 'font-semibold text-wefin-mint-deep'
                : 'text-wefin-subtle hover:text-wefin-mint-deep'
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
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-wefin-mint bg-wefin-surface px-4 py-1.5 text-[13px] font-medium text-wefin-text transition-colors hover:bg-wefin-mint-soft"
          >
            {dropdownLabel}
            <ChevronDown
              className={`h-3.5 w-3.5 text-wefin-mint transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-xl border border-wefin-line bg-wefin-surface py-1 shadow-lg">
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

      {userId && mode !== 'ALL' && (
        <>
          <button
            type="button"
            onClick={() => {
              if (interestModeActive) {
                handleInterestFilterClick()
              } else if (hasAnyInterest) {
                handleInterestFilterClick()
              } else {
                setInterestsModalOpen(true)
              }
            }}
            aria-pressed={interestModeActive}
            aria-label="내 관심사로 필터"
            className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors ${
              interestModeActive
                ? 'border-wefin-mint-deep/30 bg-wefin-mint-soft text-wefin-mint-deep'
                : 'border-wefin-line bg-wefin-surface text-wefin-subtle hover:border-wefin-mint-deep/20 hover:text-wefin-mint-deep'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${interestModeActive ? 'fill-current' : ''}`} />
            {interestModeActive ? '내 관심' : '관심'}
          </button>
          {interestModeActive && (
            <button
              type="button"
              onClick={() => setInterestsModalOpen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-wefin-subtle transition-colors hover:bg-wefin-bg hover:text-wefin-text"
              aria-label="관심 목록 편집"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          )}
          <InterestsModal open={interestsModalOpen} onClose={() => setInterestsModalOpen(false)} />
        </>
      )}
    </div>
  )
}
