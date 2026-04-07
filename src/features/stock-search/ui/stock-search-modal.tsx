import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useStockSearchQuery } from '@/features/stock-search/model/use-stock-search-query'
import { routes } from '@/shared/config/routes'

interface StockSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function StockSearchModal({ isOpen, onClose }: StockSearchModalProps) {
  const [keyword, setKeyword] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { data: results = [], isLoading, isError } = useStockSearchQuery(keyword)

  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [isOpen])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setKeyword('')
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleClose() {
    setKeyword('')
    onClose()
  }

  function handleSelect(stockCode: string) {
    handleClose()
    navigate(routes.stockDetail(stockCode))
  }

  const trimmed = keyword.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

      {/* 모달 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="종목 검색"
        className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl"
      >
        {/* 검색 입력 */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="종목명, 코드, 분야를 검색하세요"
            className="flex-1 text-sm outline-none placeholder:text-gray-400"
          />
          <button
            onClick={handleClose}
            aria-label="검색 닫기"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 검색 결과 */}
        <div className="max-h-96 overflow-y-auto p-2">
          {trimmed.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-gray-400">
              종목명 또는 코드를 입력하세요
            </p>
          ) : isLoading ? (
            <p className="px-3 py-8 text-center text-sm text-gray-400">검색 중...</p>
          ) : isError ? (
            <p className="px-3 py-8 text-center text-sm text-red-500">
              검색 중 오류가 발생했습니다
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-gray-400">검색 결과가 없습니다</p>
          ) : (
            <ul>
              {results.map((stock) => (
                <li key={stock.stockCode}>
                  <button
                    onClick={() => handleSelect(stock.stockCode)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                      {stock.stockName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{stock.stockName}</p>
                      <p className="text-xs text-gray-400">{stock.stockCode}</p>
                    </div>
                    {stock.sector && <span className="text-xs text-gray-400">{stock.sector}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
