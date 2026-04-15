import { useNavigate, useParams } from 'react-router-dom'

import GroupChatRoom from '@/features/chat/ui/group-chat-room'
import { useCurrentTurnQuery } from '@/features/game-room/model/use-current-turn-query'
import { useGameRoomDetailQuery } from '@/features/game-room/model/use-game-room-query'
import { useGameRoomSocket } from '@/features/game-room/model/use-game-room-socket'
import { useLeaveRoomGuard } from '@/features/game-room/model/use-leave-room-guard'
import { usePortfolioQuery } from '@/features/game-room/model/use-portfolio-query'
import { useTurnChangeSocket } from '@/features/game-room/model/use-turn-change-socket'
import { useVoteMutation } from '@/features/game-room/model/use-vote-mutation'
import { useVoteSocket } from '@/features/game-room/model/use-vote-socket'
import { useVoteStore } from '@/features/game-room/model/use-vote-store'
import GroupRanking from '@/features/game-room/ui/group-ranking'
import HoldingsPanel from '@/features/game-room/ui/holdings-panel'
import LeaveRoomDialog from '@/features/game-room/ui/leave-room-dialog'
import MarketBriefing from '@/features/game-room/ui/market-briefing'
import OrderPanel from '@/features/game-room/ui/order-panel'
import PlayHeader from '@/features/game-room/ui/play-header'
import StockChart from '@/features/game-room/ui/stock-chart'
import VoteModal from '@/features/game-room/ui/vote-modal'
import { getCurrentUserId } from '@/shared/lib/get-current-user-id'

function PlayPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const guard = useLeaveRoomGuard(roomId ?? '')
  const { data: roomDetail } = useGameRoomDetailQuery(roomId ?? '')
  const { data: portfolio } = usePortfolioQuery(roomId ?? '')
  const { data: currentTurn } = useCurrentTurnQuery(roomId ?? '')
  const voteMutation = useVoteMutation(roomId ?? '')
  const markVoted = useVoteStore((s) => s.markVoted)
  const isVoting = useVoteStore((s) => s.isVoting)
  useGameRoomSocket(roomId ?? '')
  useTurnChangeSocket(roomId ?? '')
  useVoteSocket(roomId ?? '')

  if (!roomId) {
    return <div className="py-20 text-center text-wefin-subtle">잘못된 접근입니다</div>
  }

  const userId = getCurrentUserId()
  const isHost =
    roomDetail?.data.participants.some((p) => p.isLeader && p.userId === userId) ?? false

  const activePlayerCount =
    roomDetail?.data.participants.filter((p) => p.status === 'ACTIVE').length ?? 0
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
          activePlayerCount={activePlayerCount}
          isHost={isHost}
          isAdvancing={voteMutation.isPending || isVoting}
          onNextTurn={() => {
            markVoted()
            voteMutation.mutate(true)
          }}
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

          <aside className="flex w-[360px] flex-col gap-4">
            <GroupChatRoom />
            <GroupRanking roomId={roomId} />
          </aside>
        </div>
      </div>

      <VoteModal roomId={roomId} />

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
