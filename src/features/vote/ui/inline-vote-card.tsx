import { useQueryClient } from '@tanstack/react-query'
import { Loader2, MessageSquareReply } from 'lucide-react'
import { useEffect, useState } from 'react'

import { refreshTodayQuestsAfterRealtimeAction } from '@/features/quest/model/use-today-quests'
import { fetchVoteDetail, type VoteDetail } from '@/features/vote/api/fetch-vote-detail'
import { fetchVoteResult, type VoteResult } from '@/features/vote/api/fetch-vote-result'
import { submitVote } from '@/features/vote/api/submit-vote'
import { ApiError } from '@/shared/api/base-api'

interface VoteShareOption {
  optionId: number
  optionText: string
}

interface VoteShare {
  voteId: number
  title: string
  status: string
  maxSelectCount: number
  endsAt: string | null
  closed: boolean
  options: VoteShareOption[]
}

interface InlineVoteCardProps {
  voteShare: VoteShare
  isMine: boolean
  sender: string
  time: string
  onReply: () => void
}

function formatVoteDateTime(deadline: string | null) {
  if (!deadline) {
    return '--'
  }

  return new Date(deadline).toLocaleString([], {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function InlineVoteCard({
  voteShare,
  isMine,
  sender,
  time,
  onReply
}: InlineVoteCardProps) {
  const queryClient = useQueryClient()
  const [detail, setDetail] = useState<VoteDetail | null>(null)
  const [result, setResult] = useState<VoteResult | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingResult, setIsLoadingResult] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const nextDetail = await fetchVoteDetail(voteShare.voteId)

        if (cancelled) {
          return
        }

        setDetail(nextDetail)
        setSelectedIds(nextDetail.myOptionIds)

        if (nextDetail.closed) {
          setIsLoadingResult(true)
          try {
            const nextResult = await fetchVoteResult(voteShare.voteId)
            if (!cancelled) {
              setResult(nextResult)
            }
          } finally {
            if (!cancelled) {
              setIsLoadingResult(false)
            }
          }
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ApiError ? error.message : '투표 정보를 불러오지 못했습니다.'
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [voteShare.voteId])

  const currentTitle = detail?.title ?? voteShare.title
  const currentClosed = detail?.closed ?? voteShare.closed
  const currentMaxSelectCount = detail?.maxSelectCount ?? voteShare.maxSelectCount
  const currentEndsAt = detail?.endsAt ?? voteShare.endsAt
  const currentOptions = detail?.options ?? voteShare.options

  const lockedIds = new Set(detail?.myOptionIds ?? [])
  const newlySelectedIds = selectedIds.filter((optionId) => !lockedIds.has(optionId))
  const remainingSelectionCount = detail
    ? Math.max(detail.maxSelectCount - detail.myOptionIds.length, 0)
    : currentMaxSelectCount

  const toggleOption = (optionId: number) => {
    if (!detail || currentClosed || lockedIds.has(optionId)) {
      return
    }

    setSelectedIds((current) => {
      if (current.includes(optionId)) {
        return current.filter((id) => id !== optionId)
      }

      if (current.length >= detail.maxSelectCount) {
        return current
      }

      return [...current, optionId]
    })
  }

  const handleViewResult = async () => {
    if (isLoadingResult) {
      return
    }

    setIsLoadingResult(true)
    setErrorMessage(null)

    try {
      const nextResult = await fetchVoteResult(voteShare.voteId)
      setResult(nextResult)
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : '투표 결과를 불러오지 못했습니다.'
      )
    } finally {
      setIsLoadingResult(false)
    }
  }

  const handleSubmitVote = async () => {
    if (!detail || currentClosed || newlySelectedIds.length === 0 || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const nextResult = await submitVote(voteShare.voteId, { optionIds: newlySelectedIds })
      setResult(nextResult)
      setDetail((current) =>
        current
          ? {
              ...current,
              myOptionIds: selectedIds,
              closed: nextResult.closed,
              status: nextResult.status
            }
          : current
      )
      refreshTodayQuestsAfterRealtimeAction(queryClient)
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : '투표 제출에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`group/msg flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
      {!isMine && <span className="mb-1 text-xs font-bold text-wefin-text">{sender}</span>}

      <div className={`flex w-full items-end gap-1.5 ${isMine ? 'flex-row-reverse' : ''}`}>
        <div className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-[#cde9e2] bg-white shadow-sm">
          <div className="border-b border-[#e2f2ee] bg-[#f6fbfa] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 text-xs font-semibold text-[#1d9f8d]">투표</div>
                <div className="line-clamp-2 text-sm font-bold text-wefin-text">{currentTitle}</div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${currentClosed ? 'bg-gray-100 text-gray-600' : 'bg-[#daf4ef] text-[#157969]'}`}
              >
                {currentClosed ? '마감' : '진행중'}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-wefin-subtle">
              <span>최대 {currentMaxSelectCount}개</span>
              <span>마감 {formatVoteDateTime(currentEndsAt)}</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-wefin-subtle">
              <Loader2 size={16} className="animate-spin" />
              투표 정보를 불러오는 중...
            </div>
          ) : result ? (
            <div className="space-y-3 px-4 py-3">
              <div className="text-xs font-semibold text-wefin-subtle">
                참여자 {result.participantCount}명
              </div>
              {result.options.map((option) => (
                <div
                  key={option.optionId}
                  className="space-y-1.5 rounded-xl border border-wefin-line p-3"
                >
                  <div className="flex items-center justify-between gap-3 text-sm text-wefin-text">
                    <div className="flex items-center gap-2">
                      <span>{option.optionText}</span>
                      {option.selectedByMe && (
                        <span className="rounded-full bg-wefin-mint-soft px-2 py-0.5 text-[11px] font-semibold text-wefin-mint-deep">
                          내 선택
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-wefin-subtle">
                      {option.voteCount}표 / {option.rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-wefin-bg">
                    <div
                      className="h-full rounded-full bg-wefin-mint"
                      style={{ width: `${Math.max(Math.min(option.rate, 100), 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 px-4 py-3">
              <div className="flex items-center justify-between text-xs text-wefin-subtle">
                <span>남은 선택 {remainingSelectionCount}개</span>
                <span>현재 선택 {selectedIds.length}개</span>
              </div>
              {currentOptions.map((option) => {
                const isLocked = lockedIds.has(option.optionId)
                const isSelected = selectedIds.includes(option.optionId)
                return (
                  <button
                    key={option.optionId}
                    type="button"
                    onClick={() => toggleOption(option.optionId)}
                    disabled={!detail || currentClosed || isLocked}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${isSelected ? 'border-wefin-mint bg-wefin-mint-soft/40 text-wefin-text' : 'border-wefin-line bg-white text-wefin-text hover:bg-wefin-bg'} ${isLocked ? 'cursor-default opacity-70' : ''}`}
                  >
                    <span>{option.optionText}</span>
                    {isLocked ? (
                      <span className="text-[11px] font-semibold text-wefin-mint-deep">
                        투표 완료
                      </span>
                    ) : isSelected ? (
                      <span className="text-[11px] font-semibold text-wefin-mint-deep">선택됨</span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          )}

          {errorMessage && (
            <div className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-wefin-line px-4 py-3">
            {!result && (
              <button
                type="button"
                onClick={() => {
                  void handleViewResult()
                }}
                disabled={isLoadingResult}
                className="h-9 rounded-xl border border-wefin-line px-3 text-sm font-medium text-wefin-text transition hover:bg-wefin-bg disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLoadingResult ? '불러오는 중...' : '결과 보기'}
              </button>
            )}
            {!result && (
              <button
                type="button"
                onClick={() => {
                  void handleSubmitVote()
                }}
                disabled={!detail || currentClosed || newlySelectedIds.length === 0 || isSubmitting}
                className="h-9 rounded-xl bg-wefin-mint px-3 text-sm font-medium text-white transition hover:bg-wefin-mint-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? '제출 중...' : '투표하기'}
              </button>
            )}
          </div>
        </div>
        {time && <span className="pb-0.5 text-[10px] text-wefin-subtle">{time}</span>}
        <button
          type="button"
          onClick={onReply}
          aria-label="답장"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-wefin-subtle transition-opacity hover:bg-wefin-bg hover:text-wefin-mint-deep focus-visible:opacity-100 group-hover/msg:opacity-100 [@media(pointer:fine)]:opacity-0"
        >
          <MessageSquareReply size={16} />
        </button>
      </div>
    </div>
  )
}
