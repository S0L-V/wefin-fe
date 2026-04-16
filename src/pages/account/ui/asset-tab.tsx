import { useAccountQuery } from '@/features/account/model/use-account-queries'
import { usePortfolioQuery } from '@/features/portfolio/model/use-portfolio-queries'

export default function AssetTab() {
  const { data: account, isLoading: accountLoading } = useAccountQuery()
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolioQuery()

  if (accountLoading || portfolioLoading) {
    return <p className="py-10 text-center text-sm text-wefin-subtle">불러오는 중...</p>
  }

  const balance = Math.trunc(account?.balance ?? 0)
  const realizedProfit = Math.trunc(account?.totalRealizedProfit ?? 0)
  const investedAmount = Math.trunc(
    (portfolio ?? []).reduce((sum, item) => sum + (item.evaluationAmount ?? 0), 0)
  )
  const totalPnL = Math.trunc(
    (portfolio ?? []).reduce((sum, item) => sum + (item.profitLoss ?? 0), 0)
  )
  const totalAsset = balance + investedAmount
  const profitColor = realizedProfit >= 0 ? 'text-red-500' : 'text-blue-600'
  const pnlColor = totalPnL >= 0 ? 'text-red-500' : 'text-blue-600'

  return (
    <div className="max-w-md divide-y divide-wefin-line">
      <div className="pb-5">
        <p className="text-sm text-wefin-subtle">총 자산</p>
        <p className="mt-1 text-3xl font-bold text-wefin-text">{totalAsset.toLocaleString()}원</p>
      </div>

      <Row title="주문 가능 금액" value={`${balance.toLocaleString()}원`} />
      <Row title="총 투자 금액" value={`${investedAmount.toLocaleString()}원`} />
      <Row
        title="평가 손익"
        value={`${totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}원`}
        valueClass={pnlColor}
      />
      <Row
        title="총 실현손익"
        value={`${realizedProfit >= 0 ? '+' : ''}${realizedProfit.toLocaleString()}원`}
        valueClass={profitColor}
      />
    </div>
  )
}

function Row({
  title,
  value,
  valueClass = 'text-wefin-text'
}: {
  title: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <span className="text-base text-wefin-subtle">{title}</span>
      <span className={`text-base font-semibold tabular-nums ${valueClass}`}>{value}</span>
    </div>
  )
}
