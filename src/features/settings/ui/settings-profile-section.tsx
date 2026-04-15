import { Mail, User } from 'lucide-react'

import SettingsSectionHeader from './settings-section-header'

type SettingsProfileSectionProps = {
  isLoggedIn: boolean
  emailPlaceholder: string
}

function SettingsProfileSection({ isLoggedIn, emailPlaceholder }: SettingsProfileSectionProps) {
  return (
    <section className="rounded-3xl border border-wefin-line bg-white p-6 shadow-sm">
      <SettingsSectionHeader
        icon={<User size={20} />}
        title="내 정보 변경"
        description="백엔드 연결 전 단계라 입력창과 버튼 UI만 먼저 배치했습니다."
      />

      <div className="space-y-5">
        <div>
          <label
            htmlFor="settings-nickname"
            className="mb-2 block text-sm font-semibold text-wefin-text"
          >
            닉네임 변경
          </label>
          <div className="flex gap-2 max-md:flex-col">
            <input
              id="settings-nickname"
              type="text"
              disabled={!isLoggedIn}
              placeholder={isLoggedIn ? '새 닉네임 입력' : '로그인 후 이용할 수 있어요'}
              className="h-11 flex-1 rounded-xl border border-wefin-line bg-white px-4 text-sm text-wefin-text outline-none transition-colors placeholder:text-wefin-subtle disabled:bg-wefin-bg"
            />
            <button
              type="button"
              disabled
              className="inline-flex h-11 min-w-[96px] items-center justify-center rounded-xl bg-wefin-mint px-4 text-sm font-semibold text-white opacity-50"
            >
              준비 중
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="settings-password"
            className="mb-2 block text-sm font-semibold text-wefin-text"
          >
            비밀번호 변경
          </label>
          <div className="flex gap-2 max-md:flex-col">
            <input
              id="settings-password"
              type="password"
              disabled={!isLoggedIn}
              placeholder={isLoggedIn ? '새 비밀번호 입력' : '로그인 후 이용할 수 있어요'}
              className="h-11 flex-1 rounded-xl border border-wefin-line bg-white px-4 text-sm text-wefin-text outline-none transition-colors placeholder:text-wefin-subtle disabled:bg-wefin-bg"
            />
            <button
              type="button"
              disabled
              className="inline-flex h-11 min-w-[96px] items-center justify-center rounded-xl bg-wefin-mint px-4 text-sm font-semibold text-white opacity-50"
            >
              준비 중
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="settings-email"
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-wefin-text"
          >
            <Mail size={16} />
            이메일
          </label>
          <input
            id="settings-email"
            type="text"
            readOnly
            value={isLoggedIn ? emailPlaceholder : '로그인 후 표시됩니다'}
            className="h-11 w-full rounded-xl border border-wefin-line bg-wefin-bg px-4 text-sm text-wefin-subtle outline-none"
          />
        </div>
      </div>
    </section>
  )
}

export default SettingsProfileSection
