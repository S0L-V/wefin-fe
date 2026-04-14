import { useNavigate, useParams } from 'react-router-dom'

import { useCurrentTurnQuery } from '@/features/game-room/model/use-current-turn-query'
import { useGameRoomDetailQuery } from '@/features/game-room/model/use-game-room-query'
import { useLeaveRoomGuard } from '@/features/game-room/model/use-leave-room-guard'
import { usePortfolioQuery } from '@/features/game-room/model/use-portfolio-query'
import { useTurnAdvanceMutation } from '@/features/game-room/model/use-turn-advance-mutation'
import { useTurnChangeSocket } from '@/features/game-room/model/use-turn-change-socket'
import GroupChat from '@/features/game-room/ui/group-chat'
import GroupRanking from '@/features/game-room/ui/group-ranking'
import HoldingsPanel from '@/features/game-room/ui/holdings-panel'
import LeaveRoomDialog from '@/features/game-room/ui/leave-room-dialog'
import MarketBriefing from '@/features/game-room/ui/market-briefing'
import OrderPanel from '@/features/game-room/ui/order-panel'
import PlayHeader from '@/features/game-room/ui/play-header'
import StockChart from '@/features/game-room/ui/stock-chart'

function PlayPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const guard = useLeaveRoomGuard(roomId ?? '')
  const { data: roomDetail } = useGameRoomDetailQuery(roomId ?? '')
  const { data: portfolio } = usePortfolioQuery(roomId ?? '')
  const { data: currentTurn } = useCurrentTurnQuery(roomId ?? '')
  const turnAdvance = useTurnAdvanceMutation(roomId ?? '')
  useTurnChangeSocket(roomId ?? '')

  if (!roomId) {
    return <div className="py-20 text-center text-wefin-subtle">잘못된 접근입니다</div>
  }

  const seed = portfolio?.data.seedMoney ?? roomDetail?.data.seed ?? 0
  const currentDate = currentTurn?.turnDate ?? roomDetail?.data.startDate ?? '2023-10-19'
  const currentRound = currentTurn?.turnNumber ?? 1
  const totalAssets = portfolio?.data.totalAsset ?? seed
  const profitRate = portfolio?.data.profitRate ?? 0
  const cash = portfolio?.data.cash ?? seed

  return (
    <>
      {/* 부모 main의 max-width/padding을 뚫고 화면 가득 차는 레이아웃 */}
      <div className="relative left-1/2 -ml-[50vw] -mt-6 w-screen">
        <PlayHeader
          currentRound={currentRound}
          currentDate={currentDate}
          seed={seed}
          totalAssets={totalAssets}
          profitRate={profitRate}
          isAdvancing={turnAdvance.isPending}
          onNextTurn={() => turnAdvance.mutate()}
          onLeave={() => guard.requestLeave('/history')}
          onEndGame={() => navigate(`/history/room/${roomId}/result`)}
        />

        <div className="mx-auto flex max-w-[1400px] items-stretch gap-4 p-4">
          <aside className="flex w-80 flex-col gap-4">
            <MarketBriefing roomId={roomId} />
            <HoldingsPanel roomId={roomId} />
          </aside>

          <main className="flex min-w-0 flex-1 flex-col gap-4">
            <StockChart roomId={roomId} />
            <OrderPanel roomId={roomId} cash={cash} />
          </main>

          <aside className="flex w-80 flex-col gap-4">
            <GroupChat />
            <GroupRanking />
          </aside>
        </div>
      </div>

      <LeaveRoomDialog
        open={guard.showDialog}
        onConfirm={guard.confirmLeave}
        onCancel={guard.cancelLeave}
        isLeaving={guard.isLeaving}
      />
    </>
  )
}

export default PlayPage
