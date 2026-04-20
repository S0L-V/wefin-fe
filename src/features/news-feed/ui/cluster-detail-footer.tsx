import { useQueryClient } from '@tanstack/react-query'
import { Check, Plus, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { useWefiniChatStore } from '@/features/ai-chat/model/use-wefini-chat-store'
import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'
import { useLoginDialogStore } from '@/features/auth-dialog/model/use-login-dialog-store'
import {
  useAddSectorInterest,
  useDeleteSectorInterest,
  useSectorInterestsQuery
} from '@/features/sector-interest/model/use-sector-interest-queries'
import StockPriceCard from '@/features/stock-price/ui/stock-price-card'
import { ApiError } from '@/shared/api/base-api'
import WefinLogoIcon from '@/shared/ui/wefin-logo-icon'

import type { ClusterDetail, FeedbackType } from '../api/fetch-cluster-detail'
import { useClusterFeedbackMutation } from '../model/use-cluster-feedback-mutation'

interface ClusterDetailFooterProps {
  cluster: ClusterDetail
}

export default function ClusterDetailFooter({ cluster }: ClusterDetailFooterProps) {
  const relatedSectors = cluster.relatedSectors
  const userId = useAuthUserId()
  const openLogin = useLoginDialogStore((s) => s.openLogin)
  const openChatWithPrompt = useWefiniChatStore((s) => s.openWithPrompt)
  const feedbackMutation = useClusterFeedbackMutation(cluster.clusterId)
  const queryClient = useQueryClient()
  // 낙관적 상태: mutate 시점에 즉시 반영해 refetch가 완료되기 전에도 버튼이 다시 활성화되지 않도록 한다
  const [optimisticFeedback, setOptimisticFeedback] = useState<FeedbackType | null>(null)
  const currentFeedback = optimisticFeedback ?? cluster.feedbackType ?? null

  // 분야(SECTOR) 관심 등록 — 로그인 사용자에 한해 등록 여부 조회 후 토글
  const sectorInterestsQuery = useSectorInterestsQuery(Boolean(userId))
  const addSectorMutation = useAddSectorInterest()
  const deleteSectorMutation = useDeleteSectorInterest()
  const isSectorMutating = addSectorMutation.isPending || deleteSectorMutation.isPending
  // 로딩/뮤테이션 중이면 등록 여부를 신뢰할 수 없으므로 토글 차단. data가 아직 없을 때 false로 간주되어
  // 이미 등록된 분야에 중복 add가 발생하는 문제를 막는다
  function isSectorRegistered(code: string) {
    return (
      !sectorInterestsQuery.isLoading &&
      Boolean(sectorInterestsQuery.data?.some((item) => item.code === code))
    )
  }

  function handleSectorInterestClick(sector: { code: string; name: string }) {
    if (!userId) {
      openLogin()
      return
    }
    if (sectorInterestsQuery.isLoading || isSectorMutating) return
    if (isSectorRegistered(sector.code)) {
      deleteSectorMutation.mutate(sector.code)
    } else {
      addSectorMutation.mutate({ code: sector.code, name: sector.name })
    }
  }

  function handleQuestionClick(question: string) {
    if (!userId) {
      openLogin()
      return
    }
    openChatWithPrompt({
      message: question,
      newsClusterId: cluster.clusterId
    })
  }

  function handleFeedback(type: FeedbackType) {
    if (!userId) {
      openLogin()
      return
    }
    if (currentFeedback || feedbackMutation.isPending) return

    setOptimisticFeedback(type)
    setTimeout(() => toast.success('더 나은 분석을 위해 활용할게요'), 300)
    feedbackMutation.mutate(type, {
      onSuccess: () => {
        setOptimisticFeedback(null)
      },
      onError: (error) => {
        // 409 = 이미 피드백을 남긴 경우. 서버 상태가 이미 반영돼 있으므로 낙관 상태 유지 + 클러스터 재조회로 동기화
        if (error instanceof ApiError && error.status === 409) {
          queryClient.invalidateQueries({ queryKey: ['news', 'cluster', cluster.clusterId] })
          return
        }
        // 그 외 실패는 롤백 후 안내
        setOptimisticFeedback(null)
        toast.error('피드백 전송에 실패했어요')
      }
    })
  }

  return (
    <div className="mt-10 space-y-8">
      {/* Feedback + Sectors */}
      <div className="flex flex-wrap items-center justify-center gap-3 border-t border-wefin-line/50 pt-5">
        {currentFeedback ? (
          <span className="inline-flex h-8 w-8 animate-[slideDown_0.3s_ease-out] items-center justify-center rounded-full border border-wefin-mint-deep/30 text-wefin-mint-deep">
            {currentFeedback === 'HELPFUL' ? (
              <ThumbsUp className="h-4 w-4" />
            ) : (
              <ThumbsDown className="h-4 w-4" />
            )}
          </span>
        ) : (
          <>
            <span className="text-xs text-wefin-subtle">도움이 되셨나요?</span>
            <FeedbackButton
              icon={<ThumbsUp className="h-3.5 w-3.5" />}
              label=""
              ariaLabel="도움돼요"
              active={false}
              dimmed={false}
              disabled={feedbackMutation.isPending}
              onClick={() => handleFeedback('HELPFUL')}
            />
            <FeedbackButton
              icon={<ThumbsDown className="h-3.5 w-3.5" />}
              label=""
              ariaLabel="아쉬워요"
              active={false}
              dimmed={false}
              disabled={feedbackMutation.isPending}
              onClick={() => handleFeedback('NOT_HELPFUL')}
            />
          </>
        )}
        {relatedSectors.length > 0 && (
          <>
            <span className="h-4 w-px bg-wefin-line/50" />
            {relatedSectors.map((sector) => {
              const registered = isSectorRegistered(sector.code)
              return (
                <button
                  key={sector.code}
                  type="button"
                  onClick={() => handleSectorInterestClick(sector)}
                  disabled={sectorInterestsQuery.isLoading || isSectorMutating}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    registered
                      ? 'bg-wefin-mint-soft text-wefin-mint-deep'
                      : 'bg-wefin-bg text-wefin-subtle hover:bg-wefin-mint-soft hover:text-wefin-mint-deep'
                  } disabled:opacity-60`}
                >
                  {registered ? <Check size={10} /> : <Plus size={10} />}
                  {sector.name}
                </button>
              )
            })}
          </>
        )}
      </div>

      {/* AI Questions */}
      {cluster.suggestedQuestions.length > 0 && (
        <div className="rounded-xl bg-wefin-mint-soft p-4 sm:rounded-2xl sm:p-5">
          <div className="mb-2.5 flex items-center gap-1.5 sm:mb-3">
            <WefinLogoIcon size={16} className="text-wefin-mint-deep" />
            <h3 className="text-[13px] font-bold text-wefin-text sm:text-sm">
              더 궁금한 점이 있나요?
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {cluster.suggestedQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuestionClick(q)}
                className="cursor-pointer rounded-full bg-wefin-surface px-3 py-1.5 text-[12px] text-wefin-text shadow-sm transition-all hover:text-wefin-mint-deep hover:shadow-md sm:px-4 sm:py-2 sm:text-[13px]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Related Stocks */}
      {cluster.relatedStocks.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-wefin-text">관련 종목</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {cluster.relatedStocks.map((stock) => (
              <StockPriceCard key={stock.code} code={stock.code} name={stock.name} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FeedbackButton({
  icon,
  label,
  active,
  dimmed,
  disabled,
  onClick,
  ariaLabel
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  dimmed: boolean
  disabled: boolean
  onClick: () => void
  ariaLabel?: string
}) {
  const activeClass = 'border-[#3db9b9] bg-[#3db9b9]/10 text-[#2a8282]'
  const idleClass = 'border-wefin-line bg-wefin-surface text-wefin-subtle hover:bg-wefin-bg'
  const dimmedClass = 'opacity-50'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors ${
        active ? activeClass : idleClass
      } ${dimmed ? dimmedClass : ''} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {icon}
      {label}
    </button>
  )
}
