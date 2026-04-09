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

import type { ClusterDetail } from '../api/fetch-cluster-detail'

interface ClusterDetailFooterProps {
  cluster: ClusterDetail
}

export default function ClusterDetailFooter({ cluster }: ClusterDetailFooterProps) {
  const sectorTag = cluster.marketTags[0]

  return (
    <div className="mt-10 space-y-12">
      {/* Feedback */}
      <div className="rounded-2xl bg-gray-50 py-6 text-center">
        <p className="text-sm font-semibold text-wefin-text">도움이 되셨나요?</p>
        <div className="mt-3 flex justify-center gap-3">
          <FeedbackButton icon={<ThumbsUp className="h-3.5 w-3.5" />} label="도움돼요" />
          <FeedbackButton icon={<ThumbsDown className="h-3.5 w-3.5" />} label="아쉬워요" />
        </div>
      </div>

      {/* Chat share CTA */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#3db9b9]/20 bg-gradient-to-r from-[#3db9b9]/10 to-blue-500/10 p-6 sm:flex-row">
        <div>
          <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-gray-900">
            <MessageCircle size={20} className="text-[#3db9b9]" />이 뉴스에 대해 어떻게
            생각하시나요?
          </h3>
          <p className="text-sm text-gray-600">
            전체 채팅방에 공유하고 다른 투자자들과 의견을 나누어보세요.
          </p>
        </div>
        <button
          disabled
          title="준비 중"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-[#3db9b9]/50 px-6 py-3 font-bold text-white/70 cursor-not-allowed"
        >
          <Share2 size={18} />
          <span>채팅방에 공유하기</span>
        </button>
      </div>

      {/* AI Questions */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-[#3db9b9]" />
          <h3 className="text-lg font-bold text-gray-900">AI에게 더 물어보기</h3>
        </div>
        <div className="space-y-2">
          {getSuggestedQuestions(cluster).map((q, i) => (
            <button
              key={i}
              disabled
              title="준비 중"
              className="flex w-full items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-left text-sm text-wefin-text cursor-not-allowed opacity-60"
            >
              <span className="line-clamp-1">{q}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
            </button>
          ))}
        </div>
      </div>

      {/* Related sector interest */}
      {sectorTag && (
        <div className="flex items-center justify-between rounded-xl border border-[#3db9b9]/20 bg-gradient-to-r from-[#3db9b9]/10 to-transparent p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2a8282] shadow-sm">
              <Star size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">
                이 뉴스와 관련된 &apos;{sectorTag}&apos; 분야
              </h4>
              <p className="text-sm text-gray-600">관심 분야로 등록하고 맞춤 뉴스를 받아보세요.</p>
            </div>
          </div>
          <button
            disabled
            title="준비 중"
            className="shrink-0 rounded-lg bg-[#3db9b9]/50 px-5 py-2.5 text-sm font-bold text-white/70 cursor-not-allowed"
          >
            관심 등록
          </button>
        </div>
      )}

      {/* AI Recommended Stocks */}
      {cluster.relatedStocks.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-[#3db9b9]" />
            <h3 className="text-lg font-bold text-gray-900">AI 추천 관련 종목</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cluster.relatedStocks.map((stock) => (
              <div
                key={stock.code}
                className="flex cursor-pointer flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-[#3db9b9]/50"
              >
                <span className="font-bold text-gray-900">{stock.name}</span>
                <span className="text-sm text-gray-500">{stock.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommended News */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Layers size={20} className="text-[#3db9b9]" />
          <h3 className="text-lg font-bold text-gray-900">AI 추천 관련 뉴스</h3>
        </div>
        <p className="py-8 text-center text-sm text-gray-400">준비 중입니다</p>
      </div>
    </div>
  )
}

function FeedbackButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      disabled
      title="준비 중"
      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-wefin-subtle cursor-not-allowed opacity-60"
    >
      {icon}
      {label}
    </button>
  )
}

function getSuggestedQuestions(cluster: ClusterDetail): string[] {
  const questions: string[] = []
  const stockNames = cluster.relatedStocks.map((s) => s.name)

  if (stockNames.length > 0) {
    questions.push(`${stockNames[0]}의 최근 실적과 전망은 어떤가요?`)
  }
  if (cluster.marketTags.length > 0) {
    questions.push(`${cluster.marketTags[0]} 분야의 투자 전망은 어떤가요?`)
  }
  questions.push('이 뉴스가 일반 투자자에게 미치는 영향은 무엇인가요?')

  return questions.slice(0, 3)
}
