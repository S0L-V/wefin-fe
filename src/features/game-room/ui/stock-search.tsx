import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import StockLogo from '@/shared/ui/stock-logo'

import type { StockSearchItem } from '../model/stock.schema'
import { useSelectedStockStore } from '../model/use-selected-stock-store'
import { useStockSearch } from '../model/use-stock-search'

interface StockSearchProps {
  roomId: string
}

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
      <div className="flex items-center gap-2 rounded-lg bg-wefin-surface-2 px-3 py-2">
        <Search size={14} className="shrink-0 text-wefin-subtle" />
        <input
          ref={inputRef}
          type="text"
          placeholder="종목명 또는 코드를 검색하세요"
          maxLength={MAX_KEYWORD_LENGTH}
          className="flex-1 bg-transparent text-sm text-wefin-text outline-none placeholder:text-wefin-subtle"
          value={keyword}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setKeyword(e.target.value.slice(0, MAX_KEYWORD_LENGTH))
            setIsOpen(true)
          }}
        />
      </div>

      {isOpen && debouncedKeyword.length >= 1 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[240px] overflow-y-auto rounded-xl bg-wefin-surface p-1 shadow-lg ring-1 ring-wefin-line"
        >
          {isLoading ? (
            <p className="py-6 text-center text-xs text-wefin-subtle">검색 중...</p>
          ) : !results || results.length === 0 ? (
            <p className="py-6 text-center text-xs text-wefin-subtle">검색 결과가 없습니다</p>
          ) : (
            <ul>
              {results.map((stock) => (
                <li key={stock.symbol}>
                  <button
                    type="button"
                    onClick={() => handleSelect(stock)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-wefin-bg"
                  >
                    <StockLogo code={stock.symbol} name={stock.stockName} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-wefin-text">{stock.stockName}</p>
                      <p className="text-xs text-wefin-subtle">{stock.symbol}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-wefin-text">
                      {stock.price.toLocaleString()}원
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default StockSearch
