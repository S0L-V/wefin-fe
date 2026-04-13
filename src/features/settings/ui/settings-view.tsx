import { CreditCard, Crown, Lock, Mail, Settings, User, Users } from 'lucide-react'

import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'

import SettingsGroupSection from './settings-group-section'
import SettingsPaymentSection from './settings-payment-section'
import SettingsProfileSection from './settings-profile-section'
import SettingsSubscriptionSection from './settings-subscription-section'

function SettingsView() {
  const userId = useAuthUserId()
  const isLoggedIn = !!userId

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl border border-wefin-line bg-white p-7 shadow-sm">
        <div className="flex items-start gap-4 max-md:flex-col">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-wefin-mint-soft text-wefin-mint">
            <Settings size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-[-0.03em] text-wefin-text">설정</h1>
            <p className="mt-2 text-sm leading-6 text-wefin-subtle">
              계정, 그룹, 구독, 결제 정보를 한 곳에서 확인할 수 있어요. 아직 백엔드가 연결되지 않은
              항목은 화면만 먼저 구성했습니다.
            </p>
          </div>
        </div>
      </section>

      {!isLoggedIn ? (
        <section className="rounded-3xl border border-wefin-line bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-wefin-mint-soft text-wefin-mint">
              <Lock size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-wefin-text">로그인이 필요합니다</h2>
              <p className="mt-1 text-sm leading-6 text-wefin-subtle">
                설정 변경 기능은 로그인 후 이용할 수 있어요. 현재는 화면만 먼저 준비되어 있습니다.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6">
        <SettingsProfileSection
          isLoggedIn={isLoggedIn}
          emailPlaceholder="로그인된 이메일이 표시됩니다"
        />

        <SettingsGroupSection isLoggedIn={isLoggedIn} />

        <SettingsSubscriptionSection />

        <SettingsPaymentSection isLoggedIn={isLoggedIn} />
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-wefin-line bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-wefin-mint-soft text-wefin-mint">
            <User size={18} />
          </div>
          <h3 className="text-base font-bold text-wefin-text">계정 관리</h3>
          <p className="mt-1 text-sm leading-6 text-wefin-subtle">
            닉네임, 비밀번호, 이메일 표시 영역을 먼저 배치했습니다.
          </p>
        </div>

        <div className="rounded-3xl border border-wefin-line bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-wefin-mint-soft text-wefin-mint">
            <Users size={18} />
          </div>
          <h3 className="text-base font-bold text-wefin-text">그룹 설정</h3>
          <p className="mt-1 text-sm leading-6 text-wefin-subtle">
            현재 그룹, 초대 코드, 참여/생성 UI를 백엔드 연결 전 단계로 구성했습니다.
          </p>
        </div>

        <div className="rounded-3xl border border-wefin-line bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-wefin-mint-soft text-wefin-mint">
            <Crown size={18} />
          </div>
          <h3 className="text-base font-bold text-wefin-text">구독 및 결제</h3>
          <p className="mt-1 text-sm leading-6 text-wefin-subtle">
            플랜 비교 카드와 결제 정보 카드 UI를 먼저 확인할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-wefin-line bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-wefin-mint-soft text-wefin-mint">
            <Mail size={18} />
          </div>
          <h3 className="text-base font-bold text-wefin-text">이메일 표시</h3>
          <p className="mt-1 text-sm leading-6 text-wefin-subtle">
            로그인 상태일 때 이메일 영역이 노출되도록 자리만 먼저 준비했습니다.
          </p>
        </div>

        <div className="rounded-3xl border border-wefin-line bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-wefin-mint-soft text-wefin-mint">
            <CreditCard size={18} />
          </div>
          <h3 className="text-base font-bold text-wefin-text">결제 수단</h3>
          <p className="mt-1 text-sm leading-6 text-wefin-subtle">
            카드 정보 수정 UI와 결제 내역 목록을 더미 데이터로 배치했습니다.
          </p>
        </div>
      </section>
    </div>
  )
}

export default SettingsView
