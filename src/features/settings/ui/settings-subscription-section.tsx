import { Check } from 'lucide-react'

const PRO_FEATURES = [
  'AI 채팅 무제한 이용',
  '과거 데이터 시뮬레이션',
  '광고 제거 및 우선 지원',
  '팀 협업 기능 활성화'
]

function SettingsSubscriptionSection() {
  return (
    <div className="space-y-10">
      <section>
        <h3 className="mb-4 text-base font-semibold text-wefin-text">현재 플랜</h3>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-wefin-line bg-wefin-bg p-5">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-wefin-text">베이직 · 무료</p>
              <span className="rounded-full border border-wefin-line px-2 py-0.5 text-[10px] text-wefin-subtle">
                현재 사용 중
              </span>
            </div>
            <p className="mt-1 text-xs text-wefin-subtle">
              기본적인 AI 채팅 및 데이터 분석 기능을 제공합니다.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-base font-semibold text-wefin-text">추천 플랜</h3>
        <div className="overflow-hidden rounded-xl border border-wefin-mint bg-wefin-mint text-white shadow-lg">
          <div className="flex items-center justify-between p-6 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">프로 플랜</p>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-wefin-mint-deep">
                  BEST
                </span>
              </div>
              <p className="mt-1 text-xs text-white/80">
                무제한 AI 기능과 고급 분석 도구를 경험하세요.
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums">₩ 9,900</p>
              <p className="text-[10px] text-white/70">/ 월</p>
            </div>
          </div>

          <div className="grid gap-2 px-6 py-4 md:grid-cols-2">
            {PRO_FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-white/90">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs">{feature}</span>
              </div>
            ))}
          </div>

          <div className="p-6 pt-2">
            <button
              type="button"
              disabled
              className="h-11 w-full rounded-lg bg-white text-sm font-bold text-wefin-mint-deep transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              업그레이드 하기
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SettingsSubscriptionSection
