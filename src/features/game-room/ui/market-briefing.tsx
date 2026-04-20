import { useBriefingQuery } from '../model/use-briefing-query'

interface MarketBriefingProps {
  roomId: string
}

function MarketBriefing({ roomId }: MarketBriefingProps) {
  const { data, isFetching, isError } = useBriefingQuery(roomId)

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex h-11 shrink-0 items-center justify-between px-3">
        <span className="text-sm font-semibold text-wefin-text">시장 브리핑</span>
        {!isFetching && data?.targetDate && (
          <span className="text-xs text-wefin-subtle">{data.targetDate}</span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-3">
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
