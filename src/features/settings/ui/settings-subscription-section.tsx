import { Check, CreditCard, Crown } from 'lucide-react'

import SettingsSectionHeader from './settings-section-header'

const plans = [
  {
    name: '베이직',
    price: '무료',
    features: ['실시간 주식 시세', '기본 AI 채팅', '커뮤니티 이용'],
    isCurrent: true
  },
  {
    name: '프로',
    price: '월 9,900원',
    features: ['AI 채팅 무제한 이용', '과거 데이터 시뮬레이션', '광고 제거'],
    isCurrent: false,
    isPopular: true
  }
]

function SettingsSubscriptionSection() {
  return (
    <section className="rounded-3xl border border-wefin-line bg-white p-6 shadow-sm">
      <SettingsSectionHeader
        icon={<Crown size={20} />}
        title="구독 플랜"
        description="현재 백엔드 연결 없이 플랜 비교 화면만 먼저 제공합니다."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={[
              'relative rounded-3xl border p-6 transition-colors',
              plan.isPopular
                ? 'border-wefin-mint bg-wefin-mint-soft/40'
                : 'border-wefin-line bg-white'
            ].join(' ')}
          >
            {plan.isPopular ? (
              <div className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-wefin-mint px-3 py-1 text-xs font-bold text-white">
                <Crown size={12} />
                추천
              </div>
            ) : null}

            <div className="mb-5">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-wefin-mint-soft text-wefin-mint">
                <CreditCard size={18} />
              </div>
              <h3 className="text-xl font-bold text-wefin-text">{plan.name}</h3>
              <p className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-wefin-mint">
                {plan.price}
              </p>
            </div>

            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-wefin-subtle">
                  <Check size={16} className="mt-0.5 shrink-0 text-wefin-mint" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              disabled
              className={[
                'mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold',
                plan.isCurrent
                  ? 'border border-wefin-line bg-gray-50 text-wefin-subtle'
                  : 'bg-wefin-mint text-white opacity-50'
              ].join(' ')}
            >
              {plan.isCurrent ? '현재 이용 중' : '준비 중'}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default SettingsSubscriptionSection
