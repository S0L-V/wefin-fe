import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Gift } from 'lucide-react'
import { useRef, useState } from 'react'

import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'
import { useLoginDialogStore } from '@/features/auth-dialog/model/use-login-dialog-store'

import type { Quest } from '../api/fetch-today-quests'
import {
  getQuestErrorMessage,
  useClaimQuestReward,
  useTodayQuests
} from '../model/use-today-quests'

function getProgressPercent(quest: Quest) {
  const { progress, targetValue, code } = quest

  if (targetValue <= 0) return 0

  if (code === 'GAME_RANK_DAILY') {
    if (progress <= 0) return 0
    if (progress <= targetValue) return 100
    return Math.max(0, Math.min(100, Math.round((targetValue / progress) * 100)))
  }

  return Math.min(100, Math.round((progress / targetValue) * 100))
}

function getStatusLabel(quest: Quest) {
  if (quest.status === 'REWARDED') return '보상 수령 완료'
  if (quest.status === 'COMPLETED') return '보상 받기'
  if (quest.status === 'IN_PROGRESS') return '진행 중'
  return '시작 전'
}

function getProgressText(quest: Quest) {
  if (quest.code === 'PROFIT_RATE_DAILY') {
    return `${quest.progress}% / 목표 ${quest.targetValue}%`
  }

  if (quest.code === 'GAME_RANK_DAILY') {
    if (quest.progress <= 0) {
      return `목표 ${quest.targetValue}위 이내`
    }

    return `현재 ${quest.progress}위 / 목표 ${quest.targetValue}위 이내`
  }

  return `${quest.progress}/${quest.targetValue}`
}

export default function DailyQuestPanel() {
  const userId = useAuthUserId()
  const openLogin = useLoginDialogStore((state) => state.openLogin)
  const { data, isLoading, isError, error, refetch } = useTodayQuests(userId)
  const claimReward = useClaimQuestReward(userId)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const quests = data?.quests ?? []

  const scrollTo = (index: number) => {
    const container = scrollRef.current
    if (!container) return

    const card = container.children[index] as HTMLElement | undefined
    if (!card) return

    container.scrollTo({ left: card.offsetLeft, behavior: 'smooth' })
    setActiveIndex(index)
  }

  const handleScroll = () => {
    const container = scrollRef.current
    if (!container || quests.length === 0) return

    const scrollLeft = container.scrollLeft
    const cardWidth = container.scrollWidth / quests.length
    setActiveIndex(Math.round(scrollLeft / cardWidth))
  }

  if (!userId) {
    return (
      <section className="overflow-hidden rounded-2xl border border-wefin-line bg-white shadow-sm">
        <div className="flex h-10 items-center  px-3">
          <span className="text-sm font-semibold text-wefin-text">일일 퀘스트</span>
        </div>
        <div className="p-2.5">
          <div className="rounded-xl border border-dashed border-wefin-line bg-wefin-bg p-3.5 text-center">
            <p className="text-sm font-semibold text-wefin-text">
              로그인하면 오늘의 퀘스트를 확인할 수 있어요.
            </p>
            <button
              type="button"
              onClick={openLogin}
              className="mt-2.5 rounded-lg bg-wefin-mint px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-wefin-mint-deep"
            >
              로그인하고 보기
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-wefin-line bg-white shadow-sm">
      <div className="flex h-10 items-center justify-between  px-3">
        <span className="text-sm font-semibold text-wefin-text">일일 퀘스트</span>
        {quests.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className="flex h-6 w-6 items-center justify-center rounded-full text-wefin-subtle transition-colors hover:bg-wefin-bg disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => scrollTo(Math.min(quests.length - 1, activeIndex + 1))}
              disabled={activeIndex === quests.length - 1}
              className="flex h-6 w-6 items-center justify-center rounded-full text-wefin-subtle transition-colors hover:bg-wefin-bg disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="p-2.5">
        {isLoading && (
          <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-3.5">
            <div className="h-5 w-36 rounded bg-gray-200" />
            <div className="mt-2.5 h-2 w-full rounded-full bg-gray-100" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-center text-sm text-amber-900">
            <p>{getQuestErrorMessage(error)}</p>
            <button
              type="button"
              onClick={() => {
                void refetch()
              }}
              className="mt-2 text-xs font-semibold text-amber-700 underline"
            >
              다시 불러오기
            </button>
          </div>
        )}

        {!isLoading && !isError && quests.length > 0 && (
          <div>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex snap-x snap-mandatory gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {quests.map((quest) => {
                const percent = getProgressPercent(quest)
                const isRewardable = quest.status === 'COMPLETED'
                const isRewarded = quest.status === 'REWARDED'

                return (
                  <div
                    key={quest.questId}
                    className="w-full shrink-0 snap-center rounded-xl border border-wefin-line p-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-wefin-mint-deep">
                          {isRewarded ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </div>
                        <span className="text-sm font-bold text-wefin-text">{quest.title}</span>
                      </div>
                      <span className="rounded-full bg-wefin-mint-soft px-2 py-0.5 text-xs font-bold text-wefin-mint-deep">
                        {quest.reward.toLocaleString()}원
                      </span>
                    </div>

                    <div className="mt-2">
                      {isRewarded ? (
                        <div className="flex items-center justify-center gap-1.5 rounded-lg bg-wefin-mint-soft py-1.5 text-xs font-bold text-wefin-mint-deep">
                          <CheckCircle2 size={13} />
                          보상 수령 완료
                        </div>
                      ) : isRewardable ? (
                        <button
                          type="button"
                          disabled={claimReward.isPending}
                          onClick={() => claimReward.mutate(quest.questId)}
                          className={`flex w-full items-center justify-center gap-1.5 rounded-lg bg-wefin-mint py-1.5 text-xs font-bold text-white transition hover:bg-wefin-mint-deep ${claimReward.isPending ? 'opacity-50' : ''}`}
                        >
                          <Gift size={13} />
                          보상 받기
                        </button>
                      ) : (
                        <>
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="font-medium text-wefin-subtle">
                              {getStatusLabel(quest)}
                            </span>
                            <span className="tabular-nums text-wefin-subtle">
                              {getProgressText(quest)}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-wefin-mint transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {quests.length > 1 && (
              <div className="mt-2 flex justify-center gap-1.5">
                {quests.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollTo(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeIndex ? 'w-4 bg-wefin-mint' : 'w-1.5 bg-gray-200'
                    }`}
                    aria-label={`퀘스트 ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
