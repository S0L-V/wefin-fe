import { TrendingUp } from 'lucide-react'

function GroupRanking() {
  return (
    <section className="flex h-[300px] flex-col rounded-3xl border border-wefin-line bg-white p-5 shadow-sm">
      <header className="mb-4 flex shrink-0 items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500">
          <TrendingUp size={14} className="text-white" />
        </div>
        <h3 className="text-sm font-bold text-wefin-text">그룹 수익률 현황</h3>
      </header>

      <div className="flex flex-1 items-center justify-center">
        <p className="text-xs text-wefin-subtle">그룹 수익률 기능 준비 중</p>
      </div>
    </section>
  )
}

export default GroupRanking
