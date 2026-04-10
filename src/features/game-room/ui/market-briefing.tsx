import { useBriefingQuery } from '../model/use-briefing-query'

interface MarketBriefingProps {
  roomId: string
}

function MarketBriefing({ roomId }: MarketBriefingProps) {
  const { data, isLoading, isError } = useBriefingQuery(roomId)

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-wefin-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wefin-mint">
          <span className="text-[10px] font-bold text-white">위핀</span>
        </div>
        <h3 className="text-sm font-bold text-wefin-text">위핀 시장 동향 브리핑</h3>
        {data?.targetDate && (
          <span className="ml-auto text-[11px] text-wefin-subtle">{data.targetDate}</span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-wefin-subtle">브리핑 생성 중…</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-wefin-subtle">브리핑을 불러오지 못했습니다</p>
          </div>
        )}

        {data && (
          <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-wefin-text">
            {data.briefingText}
          </p>
        )}
      </div>
    </section>
  )
}

export default MarketBriefing
