type SettingsPaymentSectionProps = {
  isLoggedIn: boolean
}

function SettingsPaymentSection({ isLoggedIn }: SettingsPaymentSectionProps) {
  return (
    <div className="space-y-10">
      <section>
        <h3 className="mb-4 text-lg font-bold text-wefin-text">결제 내역</h3>

        {!isLoggedIn ? (
          <div className="rounded-xl border border-dashed border-wefin-line bg-wefin-bg px-6 py-10 text-center">
            <p className="text-base font-semibold text-wefin-text">
              로그인 후 결제 내역을 확인할 수 있어요.
            </p>
            <p className="mt-2 text-sm text-wefin-subtle">
              구독 또는 결제가 발생하면 이곳에서 확인할 수 있어요.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-wefin-line bg-wefin-bg px-6 py-10 text-center">
            <p className="text-base font-semibold text-wefin-text">아직 결제 내역이 없습니다.</p>
            <p className="mt-2 text-sm text-wefin-subtle">
              구독 또는 결제가 발생하면 이곳에서 확인할 수 있어요.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

export default SettingsPaymentSection
