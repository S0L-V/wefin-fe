import { BarChart3, Bot, Newspaper, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { routes } from '@/shared/config/routes'
import WefinLogoIcon from '@/shared/ui/wefin-logo-icon'
import FeedbackModal from '@/widgets/footer/ui/feedback-modal'

const FEATURES = [
  {
    icon: <TrendingUp size={20} />,
    title: '실시간 모의투자',
    desc: '한국투자증권 Open API 기반 실시간 시세로 가상 매매를 경험할 수 있습니다.'
  },
  {
    icon: <BarChart3 size={20} />,
    title: '타임머신 투자',
    desc: '과거 시장 데이터를 기반으로 친구들과 함께 투자 게임을 즐길 수 있습니다.'
  },
  {
    icon: <Newspaper size={20} />,
    title: 'AI 뉴스 분석',
    desc: '실시간 뉴스를 AI가 분석하여 시장 동향과 맞춤 인사이트를 제공합니다.'
  },
  {
    icon: <Users size={20} />,
    title: '소셜 트레이딩',
    desc: '전체 채팅, 그룹 채팅, 랭킹 시스템으로 다른 투자자들과 교류할 수 있습니다.'
  },
  {
    icon: <Bot size={20} />,
    title: 'AI 투자 어시스턴트',
    desc: '투자에 관한 궁금한 점을 AI에게 물어보고 실시간으로 답변을 받을 수 있습니다.'
  }
]

export default function AboutPage() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <div className="mx-auto max-w-3xl py-4">
      <div className="rounded-2xl bg-white p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-wefin-mint to-wefin-mint-deep text-white">
            <WefinLogoIcon size={22} />
          </div>
          <div>
            <h1 className="flex items-baseline text-2xl font-bold text-wefin-mint-600">
              <WefinLogoIcon size={24} className="mr-[-2px] translate-y-[4px]" />
              <span>efin</span>
            </h1>
            <p className="text-sm text-wefin-subtle">과거에서 배우고, 현재에 투자하다</p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-wefin-text/80">
          WeFin은 과거 시장 데이터로 투자를 학습하고, 그 경험을 실시간 모의투자에 적용하는 트레이딩
          시뮬레이션 서비스입니다. 타임머신 투자로 과거 시장을 복기하며 친구들과 전략을 나누고, AI가
          분석한 뉴스와 시장 브리핑으로 흐름을 파악한 뒤, 실시간 시세 위에서 직접 매매를 경험할 수
          있습니다.
        </p>

        <div className="mt-8">
          <h2 className="text-base font-bold text-wefin-text">주요 기능</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-wefin-line/60 p-4 transition-colors hover:border-wefin-mint/30 hover:bg-wefin-mint-soft/20"
              >
                <div className="flex items-center gap-2.5 text-wefin-mint-deep">
                  {icon}
                  <span className="text-sm font-bold text-wefin-text">{title}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-wefin-subtle">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-wefin-bg p-5">
          <h2 className="text-base font-bold text-wefin-text">팀 SOLV</h2>
          <p className="mt-2 text-sm leading-relaxed text-wefin-text/80">
            실전과 동일한 환경에서 투자를 학습할 수 있는 서비스를 만들고 있습니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-wefin-subtle">
            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="transition-colors hover:text-wefin-mint-deep"
            >
              의견 보내기
            </button>
            <a
              href="https://github.com/S0L-V/wefin-be"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-wefin-mint-deep"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to={routes.home}
            className="inline-block rounded-xl bg-wefin-mint px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-wefin-mint-deep"
          >
            서비스 시작하기
          </Link>
        </div>
      </div>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  )
}
