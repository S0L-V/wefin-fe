import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import GroupChatRoom from '@/features/chat/ui/group-chat-room'
import { useCurrentTurnQuery } from '@/features/game-room/model/use-current-turn-query'
import { useEndGameMutation } from '@/features/game-room/model/use-end-game-mutation'
import { useGameFinishedStore } from '@/features/game-room/model/use-game-finished-store'
import { useGameRoomDetailQuery } from '@/features/game-room/model/use-game-room-query'
import { useGameRoomSocket } from '@/features/game-room/model/use-game-room-socket'
import { useLeaveRoomGuard } from '@/features/game-room/model/use-leave-room-guard'
import { usePortfolioQuery } from '@/features/game-room/model/use-portfolio-query'
import {
  type RankChange,
  useRankChangeStore
} from '@/features/game-room/model/use-rank-change-store'
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
  const endGameMutation = useEndGameMutation(roomId ?? '')
  const markVoted = useVoteStore((s) => s.markVoted)
  const isVoting = useVoteStore((s) => s.isVoting)
  const rankChanges = useRankChangeStore((s) => s.rankChanges)
  const clearRankChanges = useRankChangeStore((s) => s.clearRankChanges)
  const isGameFinished = useGameFinishedStore((s) => s.isGameFinished)
  const resetGameFinished = useGameFinishedStore((s) => s.resetGameFinished)
  useGameRoomSocket(roomId ?? '')
  useTurnChangeSocket(roomId ?? '')
  useVoteSocket(roomId ?? '')

  // 게임 종료 WebSocket 수신 시 결과 페이지로 이동
  useEffect(() => {
    if (isGameFinished && roomId) {
      resetGameFinished()
      navigate(`/history/room/${roomId}/result`, { replace: true })
    }
  }, [isGameFinished, roomId, navigate, resetGameFinished])

  const [mobileTab, setMobileTab] = useState<'chart' | 'order' | 'chat'>('chart')

  if (!roomId) {
    return <div className="py-20 text-center text-wefin-subtle">잘못된 접근입니다</div>
  }

  const userId = getCurrentUserId()

  // 이미 게임을 종료한 참가자가 뒤로가기로 돌아올 경우 결과 페이지로 리다이렉트
  const myParticipant = roomDetail?.data.participants.find((p) => p.userId === userId)
  if (myParticipant?.status === 'FINISHED') {
    navigate(`/history/room/${roomId}/result`, { replace: true })
    return null
  }
  const isHost =
    roomDetail?.data.participants.some((p) => p.isLeader && p.userId === userId) ?? false

  const activePlayers =
    roomDetail?.data.participants.filter((p) => p.status === 'ACTIVE').length ?? 0
  const seed = portfolio?.data.seedMoney ?? roomDetail?.data.seed ?? 0
  const currentDate = currentTurn?.turnDate ?? roomDetail?.data.startDate ?? '2023-10-19'
  const currentRound = currentTurn?.turnNumber ?? 1
  const totalTurns =
    roomDetail?.data.totalTurns ??
    (roomDetail?.data
      ? Math.floor(
          (new Date(roomDetail.data.endDate).getTime() -
            new Date(roomDetail.data.startDate).getTime()) /
            (roomDetail.data.moveDays * 86400000)
        ) + 1
      : 0)
  const totalAssets = portfolio?.data.totalAsset ?? seed
  const profitRate = portfolio?.data.profitRate ?? 0
  const cash = portfolio?.data.cash ?? seed

  return (
    <>
      {/* 데스크탑 레이아웃 */}
      <div className="fixed inset-0 top-[56px] z-10 hidden flex-col overflow-hidden bg-wefin-bg xl:flex">
        <div className="flex min-h-0 flex-1 gap-1.5 p-1.5 xl:gap-2 xl:p-2">
          <div className="flex min-w-0 flex-[1] flex-col gap-1.5 xl:gap-2">
            <div className="min-h-0 flex-[1.3] overflow-hidden rounded-xl border border-wefin-line bg-wefin-surface">
              <StockChart roomId={roomId} />
            </div>
            <div className="min-h-0 flex-[1] overflow-y-auto rounded-xl border border-wefin-line bg-wefin-surface">
              <MarketBriefing roomId={roomId} />
            </div>
          </div>

          <div className="flex min-w-[280px] flex-[0.65] flex-col gap-1.5 overflow-hidden xl:min-w-0 xl:flex-[0.7] xl:gap-2">
            <div className="min-h-0 flex-[1.3] overflow-y-auto rounded-xl border border-wefin-line bg-wefin-surface">
              <OrderPanel roomId={roomId} cash={cash} />
            </div>
            <div className="min-h-0 flex-[1] overflow-y-auto rounded-xl border border-wefin-line bg-wefin-surface">
              <HoldingsPanel roomId={roomId} />
            </div>
          </div>

          <div className="flex min-w-[240px] max-w-[340px] flex-[0.4] flex-col gap-1.5 xl:min-w-[260px] xl:max-w-[380px] xl:flex-[0.45] xl:gap-2">
            <div className="flex min-h-0 flex-[2] flex-col overflow-hidden rounded-xl border border-wefin-line bg-wefin-surface">
              <GroupChatRoom bare />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-wefin-line bg-wefin-surface">
              <GroupRanking roomId={roomId} />
            </div>
          </div>
        </div>

        <PlayHeader
          currentRound={currentRound}
          totalTurns={totalTurns}
          currentDate={currentDate}
          seed={seed}
          totalAssets={totalAssets}
          profitRate={profitRate}
          activePlayers={activePlayers}
          isHost={isHost}
          isAdvancing={voteMutation.isPending || isVoting}
          onNextTurn={() => {
            markVoted()
            voteMutation.mutate(true)
          }}
          onLeave={() => guard.requestLeave('/history')}
          isEnding={endGameMutation.isPending}
          onEndGame={() => {
            endGameMutation.mutate(undefined, {
              onSuccess: () => navigate(`/history/room/${roomId}/result`)
            })
          }}
        />
      </div>

      {/* 모바일 레이아웃 */}
      <div className="fixed inset-0 top-[56px] z-10 flex flex-col overflow-hidden bg-wefin-bg xl:hidden">
        <div className="flex shrink-0 gap-1 border-b border-wefin-line bg-wefin-surface px-2 py-1.5">
          {[
            { key: 'chart' as const, label: '차트·브리핑' },
            { key: 'order' as const, label: '주문·보유' },
            { key: 'chat' as const, label: '채팅·랭킹' }
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMobileTab(key)}
              className={`flex-1 rounded-lg py-2 text-[12px] font-bold transition-colors ${
                mobileTab === key ? 'bg-wefin-mint text-white' : 'text-wefin-subtle'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {mobileTab === 'chart' && (
            <div className="flex flex-col gap-2 p-2">
              <div className="h-[260px] overflow-hidden rounded-xl border border-wefin-line bg-wefin-surface">
                <StockChart roomId={roomId} />
              </div>
              <div className="rounded-xl border border-wefin-line bg-wefin-surface">
                <MarketBriefing roomId={roomId} />
              </div>
            </div>
          )}

          {mobileTab === 'order' && (
            <div className="flex flex-col gap-2 p-2">
              <div className="rounded-xl border border-wefin-line bg-wefin-surface">
                <OrderPanel roomId={roomId} cash={cash} />
              </div>
              <div className="rounded-xl border border-wefin-line bg-wefin-surface">
                <HoldingsPanel roomId={roomId} />
              </div>
            </div>
          )}

          {mobileTab === 'chat' && (
            <div
              className="flex flex-col gap-2 p-2"
              style={{ height: 'calc(100dvh - 56px - 44px - 80px)' }}
            >
              <div className="flex min-h-0 flex-[2] flex-col overflow-hidden rounded-xl border border-wefin-line bg-wefin-surface">
                <GroupChatRoom bare />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-wefin-line bg-wefin-surface">
                <GroupRanking roomId={roomId} />
              </div>
            </div>
          )}
        </div>

        <PlayHeader
          currentRound={currentRound}
          totalTurns={totalTurns}
          currentDate={currentDate}
          seed={seed}
          totalAssets={totalAssets}
          profitRate={profitRate}
          activePlayers={activePlayers}
          isHost={isHost}
          isAdvancing={voteMutation.isPending || isVoting}
          onNextTurn={() => {
            markVoted()
            voteMutation.mutate(true)
          }}
          onLeave={() => guard.requestLeave('/history')}
          isEnding={endGameMutation.isPending}
          onEndGame={() => {
            endGameMutation.mutate(undefined, {
              onSuccess: () => navigate(`/history/room/${roomId}/result`)
            })
          }}
        />
      </div>

      <VoteModal roomId={roomId} />

      {rankChanges.length > 0 && (
        <RankChangePopup changes={rankChanges} onClose={clearRankChanges} />
      )}

      <LeaveRoomDialog
        open={guard.showDialog}
        onConfirm={guard.confirmLeave}
        onCancel={guard.cancelLeave}
        isLeaving={guard.isLeaving}
      />
    </>
  )
}

interface RankChangePopupProps {
  changes: RankChange[]
  onClose: () => void
}

function RankChangePopup({ changes, onClose }: RankChangePopupProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2">
      <div className="w-80 rounded-2xl border border-wefin-line bg-wefin-surface p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-bold text-wefin-text">순위 변동 알림</h4>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-wefin-subtle hover:text-wefin-text"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {changes.map((c) => {
            const isUp = c.delta > 0
            const color = isUp ? 'text-wefin-red' : 'text-wefin-blue'
            const arrow = isUp ? 'UP' : 'DOWN'
            return (
              <div key={c.userName} className="flex items-center gap-2 text-xs">
                <span className="w-16 shrink-0 font-medium text-wefin-text">{c.userName}</span>
                <span className="rounded bg-wefin-bg px-2 py-0.5 font-bold text-wefin-subtle">
                  {c.prevRank}위
                </span>
                <span className="text-wefin-subtle">→</span>
                <span className="rounded bg-wefin-bg px-2 py-0.5 font-bold text-wefin-text">
                  {c.newRank}위
                </span>
                <span className={`font-bold ${color}`}>{arrow}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PlayPage
