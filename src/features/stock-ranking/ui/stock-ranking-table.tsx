import { Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { routes } from '@/shared/config/routes'

type RankingTab = 'volume' | 'amount' | 'rising' | 'falling'

const TABS: { key: RankingTab; label: string }[] = [
  { key: 'volume', label: '거래량 TOP' },
  { key: 'amount', label: '거래대금 TOP' },
  { key: 'rising', label: '급등' },
  { key: 'falling', label: '급락' }
]

// TODO: 거래 랭킹 API 연동 시 탭별 데이터 소스 분리
const MOCK_DATA = [
  { rank: 1, name: '삼성전자', code: '005930', price: 97500, changeRate: 1.2, volume: 13168563 },
  { rank: 2, name: 'SK하이닉스', code: '000660', price: 285000, changeRate: -0.3, volume: 5672343 },
  { rank: 3, name: '카카오', code: '035720', price: 62300, changeRate: 3.5, volume: 4123406 },
  { rank: 4, name: 'NAVER', code: '035420', price: 185000, changeRate: 0.8, volume: 3238987 },
  { rank: 5, name: '현대차', code: '005380', price: 245000, changeRate: -2.1, volume: 2109836 },
  {
    rank: 6,
    name: 'LG에너지솔루션',
    code: '373220',
    price: 412000,
    changeRate: -1.5,
    volume: 1987654
  },
  { rank: 7, name: '삼성SDI', code: '006400', price: 399500, changeRate: -0.7, volume: 1876563 },
  { rank: 8, name: '셀트리온', code: '068270', price: 178000, changeRate: 1.5, volume: 1765432 },
  { rank: 9, name: '기아', code: '000270', price: 115000, changeRate: 0.5, volume: 1654323 },
  {
    rank: 10,
    name: 'POSCO홀딩스',
    code: '005490',
    price: 435000,
    changeRate: -1.2,
    volume: 1543218
  }
]

interface StockRankingTableProps {
  onSearchClick: () => void
}

export default function StockRankingTable({ onSearchClick }: StockRankingTableProps) {
  const [activeTab, setActiveTab] = useState<RankingTab>('volume')

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900">실시간 거래 랭킹</h2>
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onSearchClick}
          className="flex w-72 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400 transition-colors hover:border-gray-300"
        >
          <Search className="h-4 w-4" />
          종목명, 코드, 분야를 검색하세요
        </button>
      </div>

      {/* 테이블 */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-400">
            <th className="pb-2 font-medium">순위</th>
            <th className="pb-2 font-medium">종목</th>
            <th className="pb-2 text-right font-medium">현재가</th>
            <th className="pb-2 text-right font-medium">전일비</th>
            <th className="pb-2 text-right font-medium">거래량</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_DATA.map((stock) => (
            <tr
              key={stock.code}
              className="border-b border-gray-100 transition-colors hover:bg-gray-50"
            >
              <td className="py-3 font-medium text-gray-900">{stock.rank}</td>
              <td className="py-3">
                <Link
                  to={routes.stockDetail(stock.code)}
                  className="font-medium text-gray-900 hover:underline"
                >
                  {stock.name}
                </Link>
                <span className="ml-2 text-xs text-gray-400">{stock.code}</span>
              </td>
              <td className="py-3 text-right font-medium text-gray-900">
                {stock.price.toLocaleString()}
              </td>
              <td
                className={`py-3 text-right font-medium ${
                  stock.changeRate > 0
                    ? 'text-red-500'
                    : stock.changeRate < 0
                      ? 'text-blue-500'
                      : 'text-gray-500'
                }`}
              >
                {stock.changeRate > 0 ? '▲' : stock.changeRate < 0 ? '▼' : ''}
                {Math.abs(stock.changeRate)}%
              </td>
              <td className="py-3 text-right text-gray-500">{stock.volume.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
