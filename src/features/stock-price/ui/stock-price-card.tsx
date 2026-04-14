import { Link } from 'react-router-dom'

import { routes } from '@/shared/config/routes'

import { useStockPriceQuery } from '../model/use-stock-price-query'

type Props = {
  code: string
  name: string
}

export default function StockPriceCard({ code, name }: Props) {
  const { data, isLoading, isError } = useStockPriceQuery(code)

  return (
    <Link
      to={routes.stockDetail(code)}
      className="flex cursor-pointer flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-[#3db9b9]/50"
    >
      <span className="font-bold text-gray-900">{name}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-gray-500">
          {isLoading && '···'}
          {isError && code}
          {data && !isLoading && !isError && formatPrice(data.currentPrice)}
        </span>
        {data && !isLoading && !isError && <ChangeBadge changeRate={data.changeRate} />}
      </div>
    </Link>
  )
}

function ChangeBadge({ changeRate }: { changeRate: number }) {
  const isUp = changeRate > 0
  const isDown = changeRate < 0
  const colorClass = isUp
    ? 'bg-red-50 text-red-500'
    : isDown
      ? 'bg-blue-50 text-blue-500'
      : 'bg-gray-50 text-gray-500'
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
