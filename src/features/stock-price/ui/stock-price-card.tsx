import { Link } from 'react-router-dom'

import { useStockPriceQuery } from '@/features/stock-detail/model/use-stock-detail-queries'
import { routes } from '@/shared/config/routes'

type Props = {
  code: string
  name: string
}

/**
 * 뉴스 상세 "AI 추천 관련 종목" 등에서 사용하는 종목 시세 프리뷰 카드.
 *
 * 캐시는 stock-detail의 useStockPriceQuery(`['stocks', code, 'price']`)를 재사용하므로
 * 종목 상세 페이지 및 WS 업데이트와 동일한 가격이 노출된다.
 */
export default function StockPriceCard({ code, name }: Props) {
  const { data, isLoading, isError } = useStockPriceQuery(code)

  return (
    <Link
      to={routes.stockDetail(code)}
      className="flex cursor-pointer flex-col gap-1 rounded-xl border border-wefin-line bg-wefin-surface p-4 transition-colors hover:border-[#3db9b9]/50"
    >
      <span className="font-bold text-wefin-text">{name}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-wefin-subtle">
          {data ? formatPrice(data.currentPrice) : isLoading ? '···' : isError ? '조회 실패' : '—'}
        </span>
        {data && <ChangeBadge changeRate={data.changeRate} />}
      </div>
    </Link>
  )
}

function ChangeBadge({ changeRate }: { changeRate: number }) {
  const isUp = changeRate > 0
  const isDown = changeRate < 0
  const colorClass = isUp
    ? 'bg-wefin-red-soft text-wefin-red'
    : isDown
      ? 'bg-wefin-surface-2 text-wefin-blue'
      : 'bg-wefin-bg text-wefin-subtle'
  const sign = isUp ? '+' : ''
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${colorClass}`}>
      {sign}
      {changeRate.toFixed(2)}%
    </span>
  )
}

function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`
}
