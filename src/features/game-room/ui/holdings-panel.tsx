import { Wallet } from 'lucide-react'

interface HoldingsPanelProps {
  cash: number
  evaluationAmount: number
  evaluationProfit: number
}

function HoldingsPanel({ cash, evaluationAmount, evaluationProfit }: HoldingsPanelProps) {
  const profitColor = evaluationProfit >= 0 ? 'text-red-500' : 'text-blue-500'
  const sign = evaluationProfit >= 0 ? '+' : ''

  return (
    <section className="flex h-[380px] flex-col rounded-3xl border border-wefin-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex shrink-0 items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
          <Wallet size={14} className="text-white" />
        </div>
        <h3 className="text-sm font-bold text-wefin-text">보유 종목</h3>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        <div className="space-y-3 rounded-2xl bg-wefin-bg p-4">
          <div className="flex justify-between text-[10px] text-wefin-subtle">
            <div className="flex flex-col">
              <span>보유 현금</span>
              <span className="mt-1 text-xs font-bold text-wefin-text">
                {cash.toLocaleString()}원
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span>평가 금액</span>
              <span className="mt-1 text-xs font-bold text-wefin-text">
                {evaluationAmount.toLocaleString()}원
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-wefin-line pt-2">
            <span className="text-[10px] text-wefin-subtle">평가손익</span>
            <span className={`text-xs font-bold ${profitColor}`}>
              {sign}
              {evaluationProfit.toLocaleString()}원
            </span>
          </div>
        </div>

        <p className="py-12 text-center text-[10px] text-wefin-subtle">보유 종목이 없습니다</p>
      </div>
    </section>
  )
}

export default HoldingsPanel
