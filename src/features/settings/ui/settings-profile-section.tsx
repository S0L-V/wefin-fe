type SettingsProfileSectionProps = {
  isLoggedIn: boolean
  emailPlaceholder: string
}

function SettingsProfileSection({ isLoggedIn, emailPlaceholder }: SettingsProfileSectionProps) {
  const nickname = isLoggedIn ? (localStorage.getItem('nickname') ?? '') : ''

  return (
    <div className="space-y-10">
      <section>
        <h3 className="mb-4 text-lg font-bold text-wefin-text">프로필 설정</h3>
        <div className="divide-y divide-wefin-line/70">
          <SettingRow
            title="닉네임"
            description="서비스에서 표시될 이름입니다."
            action={
              <input
                defaultValue={nickname}
                placeholder="닉네임 입력"
                disabled={!isLoggedIn}
                maxLength={12}
                className="h-9 w-[200px] rounded-lg border border-wefin-line bg-white px-3 text-sm text-wefin-text outline-none transition-colors placeholder:text-wefin-subtle focus:border-wefin-mint disabled:bg-wefin-bg disabled:text-wefin-subtle"
              />
            }
          />
          <SettingRow
            title="이메일 주소"
            description="로그인에 사용되는 이메일입니다."
            action={
              <span className="text-sm font-medium text-wefin-subtle">
                {isLoggedIn ? emailPlaceholder : '로그인 후 표시'}
              </span>
            }
          />
          <SettingRow
            title="비밀번호"
            description="보안을 위해 주기적으로 변경하세요."
            action={
              <button
                type="button"
                disabled={!isLoggedIn}
                className="h-8 rounded-lg border border-wefin-line px-3 text-xs font-semibold text-wefin-text transition-colors hover:bg-wefin-bg disabled:cursor-not-allowed disabled:opacity-50"
              >
                변경하기
              </button>
            }
          />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-bold text-wefin-text">보안 인증</h3>
        <SettingRow
          title="2단계 인증 (2FA)"
          description="로그인 시 추가 보안 코드를 요구하여 계정을 보호합니다."
          action={
            <button
              type="button"
              disabled
              aria-label="2단계 인증 토글"
              className="relative h-6 w-11 cursor-not-allowed rounded-full bg-wefin-line opacity-60"
            >
              <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white" />
            </button>
          }
        />
      </section>
    </div>
  )
}

function SettingRow({
  title,
  description,
  action
}: {
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div className="min-w-0 space-y-1">
        <p className="text-base font-semibold text-wefin-text">{title}</p>
        <p className="text-sm text-wefin-subtle">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}

export default SettingsProfileSection
