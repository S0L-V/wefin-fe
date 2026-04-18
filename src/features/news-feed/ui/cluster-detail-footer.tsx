import { useQueryClient } from '@tanstack/react-query'
import { Layers, Star, ThumbsDown, ThumbsUp } from 'lucide-react'
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
  const relatedSector = cluster.relatedSectors[0]
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
  const isSectorToggleDisabled =
    !relatedSector || sectorInterestsQuery.isLoading || isSectorMutating
  const isSectorRegistered =
    !sectorInterestsQuery.isLoading &&
    Boolean(
      relatedSector && sectorInterestsQuery.data?.some((item) => item.code === relatedSector.code)
    )

  function handleSectorInterestClick() {
    if (!userId) {
      openLogin()
      return
    }
    if (isSectorToggleDisabled || !relatedSector) return
    if (isSectorRegistered) {
      deleteSectorMutation.mutate(relatedSector.code)
    } else {
      addSectorMutation.mutate({ code: relatedSector.code, name: relatedSector.name })
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
    feedbackMutation.mutate(type, {
      onSuccess: () => {
        // 서버 확정 후 cluster.feedbackType이 채워지면 옵티미스틱 상태는 해제
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
      {/* Feedback */}
      <div className="border-t border-wefin-line/50 pt-6">
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm text-wefin-subtle">
            {currentFeedback ? '피드백 감사합니다' : '이 분석이 도움이 되셨나요?'}
          </span>
          {(!currentFeedback || currentFeedback === 'HELPFUL') && (
            <FeedbackButton
              icon={<ThumbsUp className="h-4 w-4" />}
              label=""
              ariaLabel="도움돼요"
              active={currentFeedback === 'HELPFUL'}
              dimmed={currentFeedback !== null && currentFeedback !== 'HELPFUL'}
              disabled={currentFeedback !== null || feedbackMutation.isPending}
              onClick={() => handleFeedback('HELPFUL')}
            />
          )}
          {(!currentFeedback || currentFeedback === 'NOT_HELPFUL') && (
            <FeedbackButton
              icon={<ThumbsDown className="h-4 w-4" />}
              label=""
              ariaLabel="아쉬워요"
              active={currentFeedback === 'NOT_HELPFUL'}
              dimmed={currentFeedback !== null && currentFeedback !== 'NOT_HELPFUL'}
              disabled={currentFeedback !== null || feedbackMutation.isPending}
              onClick={() => handleFeedback('NOT_HELPFUL')}
            />
          )}
        </div>
      </div>

      {/* AI Questions */}
      {cluster.suggestedQuestions.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-[#f8fffe] to-[#f0f7f7] p-5">
          <div className="mb-3 flex items-center gap-1.5">
            <WefinLogoIcon size={16} className="text-wefin-mint-deep" />
            <h3 className="text-sm font-bold text-wefin-text">더 궁금한 점이 있나요?</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {cluster.suggestedQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuestionClick(q)}
                className="cursor-pointer rounded-full bg-white px-4 py-2 text-[13px] text-wefin-text shadow-sm transition-all hover:text-wefin-mint-deep hover:shadow-md"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Related sector interest */}
      {relatedSector && (
        <div className="inline-flex items-center gap-2">
          <span className="rounded-full bg-wefin-bg px-3 py-1.5 text-[13px] font-semibold text-wefin-text">
            {relatedSector.name}
          </span>
          <button
            type="button"
            onClick={handleSectorInterestClick}
            disabled={isSectorToggleDisabled}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all ${
              isSectorRegistered
                ? 'bg-wefin-mint-soft text-wefin-mint-deep'
                : 'text-wefin-subtle hover:bg-wefin-mint-soft hover:text-wefin-mint-deep'
            } disabled:opacity-60`}
          >
            <Star size={12} className={isSectorRegistered ? 'fill-current' : ''} />
            {isSectorRegistered ? '등록됨' : '관심 등록'}
          </button>
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

      {/* AI Recommended News */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Layers size={20} className="text-[#3db9b9]" />
          <h3 className="text-lg font-bold text-wefin-text">AI 추천 관련 뉴스</h3>
        </div>
        <p className="py-8 text-center text-sm text-wefin-subtle">준비 중입니다</p>
      </div>
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
  const idleClass = 'border-wefin-line bg-white text-wefin-subtle hover:bg-wefin-bg'
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
