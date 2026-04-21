import { useEffect, useState } from 'react'

import SettingsGroupSection from './settings-group-section'
import SettingsProfileSection from './settings-profile-section'
import SettingsSubscriptionSection from './settings-subscription-section'

type Section = 'profile' | 'group' | 'subscription'

const SIDEBAR_ITEMS: { id: Section; label: string }[] = [
  { id: 'profile', label: '프로필' },
  { id: 'group', label: '그룹 관리' },
  { id: 'subscription', label: '구독 플랜' }
]

const SECTION_DESCRIPTION: Record<Section, string> = {
  profile: '계정 정보와 보안 설정을 관리하세요.',
  group: '소속 그룹을 관리하고 새로운 그룹에 참여하세요.',
  subscription: '현재 구독 상태를 확인하고 플랜을 변경하세요.'
}

function SettingsView() {
  const [active, setActive] = useState<Section>('profile')
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('accessToken'))

  useEffect(() => {
    const sync = () => setIsLoggedIn(!!localStorage.getItem('accessToken'))
    window.addEventListener('auth-changed', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('auth-changed', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return (
    <div className="mx-auto max-w-6xl pt-6 sm:pt-12">
      {/* 모바일: 가로 탭 */}
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-wefin-line px-4 scrollbar-thin sm:hidden">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              className={`shrink-0 border-b-2 px-3 pb-2.5 pt-1 text-[13px] font-bold transition-colors ${
                isActive
                  ? 'border-wefin-mint text-wefin-mint'
                  : 'border-transparent text-wefin-subtle'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="grid sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
        {/* 데스크탑: 사이드 네비 */}
        <aside className="sticky top-20 hidden self-start sm:block">
          <nav className="flex flex-col">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = active === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={`relative origin-left px-3 py-3 text-left transition-all ${
                    isActive
                      ? 'text-lg font-bold text-wefin-mint-deep'
                      : 'text-base font-medium text-wefin-subtle hover:scale-105 hover:text-wefin-text'
                  }`}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-wefin-mint-deep"
                    />
                  )}
                  {item.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="px-4 sm:max-w-4xl sm:px-0">
          <header className="mb-6 sm:mb-10">
            <h1 className="text-xl font-bold leading-tight text-wefin-text sm:text-[28px]">
              {SIDEBAR_ITEMS.find((i) => i.id === active)?.label}
            </h1>
            <p className="mt-1 text-sm text-wefin-subtle sm:mt-1.5">
              {SECTION_DESCRIPTION[active]}
            </p>
          </header>

          <div key={active} className="animate-fade-in">
            {active === 'profile' && (
              <div className="max-w-lg">
                <SettingsProfileSection
                  isLoggedIn={isLoggedIn}
                  emailPlaceholder={localStorage.getItem('email') ?? '로그인된 이메일'}
                />
              </div>
            )}

            {active === 'group' && <SettingsGroupSection isLoggedIn={isLoggedIn} />}

            {active === 'subscription' && <SettingsSubscriptionSection />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default SettingsView
