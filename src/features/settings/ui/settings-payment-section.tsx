type SettingsPaymentSectionProps = {
  isLoggedIn: boolean
}

const paymentHistory = [
  { id: 1, date: '2026.04.01', plan: '프로 플랜 정기 결제', amount: '9,900', status: '결제 완료' },
  { id: 2, date: '2026.03.01', plan: '프로 플랜 정기 결제', amount: '9,900', status: '결제 완료' },
  { id: 3, date: '2026.02.01', plan: '프로 플랜 정기 결제', amount: '9,900', status: '결제 완료' }
]

function SettingsPaymentSection({ isLoggedIn }: SettingsPaymentSectionProps) {
  return (
    <div className="space-y-10">
      <section>
        <h3 className="mb-4 text-lg font-bold text-wefin-text">결제 수단</h3>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-wefin-line bg-wefin-bg p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-12 items-center justify-center rounded border border-wefin-line bg-white shadow-sm">
              <span className="text-[10px] font-bold italic text-blue-600">VISA</span>
            </div>
            <div>
              <p className="text-base font-semibold text-wefin-text tabular-nums">
                {isLoggedIn ? 'Visa •••• 4242' : '로그인 후 확인'}
              </p>
              <p className="text-sm text-wefin-subtle">
                {isLoggedIn ? '만료일 12/28' : '카드 정보 연동 예정'}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={!isLoggedIn}
            className="h-9 rounded-lg border border-wefin-line px-3 text-sm font-semibold text-wefin-text transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            변경
          </button>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-bold text-wefin-text">결제 내역</h3>
        <div className="divide-y divide-wefin-line/70 border-b border-wefin-line/70">
          {paymentHistory.map((h) => (
            <div key={h.id} className="flex items-center justify-between py-4">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-wefin-subtle tabular-nums">
                  {h.date}
                </p>
                <p className="text-base font-semibold text-wefin-text">{h.plan}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-base font-bold text-wefin-text tabular-nums">₩ {h.amount}</p>
                <p className="text-xs font-semibold text-wefin-mint">{h.status}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-center">
          <button type="button" className="text-sm text-wefin-subtle hover:text-wefin-text">
            더 보기
          </button>
        </div>
      </section>
    </div>
  )
}

export default SettingsPaymentSection
