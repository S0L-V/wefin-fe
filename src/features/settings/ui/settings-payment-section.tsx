import { CreditCard, Receipt } from 'lucide-react'

import SettingsSectionHeader from './settings-section-header'

type SettingsPaymentSectionProps = {
  isLoggedIn: boolean
}

const paymentHistory = [
  { id: 1, date: '2026-04-01', amount: '9,900원', status: '결제 완료' },
  { id: 2, date: '2026-03-01', amount: '9,900원', status: '결제 완료' }
]

function SettingsPaymentSection({ isLoggedIn }: SettingsPaymentSectionProps) {
  return (
    <section className="rounded-3xl border border-wefin-line bg-white p-6 shadow-sm">
      <SettingsSectionHeader
        icon={<CreditCard size={20} />}
        title="결제 정보"
        description="카드 정보와 결제 내역은 더미 데이터로 먼저 구성했습니다."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-wefin-line p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-wefin-text">정기 결제 수단</h3>
            <button
              type="button"
              disabled
              className="text-sm font-semibold text-wefin-mint opacity-50"
            >
              준비 중
            </button>
          </div>

          <div className="rounded-2xl border border-wefin-line bg-wefin-bg p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-14 items-center justify-center rounded-xl bg-white text-xs font-bold text-wefin-subtle">
                VISA
              </div>

              <div>
                <p className="text-sm font-semibold text-wefin-text">
                  {isLoggedIn ? '**** **** **** 4242' : '로그인 후 확인 가능'}
                </p>
                <p className="mt-1 text-xs text-wefin-subtle">
                  {isLoggedIn ? '만료일: 12/28' : '카드 정보 연동 예정'}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                disabled
                value="Visa"
                className="h-11 rounded-xl border border-wefin-line bg-white px-4 text-sm text-wefin-subtle outline-none"
                readOnly
              />
              <input
                type="text"
                disabled
                value="12/28"
                className="h-11 rounded-xl border border-wefin-line bg-white px-4 text-sm text-wefin-subtle outline-none"
                readOnly
              />
            </div>

            <input
              type="text"
              disabled
              value="**** **** **** 4242"
              className="mt-3 h-11 w-full rounded-xl border border-wefin-line bg-white px-4 text-sm text-wefin-subtle outline-none"
              readOnly
            />

            <button
              type="button"
              disabled
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-wefin-mint text-sm font-semibold text-white opacity-50"
            >
              저장 준비 중
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-wefin-line p-5">
          <div className="mb-4 flex items-center gap-2">
            <Receipt size={18} className="text-wefin-mint" />
            <h3 className="text-base font-bold text-wefin-text">결제 내역</h3>
          </div>

          <div className="space-y-3">
            {paymentHistory.map((history) => (
              <div
                key={history.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-wefin-line bg-wefin-bg p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-wefin-text">{history.date}</p>
                  <p className="mt-1 text-xs text-wefin-subtle">프로 플랜 정기 결제</p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-wefin-text">{history.amount}</p>
                  <p className="mt-1 text-xs font-semibold text-wefin-mint">{history.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SettingsPaymentSection
