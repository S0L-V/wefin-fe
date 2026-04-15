import { useBriefingQuery } from '../model/use-briefing-query'

interface MarketBriefingProps {
  roomId: string
}

function MarketBriefing({ roomId }: MarketBriefingProps) {
  const { data, isFetching, isError } = useBriefingQuery(roomId)

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-wefin-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wefin-mint">
          <span className="text-[10px] font-bold text-white">위핀</span>
        </div>
        <h3 className="text-sm font-bold text-wefin-text">위핀 시장 동향 브리핑</h3>
        {!isFetching && data?.targetDate && (
          <span className="ml-auto text-[11px] text-wefin-subtle">{data.targetDate}</span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {isFetching && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-wefin-subtle">브리핑 생성 중…</p>
          </div>
        )}

        {!isFetching && isError && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-wefin-subtle">브리핑을 불러오지 못했습니다</p>
          </div>
        )}

        {!isFetching && data && (
          <div className="space-y-4 text-xs leading-relaxed text-wefin-text">
            <div>
              <h4 className="mb-1 font-bold text-wefin-mint">시장 개요</h4>
              <p className="whitespace-pre-wrap break-words">{data.marketOverview}</p>
            </div>
            <div>
              <h4 className="mb-1 font-bold text-wefin-mint">주요 이슈</h4>
              <p className="whitespace-pre-wrap break-words">{data.keyIssues}</p>
            </div>
            <div>
              <h4 className="mb-1 font-bold text-wefin-mint">투자 힌트</h4>
              <p className="whitespace-pre-wrap break-words">{data.investmentHint}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default MarketBriefing
