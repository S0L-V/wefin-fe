import { useAccountQuery, useAssetHistoryQuery } from '@/features/account/model/use-account-queries'
import { usePortfolioQuery } from '@/features/portfolio/model/use-portfolio-queries'

export default function ProfitAnalysisTab() {
  const { data: account } = useAccountQuery()
  const { data: portfolio } = usePortfolioQuery()
  const { data: assetHistory, isLoading } = useAssetHistoryQuery()

  const realizedProfit = account?.totalRealizedProfit ?? 0
  const balance = account?.balance ?? 0
  const initialTotal = account?.initialBalance ?? 0
  const evaluationAmount = (portfolio ?? []).reduce(
    (sum, item) => sum + (item.evaluationAmount ?? 0),
    0
  )
  const currentTotal = balance + evaluationAmount
  const history = assetHistory?.history ?? []
  const diff = currentTotal - initialTotal
  const diffRate = initialTotal > 0 ? (diff / initialTotal) * 100 : 0
  const profitColor = realizedProfit >= 0 ? 'text-red-500' : 'text-blue-500'
  const diffColor = diff >= 0 ? 'text-red-500' : 'text-blue-500'

  return (
    <div className="divide-y divide-wefin-line">
      <div className="pb-4">
        <p className="text-xs text-wefin-subtle">총 실현수익</p>
        <p className={`mt-1 text-2xl font-bold ${profitColor}`}>
          {realizedProfit >= 0 ? '+' : ''}
          {realizedProfit.toLocaleString()}원
        </p>
        <div className="mt-3 flex items-baseline justify-between text-xs">
          <span className="text-wefin-subtle">
            총 자산{' '}
            <span className="font-medium text-wefin-text">{currentTotal.toLocaleString()}원</span>
          </span>
          <span className={diffColor}>
            {diff >= 0 ? '+' : ''}
            {diff.toLocaleString()}원 ({diffRate.toFixed(2)}%)
          </span>
        </div>
      </div>

      <Section title="자산 추이">
        {isLoading && <EmptyText text="불러오는 중..." />}
        {!isLoading && history.length === 0 && <EmptyText text="아직 기록이 없어요" />}
        {!isLoading && history.length > 0 && <AssetHistoryMiniTable history={history} />}
      </Section>

      <Section title="일별 실현손익">
        <EmptyText text="준비 중인 기능입니다" />
      </Section>

      <Section title="종목별 손익">
        <EmptyText text="준비 중인 기능입니다" />
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4">
      <h3 className="mb-2 text-sm font-semibold text-wefin-text">{title}</h3>
      {children}
    </div>
  )
}

function EmptyText({ text }: { text: string }) {
  return <p className="py-6 text-center text-xs text-gray-400">{text}</p>
}

function AssetHistoryMiniTable({
  history
}: {
  history: Array<{ date: string | null; totalAsset: number | null }>
}) {
  return (
    <div className="divide-y divide-wefin-line">
      {history.slice(-10).map((item, index) => (
        <div key={item.date ?? `row-${index}`} className="flex justify-between py-2 text-xs">
          <span className="text-wefin-subtle">{item.date ?? '-'}</span>
          <span className="font-medium text-wefin-text">
            {(item.totalAsset ?? 0).toLocaleString()}원
          </span>
        </div>
      ))}
    </div>
  )
}
