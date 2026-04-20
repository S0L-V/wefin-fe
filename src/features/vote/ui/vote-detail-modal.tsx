import '@/app/styles/dialog.css'

import * as Dialog from '@radix-ui/react-dialog'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { refreshTodayQuestsAfterRealtimeAction } from '@/features/quest/model/use-today-quests'
import { fetchVoteDetail, type VoteDetail } from '@/features/vote/api/fetch-vote-detail'
import { fetchVoteResult, type VoteResult } from '@/features/vote/api/fetch-vote-result'
import { submitVote } from '@/features/vote/api/submit-vote'
import { ApiError } from '@/shared/api/base-api'

interface VoteDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voteId: number | null
}

function formatDeadline(deadline: string | null) {
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

export default function VoteDetailModal({ open, onOpenChange, voteId }: VoteDetailModalProps) {
  const queryClient = useQueryClient()
  const [detail, setDetail] = useState<VoteDetail | null>(null)
  const [result, setResult] = useState<VoteResult | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingResult, setIsLoadingResult] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !voteId) {
      if (!open) {
        setDetail(null)
        setResult(null)
        setSelectedIds([])
        setErrorMessage(null)
        setIsLoading(false)
        setIsSubmitting(false)
        setIsLoadingResult(false)
      }
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setErrorMessage(null)
      setResult(null)

      try {
        const nextDetail = await fetchVoteDetail(voteId)

        if (cancelled) {
          return
        }

        setDetail(nextDetail)
        setSelectedIds(nextDetail.myOptionIds)

        if (nextDetail.closed) {
          setIsLoadingResult(true)
          try {
            const nextResult = await fetchVoteResult(voteId)
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
          if (error instanceof ApiError) {
            setErrorMessage(error.message)
          } else {
            setErrorMessage('투표를 불러오지 못했습니다.')
          }
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
  }, [open, voteId])

  const lockedIds = useMemo(() => new Set(detail?.myOptionIds ?? []), [detail?.myOptionIds])
  const newlySelectedIds = useMemo(
    () => selectedIds.filter((optionId) => !lockedIds.has(optionId)),
    [lockedIds, selectedIds]
  )
  const remainingSelectionCount = detail
    ? Math.max(detail.maxSelectCount - (detail.myOptionIds?.length ?? 0), 0)
    : 0

  const toggleOption = (optionId: number) => {
    if (!detail || detail.closed || lockedIds.has(optionId)) {
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

  const handleViewResults = async () => {
    if (!voteId || isLoadingResult) {
      return
    }

    setIsLoadingResult(true)
    setErrorMessage(null)

    try {
      const nextResult = await fetchVoteResult(voteId)
      setResult(nextResult)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('투표 결과를 불러오지 못했습니다.')
      }
    } finally {
      setIsLoadingResult(false)
    }
  }

  const handleSubmit = async () => {
    if (!voteId || !detail || detail.closed || newlySelectedIds.length === 0 || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const nextResult = await submitVote(voteId, { optionIds: newlySelectedIds })
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
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('투표 제출에 실패했습니다.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" style={{ zIndex: 72 }} />
        <Dialog.Content className="dialog-content" style={{ zIndex: 73, maxWidth: 560 }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-wefin-text">투표</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-wefin-subtle">
                투표에 참여하거나 최신 결과를 확인해보세요.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-wefin-subtle transition hover:bg-wefin-bg"
                aria-label="투표 상세 닫기"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-5 min-h-[220px]">
            {isLoading ? (
              <div className="flex h-[220px] items-center justify-center text-sm text-wefin-subtle">
                <Loader2 size={18} className="mr-2 animate-spin" />
                투표를 불러오는 중...
              </div>
            ) : detail ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-wefin-mint/30 bg-wefin-mint-soft p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-wefin-text">{detail.title}</div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-wefin-subtle">
                        <span>Max {detail.maxSelectCount}</span>
                        <span>Ends {formatDeadline(detail.endsAt)}</span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        detail.closed
                          ? 'bg-wefin-surface-2 text-wefin-subtle'
                          : 'bg-wefin-mint-soft text-wefin-mint-deep'
                      }`}
                    >
                      {detail.closed ? '마감' : '진행중'}
                    </span>
                  </div>
                </div>

                {result ? (
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-wefin-text">
                      Participants {result.participantCount}
                    </div>
                    {result.options.map((option) => (
                      <div
                        key={option.optionId}
                        className="space-y-1.5 rounded-2xl border border-wefin-line p-3"
                      >
                        <div className="flex items-center justify-between gap-3 text-sm text-wefin-text">
                          <div className="flex items-center gap-2">
                            <span>{option.optionText}</span>
                            {option.selectedByMe && (
                              <span className="rounded-full bg-wefin-mint-soft px-2 py-0.5 text-[11px] font-semibold text-wefin-mint-deep">
                                Me
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-wefin-subtle">
                            {option.voteCount} / {option.rate.toFixed(1)}%
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-wefin-subtle">
                      <span>Select up to {detail.maxSelectCount}</span>
                      <span>Remaining {remainingSelectionCount}</span>
                    </div>
                    {detail.options.map((option) => {
                      const isLocked = lockedIds.has(option.optionId)
                      const isSelected = selectedIds.includes(option.optionId)

                      return (
                        <button
                          key={option.optionId}
                          type="button"
                          onClick={() => toggleOption(option.optionId)}
                          disabled={detail.closed || isLocked}
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            isSelected
                              ? 'border-wefin-mint bg-wefin-mint-soft/40 text-wefin-text'
                              : 'border-wefin-line bg-wefin-surface text-wefin-text hover:bg-wefin-bg'
                          } ${isLocked ? 'cursor-default opacity-70' : ''}`}
                        >
                          <span>{option.optionText}</span>
                          {isLocked ? (
                            <span className="text-xs font-semibold text-wefin-mint-deep">
                              투표 완료
                            </span>
                          ) : isSelected ? (
                            <span className="text-xs font-semibold text-wefin-mint-deep">
                              내 선택
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                )}

                {errorMessage && (
                  <div className="rounded-xl border border-wefin-line bg-wefin-amber-soft px-3 py-2 text-sm text-wefin-amber-text">
                    {errorMessage}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  {!result && (
                    <button
                      type="button"
                      onClick={() => {
                        void handleViewResults()
                      }}
                      disabled={isLoadingResult}
                      className="h-11 rounded-xl border border-wefin-line px-4 text-sm font-medium text-wefin-text transition hover:bg-wefin-bg disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isLoadingResult ? '로딩중...' : '결과 보기'}
                    </button>
                  )}
                  {!result && (
                    <button
                      type="button"
                      onClick={() => {
                        void handleSubmit()
                      }}
                      disabled={detail.closed || newlySelectedIds.length === 0 || isSubmitting}
                      className="h-11 rounded-xl bg-wefin-mint px-4 text-sm font-medium text-white transition hover:bg-wefin-mint-deep disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isSubmitting ? '제출 중...' : '투표하기'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-wefin-subtle">
                {errorMessage ?? '투표를 찾을 수 없습니다.'}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
