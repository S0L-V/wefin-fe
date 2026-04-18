import { useQueryClient } from '@tanstack/react-query'
import {
  ChevronRight,
  Layers,
  MessageCircle,
  Share2,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingUp
} from 'lucide-react'
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

import type { ClusterDetail, FeedbackType } from '../api/fetch-cluster-detail'
import { useClusterFeedbackMutation } from '../model/use-cluster-feedback-mutation'
import { useShareClusterNewsAction } from '../model/use-share-cluster-news-action'

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
  const { handleShareNews, isPending } = useShareClusterNewsAction(cluster.clusterId)
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
    <div className="mt-10 space-y-12">
      {/* Feedback */}
      <div className="rounded-2xl bg-wefin-bg py-6 text-center">
        <p className="text-sm font-semibold text-wefin-text">
          {currentFeedback ? '피드백을 남겨주셨어요' : '도움이 되셨나요?'}
        </p>
        <div className="mt-3 flex justify-center gap-3">
          <FeedbackButton
            icon={<ThumbsUp className="h-3.5 w-3.5" />}
            label="도움돼요"
            active={currentFeedback === 'HELPFUL'}
            dimmed={currentFeedback !== null && currentFeedback !== 'HELPFUL'}
            disabled={currentFeedback !== null || feedbackMutation.isPending}
            onClick={() => handleFeedback('HELPFUL')}
          />
          <FeedbackButton
            icon={<ThumbsDown className="h-3.5 w-3.5" />}
            label="아쉬워요"
            active={currentFeedback === 'NOT_HELPFUL'}
            dimmed={currentFeedback !== null && currentFeedback !== 'NOT_HELPFUL'}
            disabled={currentFeedback !== null || feedbackMutation.isPending}
            onClick={() => handleFeedback('NOT_HELPFUL')}
          />
        </div>
      </div>

      {/* Chat share CTA */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#3db9b9]/20 bg-gradient-to-r from-[#3db9b9]/10 to-blue-500/10 p-6 sm:flex-row">
        <div>
          <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-wefin-text">
            <MessageCircle size={20} className="text-[#3db9b9]" />이 뉴스에 대해 어떻게
            생각하시나요?
          </h3>
          <p className="text-sm text-wefin-subtle">
            그룹 채팅방에 공유하고 다른 투자자들과 의견을 나누어보세요.
          </p>
        </div>
        <button
          type="button"
          onClick={handleShareNews}
          disabled={isPending}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-[#3db9b9] px-6 py-3 font-bold text-white transition hover:bg-[#2a8282] disabled:cursor-not-allowed disabled:bg-[#3db9b9]/50 disabled:text-white/70"
        >
          <Share2 size={18} />
          <span>채팅방에 공유하기</span>
        </button>
      </div>

      {/* AI Questions */}
      {cluster.suggestedQuestions.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-[#3db9b9]" />
            <h3 className="text-lg font-bold text-wefin-text">AI에게 더 물어보기</h3>
          </div>
          <div className="space-y-2">
            {cluster.suggestedQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuestionClick(q)}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-wefin-line px-4 py-3 text-left text-sm text-wefin-text transition-colors hover:border-[#3db9b9]/40 hover:bg-[#3db9b9]/5"
              >
                <span className="line-clamp-1">{q}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-wefin-subtle" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Related sector interest */}
      {relatedSector && (
        <div className="flex items-center justify-between rounded-xl border border-[#3db9b9]/20 bg-gradient-to-r from-[#3db9b9]/10 to-transparent p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2a8282] shadow-sm">
              <Star size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">
                이 뉴스와 관련된 &apos;{relatedSector.name}&apos; 분야
              </h4>
              <p className="text-sm text-wefin-subtle">
                관심 분야로 등록하고 맞춤 뉴스를 받아보세요.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSectorInterestClick}
            disabled={isSectorToggleDisabled}
            className={
              isSectorRegistered
                ? 'shrink-0 rounded-lg border border-[#3db9b9] bg-white px-5 py-2.5 text-sm font-bold text-[#2a8282] transition-colors hover:bg-[#3db9b9]/10 disabled:opacity-60'
                : 'shrink-0 rounded-lg bg-[#3db9b9] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#2a8282] disabled:opacity-60'
            }
          >
            {isSectorRegistered ? '등록됨' : '관심 등록'}
          </button>
        </div>
      )}

      {/* AI Recommended Stocks */}
      {cluster.relatedStocks.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-[#3db9b9]" />
            <h3 className="text-lg font-bold text-wefin-text">AI 추천 관련 종목</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
  onClick
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  dimmed: boolean
  disabled: boolean
  onClick: () => void
}) {
  const activeClass = 'border-[#3db9b9] bg-[#3db9b9]/10 text-[#2a8282]'
  const idleClass = 'border-wefin-line bg-white text-wefin-subtle hover:bg-wefin-bg'
  const dimmedClass = 'opacity-50'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors ${
        active ? activeClass : idleClass
      } ${dimmed ? dimmedClass : ''} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {icon}
      {label}
    </button>
  )
}
