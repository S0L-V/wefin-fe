import { useQueryClient } from '@tanstack/react-query'
import { Loader2, MessageSquareReply } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

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

function hasSameSelection(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false
  }

  const leftSorted = [...left].sort((a, b) => a - b)
  const rightSorted = [...right].sort((a, b) => a - b)

  return leftSorted.every((value, index) => value === rightSorted[index])
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

    const loadResult = async (voteId: number) => {
      setIsLoadingResult(true)

      try {
        const nextResult = await fetchVoteResult(voteId)
        if (!cancelled) {
          setResult(nextResult)
          setSelectedIds(
            nextResult.options
              .filter((option) => option.selectedByMe)
              .map((option) => option.optionId)
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingResult(false)
        }
      }
    }

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

        if (nextDetail.closed || nextDetail.myOptionIds.length > 0) {
          await loadResult(voteShare.voteId)
        } else if (!cancelled) {
          setResult(null)
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
  const submittedIds = detail?.myOptionIds ?? []
  const remainingSelectionCount = Math.max(currentMaxSelectCount - selectedIds.length, 0)
  const hasPendingChange = detail ? !hasSameSelection(selectedIds, detail.myOptionIds) : false
  const displayResult = !!result

  const resultOptionMap = useMemo(() => {
    if (!result) {
      return new Map<number, VoteResult['options'][number]>()
    }

    return new Map(result.options.map((option) => [option.optionId, option]))
  }, [result])

  const toggleOption = (optionId: number) => {
    if (!detail || currentClosed) {
      return
    }

    setSelectedIds((current) => {
      if (current.includes(optionId)) {
        return current.filter((id) => id !== optionId)
      }

      if (current.length >= currentMaxSelectCount) {
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
      setSelectedIds(
        nextResult.options.filter((option) => option.selectedByMe).map((option) => option.optionId)
      )
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : '투표 결과를 불러오지 못했습니다.'
      )
    } finally {
      setIsLoadingResult(false)
    }
  }

  const handleSubmitVote = async () => {
    if (!detail || currentClosed || selectedIds.length === 0 || isSubmitting || !hasPendingChange) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const nextResult = await submitVote(voteShare.voteId, { optionIds: selectedIds })
      const nextSelectedIds = nextResult.options
        .filter((option) => option.selectedByMe)
        .map((option) => option.optionId)

      setResult(nextResult)
      setSelectedIds(nextSelectedIds)
      setDetail((current) =>
        current
          ? {
              ...current,
              myOptionIds: nextSelectedIds,
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
        <div className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-wefin-mint/30 bg-wefin-surface shadow-sm">
          <div className="border-b border-wefin-mint/20 bg-wefin-mint-soft px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 text-xs font-semibold text-wefin-mint-deep">투표</div>
                <div className="line-clamp-2 text-sm font-bold text-wefin-text">{currentTitle}</div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${currentClosed ? 'bg-wefin-surface-2 text-gray-600' : 'bg-[#daf4ef] text-[#157969]'}`}
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
          ) : (
            <div className="space-y-3 px-4 py-3">
              <div className="flex items-center justify-between text-xs text-wefin-subtle">
                <span>남은 선택 {remainingSelectionCount}개</span>
                <span>현재 선택 {selectedIds.length}개</span>
              </div>

              {displayResult && (
                <div className="text-xs font-semibold text-wefin-subtle">
                  참여자 {result?.participantCount ?? 0}명
                </div>
              )}

              {currentOptions.map((option) => {
                const resultOption = resultOptionMap.get(option.optionId)
                const isSelected = selectedIds.includes(option.optionId)
                const wasSubmitted = submittedIds.includes(option.optionId)
                const showBar = displayResult && resultOption

                return (
                  <button
                    key={option.optionId}
                    type="button"
                    onClick={() => toggleOption(option.optionId)}
                    disabled={!detail || currentClosed}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition ${isSelected ? 'border-wefin-mint bg-wefin-mint-soft/40' : 'border-wefin-line bg-wefin-surface hover:bg-wefin-bg'} ${currentClosed ? 'cursor-default' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-3 text-sm text-wefin-text">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate">{option.optionText}</span>
                        {isSelected && (
                          <span className="shrink-0 rounded-full bg-wefin-mint-soft px-2 py-0.5 text-[11px] font-semibold text-wefin-mint-deep">
                            내 선택
                          </span>
                        )}
                        {!isSelected && wasSubmitted && !hasPendingChange && (
                          <span className="shrink-0 rounded-full bg-wefin-bg px-2 py-0.5 text-[11px] font-semibold text-wefin-subtle">
                            제출됨
                          </span>
                        )}
                      </div>
                      {showBar && (
                        <span className="shrink-0 text-xs text-wefin-subtle">
                          {resultOption.voteCount}표 / {resultOption.rate.toFixed(1)}%
                        </span>
                      )}
                    </div>

                    {showBar && (
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-wefin-bg">
                        <div
                          className={`h-full rounded-full ${isSelected ? 'bg-wefin-mint-deep' : 'bg-wefin-mint'}`}
                          style={{ width: `${Math.max(Math.min(resultOption.rate, 100), 0)}%` }}
                        />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {errorMessage && (
            <div className="border-t border-wefin-line bg-wefin-amber-soft px-4 py-3 text-sm text-wefin-amber-text">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-wefin-line px-4 py-3">
            {!displayResult && (
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
            {!currentClosed && (
              <button
                type="button"
                onClick={() => {
                  void handleSubmitVote()
                }}
                disabled={!detail || selectedIds.length === 0 || isSubmitting || !hasPendingChange}
                className="h-9 rounded-xl bg-wefin-mint px-3 text-sm font-medium text-white transition hover:bg-wefin-mint-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting
                  ? '제출 중...'
                  : detail?.myOptionIds.length
                    ? '다시 투표하기'
                    : '투표하기'}
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
