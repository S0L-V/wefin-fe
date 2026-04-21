import { useEffect, useState } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
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
  const [showScanline, setShowScanline] = useState(false)

  // 투표 통과 → 모달 닫힘 시 스캔라인 + 블러 와이프 효과
  useEffect(() => {
    const unsub = useVoteStore.subscribe((state, prev) => {
      if (prev.result === 'passed' && state.result === null) {
        setShowScanline(true)
      }
    })
    return unsub
  }, [])

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
      {/* 턴 전환 — 타임머신 시계 포탈 */}
      {showScanline && (
        <div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          onAnimationEnd={(e) => {
            if ((e.target as HTMLElement).dataset.portalEnd) setShowScanline(false)
          }}
        >
          {/* 어두운 배경 */}
          <div className="animate-[warp-bg_2.5s_ease-in-out_forwards] absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* 포탈 글로우 — 시계 뒤 빛 */}
          <div className="animate-[portal-glow_2.5s_ease-in-out_forwards] absolute h-52 w-52 rounded-full bg-wefin-mint/20 opacity-0 shadow-[0_0_60px_30px_rgba(20,184,166,0.3)]" />

          {/* 시계 본체 */}
          <svg
            viewBox="0 0 200 200"
            className="animate-[portal-clock_2.5s_ease-in-out_forwards] absolute h-44 w-44 opacity-0"
          >
            {/* 포탈 외곽 링 */}
            <circle
              cx="100"
              cy="100"
              r="94"
              fill="none"
              stroke="rgba(20,184,166,0.6)"
              strokeWidth="2.5"
            />
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="rgba(20,184,166,0.05)"
              stroke="rgba(20,184,166,0.3)"
              strokeWidth="1"
            />

            {/* 12시간 눈금 */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180)
              const isMain = i % 3 === 0
              const r1 = isMain ? 74 : 78
              const r2 = 84
              return (
                <line
                  key={i}
                  x1={100 + r1 * Math.cos(angle)}
                  y1={100 + r1 * Math.sin(angle)}
                  x2={100 + r2 * Math.cos(angle)}
                  y2={100 + r2 * Math.sin(angle)}
                  stroke="rgba(20,184,166,0.7)"
                  strokeWidth={isMain ? 2.5 : 1}
                  strokeLinecap="round"
                />
              )
            })}

            {/* 시침 — 빠르게 회전 */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="52"
              stroke="#14b8a6"
              strokeWidth="3"
              strokeLinecap="round"
              style={{
                transformOrigin: '100px 100px',
                animation: 'clock-hand-hour 2.5s ease-in-out forwards'
              }}
            />

            {/* 분침 — 더 빠르게 회전 */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="38"
              stroke="#14b8a6"
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                transformOrigin: '100px 100px',
                animation: 'clock-hand-min 2.5s ease-in-out forwards'
              }}
            />

            {/* 중앙 점 */}
            <circle cx="100" cy="100" r="4" fill="#14b8a6" />
          </svg>

          {/* 종료 감지 */}
          <div
            data-portal-end="true"
            className="animate-[warp-bg_2.5s_ease-in-out_forwards] absolute"
          />
        </div>
      )}

      {/* 데스크탑 레이아웃 */}
      <div className="fixed inset-0 top-[56px] z-10 hidden flex-col overflow-hidden bg-wefin-bg lg:flex">
        <div className="flex min-h-0 flex-1 gap-2 p-2">
          <div className="flex min-w-0 flex-[1] flex-col gap-2">
            <div className="min-h-0 flex-[1.5] overflow-hidden rounded-xl border border-wefin-line bg-wefin-surface">
              <StockChart roomId={roomId} />
            </div>
            <div className="min-h-0 flex-[1] overflow-y-auto rounded-xl border border-wefin-line bg-wefin-surface">
              <MarketBriefing roomId={roomId} />
            </div>
          </div>

          <div className="min-w-0 flex-[0.7]">
            <Group orientation="vertical" id="play-order-holdings">
              <Panel defaultSize={60} minSize={25}>
                <div className="h-full overflow-y-auto rounded-xl border border-wefin-line bg-wefin-surface">
                  <OrderPanel roomId={roomId} cash={cash} />
                </div>
              </Panel>
              <Separator className="group flex h-2 items-center justify-center">
                <div className="h-0.5 w-10 rounded-full bg-wefin-line-2 transition-colors group-hover:bg-wefin-mint group-active:bg-wefin-mint" />
              </Separator>
              <Panel defaultSize={40} minSize={20}>
                <div className="h-full overflow-y-auto rounded-xl border border-wefin-line bg-wefin-surface">
                  <HoldingsPanel roomId={roomId} />
                </div>
              </Panel>
            </Group>
          </div>

          <div className="flex min-w-[200px] max-w-[380px] flex-[0.45] flex-col gap-2">
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
      <div className="fixed inset-0 top-[56px] z-10 flex flex-col overflow-hidden bg-wefin-bg lg:hidden">
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
