import { useState } from 'react'

const PROFILE_COLORS = [
  { id: 'mint', from: '#0f8385', to: '#34d399', label: '민트' },
  { id: 'blue', from: '#2563eb', to: '#60a5fa', label: '블루' },
  { id: 'purple', from: '#7c3aed', to: '#a78bfa', label: '퍼플' },
  { id: 'rose', from: '#e11d48', to: '#fb7185', label: '로즈' },
  { id: 'amber', from: '#d97706', to: '#fbbf24', label: '앰버' },
  { id: 'slate', from: '#334155', to: '#64748b', label: '슬레이트' }
]

type SettingsProfileSectionProps = {
  isLoggedIn: boolean
  emailPlaceholder: string
}

function SettingsProfileSection({ isLoggedIn, emailPlaceholder }: SettingsProfileSectionProps) {
  const nickname = isLoggedIn ? (localStorage.getItem('nickname') ?? '') : ''
  const [selectedColor, setSelectedColor] = useState(
    () => localStorage.getItem('profileColor') ?? 'mint'
  )

  const handleColorChange = (id: string) => {
    setSelectedColor(id)
    localStorage.setItem('profileColor', id)
    window.dispatchEvent(new Event('profile-color-changed'))
  }

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
            title="프로필 색상"
            description="헤더와 채팅에서 표시될 프로필 색상입니다."
            action={
              <div className="flex gap-2">
                {PROFILE_COLORS.map(({ id, from, to }) => (
                  <button
                    key={id}
                    type="button"
                    disabled={!isLoggedIn}
                    onClick={() => handleColorChange(id)}
                    className={`h-8 w-8 rounded-full transition-all disabled:opacity-50 ${
                      selectedColor === id
                        ? 'ring-2 ring-wefin-text ring-offset-2'
                        : 'hover:scale-110'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${from}, ${to})`
                    }}
                    aria-label={PROFILE_COLORS.find((c) => c.id === id)?.label}
                  />
                ))}
              </div>
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
