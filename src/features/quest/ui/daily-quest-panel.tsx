import { CheckCircle2, Circle, Gift } from 'lucide-react'

import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'
import { useLoginDialogStore } from '@/features/auth-dialog/model/use-login-dialog-store'

import type { Quest } from '../api/fetch-today-quests'
import {
  getQuestErrorMessage,
  useClaimQuestReward,
  useTodayQuests
} from '../model/use-today-quests'

function getQuestProgressPercent(progress: number, targetValue: number) {
  if (targetValue <= 0) {
    return 0
  }

  return Math.min(100, Math.round((progress / targetValue) * 100))
}

function getQuestStatusLabel(quest: Quest) {
  if (quest.status === 'REWARDED') return '수령 완료'
  if (quest.status === 'COMPLETED') return '보상 받기'
  if (quest.status === 'IN_PROGRESS') return '진행 중'
  return '시작 전'
}

function getQuestTone(quest: Quest) {
  if (quest.status === 'REWARDED') {
    return 'border-[#b7ebe7] bg-[#f2fbfa]'
  }

  if (quest.status === 'COMPLETED') {
    return 'border-[#7ed8cf] bg-[linear-gradient(180deg,#f7fffe_0%,#ecfbf9_100%)]'
  }

  return 'border-gray-200 bg-white'
}

export default function DailyQuestPanel() {
  const userId = useAuthUserId()
  const openLogin = useLoginDialogStore((state) => state.openLogin)
  const { data, isLoading, isError, error, refetch } = useTodayQuests(userId)
  const claimReward = useClaimQuestReward(userId)

  if (!userId) {
    return (
      <section className="overflow-hidden rounded-2xl border border-wefin-line bg-white shadow-sm">
        <div className="flex h-11 items-center border-b border-wefin-line px-3">
          <span className="text-sm font-semibold text-wefin-text">일일 퀘스트</span>
        </div>
        <div className="p-3">
          <div className="rounded-xl border border-dashed border-wefin-line bg-wefin-bg p-4 text-center">
            <p className="text-sm font-semibold text-wefin-text">
              로그인 후 오늘의 퀘스트를 확인할 수 있어요
            </p>
            <p className="mt-1 text-xs text-wefin-subtle">
              매일 새로운 퀘스트를 완료하고 보상을 받아보세요
            </p>
            <button
              type="button"
              onClick={openLogin}
              className="mt-3 rounded-lg bg-wefin-mint px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-wefin-mint-deep"
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
      <div className="flex h-11 items-center border-b border-wefin-line px-3">
        <span className="text-sm font-semibold text-wefin-text">일일 퀘스트</span>
      </div>

      <div className="h-[180px] overflow-y-auto p-3 scrollbar-thin">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-36 rounded bg-gray-200" />
                  <div className="h-7 w-20 rounded-full bg-gray-200" />
                </div>
                <div className="mt-3 h-4 w-full rounded bg-gray-100" />
                <div className="mt-2 h-2 w-full rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-5 text-sm text-amber-900">
            <p>{getQuestErrorMessage(error)}</p>
            <button
              type="button"
              onClick={() => {
                void refetch()
              }}
              className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              다시 불러오기
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-3">
            {data?.quests.map((quest) => {
              const progressPercent = getQuestProgressPercent(quest.progress, quest.targetValue)
              const isRewardable = quest.status === 'COMPLETED'
              const isRewarded = quest.status === 'REWARDED'

              return (
                <article
                  key={quest.questId}
                  className={`rounded-2xl border p-4 transition ${getQuestTone(quest)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#2a8282]">
                      {isRewarded ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-bold text-gray-900">{quest.title}</h4>
                        </div>
                        <div className="shrink-0 rounded-full bg-[#f4fbfa] px-3 py-1 text-sm font-bold text-[#2a8282]">
                          {quest.reward} C
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="mb-2 flex items-center justify-between text-xs font-medium text-gray-500">
                          <span>{getQuestStatusLabel(quest)}</span>
                          <span>
                            {quest.progress} / {quest.targetValue}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#edf4f4]">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#3db9b9_0%,#7fd9cf_100%)] transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          disabled={!isRewardable || claimReward.isPending}
                          onClick={() => {
                            if (!isRewardable) {
                              return
                            }

                            claimReward.mutate(quest.questId)
                          }}
                          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                            isRewarded
                              ? 'bg-[#edf7f6] text-[#6e9e99]'
                              : isRewardable
                                ? 'bg-[#3db9b9] text-white hover:bg-[#2a8282]'
                                : 'bg-gray-100 text-gray-400'
                          } ${claimReward.isPending ? 'cursor-not-allowed opacity-70' : ''}`}
                        >
                          <Gift size={15} />
                          {isRewarded ? '수령 완료' : isRewardable ? '보상 받기' : '진행 중'}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
