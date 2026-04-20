import WefinLogoIcon from '@/shared/ui/wefin-logo-icon'

import { useBriefingQuery } from '../model/use-briefing-query'

interface MarketBriefingProps {
  roomId: string
}

function MarketBriefing({ roomId }: MarketBriefingProps) {
  const { data, isFetching, isError } = useBriefingQuery(roomId)

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex h-11 shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-1.5">
          <WefinLogoIcon size={14} className="text-wefin-mint" />
          <span className="text-sm font-bold text-wefin-text">시장 브리핑</span>
        </div>
        {!isFetching && data?.targetDate && (
          <span className="text-sm font-semibold tabular-nums text-wefin-text-2">
            {data.targetDate.replaceAll('-', '.')}
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-thin px-4 pb-4">
        {isFetching && (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2">
              <WefinLogoIcon
                size={14}
                className="animate-[spinPause_2s_ease-in-out_infinite] text-wefin-mint"
              />
              <p className="text-xs text-wefin-subtle">브리핑 생성 중...</p>
            </div>
          </div>
        )}

        {!isFetching && isError && !data && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-wefin-subtle">브리핑을 불러오지 못했습니다</p>
          </div>
        )}

        {!isFetching && data && (
          <div className="space-y-5 text-sm leading-relaxed text-wefin-text">
            <div>
              <h4 className="mb-2 text-[13px] font-extrabold text-wefin-mint-deep">시장 개요</h4>
              <p className="whitespace-pre-wrap break-words font-medium text-wefin-text-2">
                {data.marketOverview}
              </p>
            </div>
            <div>
              <h4 className="mb-2 text-[13px] font-extrabold text-wefin-mint-deep">주요 이슈</h4>
              <div className="whitespace-pre-wrap break-words font-medium text-wefin-text-2">
                {data.keyIssues}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-[13px] font-extrabold text-wefin-mint-deep">투자 힌트</h4>
              <p className="whitespace-pre-wrap break-words font-medium text-wefin-text-2">
                {data.investmentHint}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default MarketBriefing
