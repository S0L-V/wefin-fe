import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import type { StockSearchItem } from '../model/stock.schema'
import { useSelectedStockStore } from '../model/use-selected-stock-store'
import { useStockSearch } from '../model/use-stock-search'

interface StockSearchProps {
  roomId: string
}

// 입력 제약: 타이핑마다 백엔드 호출 막기 위한 디바운스 지연과 최대 키워드 길이.
// 백엔드는 종목명/종목코드만 검색하므로 50자면 충분하고, 초과 입력은 의도치 않은 과호출로 본다.
const SEARCH_DEBOUNCE_MS = 300
const MAX_KEYWORD_LENGTH = 50

function StockSearch({ roomId }: StockSearchProps) {
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { selectStock } = useSelectedStockStore()
  const { data: results, isLoading } = useStockSearch(roomId, debouncedKeyword)

  // 입력값을 300ms 디바운스해서 debouncedKeyword로 전달 → useStockSearch가 이 값으로 쿼리 실행
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(stock: StockSearchItem) {
    selectStock(stock)
    setKeyword(stock.stockName)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <label className="mb-1.5 block text-[10px] font-bold text-wefin-subtle">종목 검색</label>

      <div className="relative mb-2">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-wefin-subtle" size={14} />
        <input
          ref={inputRef}
          type="text"
          placeholder="종목명 또는 코드 입력"
          maxLength={MAX_KEYWORD_LENGTH}
          className="w-full rounded-2xl border border-wefin-line bg-wefin-bg py-2.5 pl-10 pr-4 text-xs text-wefin-text placeholder:text-wefin-subtle focus:outline-none focus:ring-2 focus:ring-wefin-mint/50"
          value={keyword}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            // maxLength가 IME 조합 중에는 우회될 수 있으므로 이중 방어
            setKeyword(e.target.value.slice(0, MAX_KEYWORD_LENGTH))
            setIsOpen(true)
          }}
        />

        {isOpen && debouncedKeyword.length >= 1 && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[240px] overflow-y-auto rounded-2xl border border-wefin-line bg-white shadow-xl"
          >
            <SearchResults results={results} isLoading={isLoading} onSelect={handleSelect} />
          </div>
        )}
      </div>
    </div>
  )
}

interface SearchResultsProps {
  results: StockSearchItem[] | undefined
  isLoading: boolean
  onSelect: (stock: StockSearchItem) => void
}

function SearchResults({ results, isLoading, onSelect }: SearchResultsProps) {
  if (isLoading) {
    return <div className="px-5 py-8 text-center text-[10px] text-wefin-subtle">검색 중...</div>
  }
  if (!results || results.length === 0) {
    return (
      <div className="px-5 py-8 text-center text-[10px] text-wefin-subtle">
        검색 결과가 없습니다
      </div>
    )
  }
  return (
    <>
      {results.map((stock) => (
        <button
          key={stock.symbol}
          type="button"
          onClick={() => onSelect(stock)}
          className="flex w-full items-center justify-between border-b border-wefin-line px-5 py-3 transition-colors last:border-0 hover:bg-wefin-bg"
        >
          <span className="text-[10px] font-medium text-wefin-subtle">{stock.symbol}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-wefin-text">{stock.stockName}</span>
            <span className="text-[10px] text-wefin-subtle">{stock.price.toLocaleString()}원</span>
          </div>
        </button>
      ))}
    </>
  )
}

export default StockSearch
