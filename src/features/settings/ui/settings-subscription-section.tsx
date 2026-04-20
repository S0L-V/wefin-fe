import { Check } from 'lucide-react'

import { useMySubscriptionQuery } from '@/features/payment/model/use-my-subscription-query'

const PRO_FEATURES = [
  'AI 채팅 무제한 이용',
  '과거 데이터 시뮬레이션',
  '광고 제거 및 우선 지원',
  '팀 협업 기능 활성화'
]

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

const PLAN_CARDS = [
  {
    id: 'MONTHLY',
    title: '프로 월간',
    price: '₩ 9,900',
    period: '/월',
    description: '부담 없이 시작할 수 있는 월간 구독 플랜입니다.'
  },
  {
    id: 'YEARLY',
    title: '프로 연간',
    price: '₩ 99,000',
    period: '/년',
    description: '장기 이용자에게 적합한 연간 구독 플랜입니다.'
  }
] as const

function SettingsSubscriptionSection() {
  const { data, isLoading } = useMySubscriptionQuery()

  if (isLoading) {
    return <p className="text-sm text-wefin-subtle">불러오는 중...</p>
  }

  const isActive = data?.active ?? false
  const currentBillingCycle = data?.billingCycle

  return (
    <div className="space-y-10">
      <section>
        <h3 className="mb-4 text-lg font-bold text-wefin-text">현재 플랜</h3>

        {!data ? (
          <div className="rounded-xl border border-dashed border-wefin-line bg-wefin-bg px-6 py-10 text-center">
            <p className="text-base font-semibold text-wefin-text">구독 정보가 없습니다.</p>
            <p className="mt-2 text-sm text-wefin-subtle">
              플랜을 구독하면 이곳에서 확인할 수 있어요.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-wefin-line bg-wefin-bg p-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-bold text-wefin-text">
                {data.planName} · ₩ {data.price.toLocaleString()}
              </p>
              {isActive && (
                <span className="rounded-full border border-wefin-line px-2 py-0.5 text-xs text-wefin-subtle">
                  현재 사용 중
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-wefin-subtle">
              {data.billingCycle === 'MONTHLY' ? '월간 구독' : '연간 구독'}
            </p>

            <p className="mt-1 text-xs text-wefin-subtle">
              {formatDate(data.startedAt)} ~ {formatDate(data.expiredAt)}
            </p>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-4 text-lg font-bold text-wefin-text">플랜 안내</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {PLAN_CARDS.map((plan) => {
            const isCurrentPlan = isActive && currentBillingCycle === plan.id

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 shadow-sm ${
                  isCurrentPlan
                    ? 'border-wefin-mint bg-wefin-mint text-white'
                    : 'border-wefin-line bg-white text-wefin-text'
                }`}
              >
                <div className="flex min-h-[96px] flex-col justify-start">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-2xl font-bold">{plan.title}</p>
                    {isCurrentPlan && (
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-wefin-mint-deep">
                        현재 이용 중
                      </span>
                    )}
                  </div>

                  <p
                    className={`mt-3 text-sm leading-6 ${
                      isCurrentPlan ? 'text-white/85' : 'text-wefin-subtle'
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="mt-6 flex items-end gap-1 tabular-nums">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={isCurrentPlan ? 'text-white/80' : 'text-wefin-subtle'}>
                    {plan.period}
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  {PRO_FEATURES.map((feature) => (
                    <div
                      key={`${plan.id}-${feature}`}
                      className={`flex items-center gap-2 ${
                        isCurrentPlan ? 'text-white/95' : 'text-wefin-text'
                      }`}
                    >
                      <Check className="h-4 w-4 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    disabled={isCurrentPlan}
                    className={`h-12 w-full rounded-xl text-sm font-bold transition-all ${
                      isCurrentPlan
                        ? 'cursor-not-allowed bg-white/55 text-wefin-mint-deep'
                        : 'bg-wefin-mint text-white shadow-md hover:bg-wefin-mint-deep hover:shadow-lg active:scale-[0.98]'
                    }`}
                  >
                    {isCurrentPlan ? '현재 이용 중' : '구독하기'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default SettingsSubscriptionSection
