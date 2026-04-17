import { useEffect, useState } from 'react'

import SettingsGroupSection from './settings-group-section'
import SettingsPaymentSection from './settings-payment-section'
import SettingsProfileSection from './settings-profile-section'
import SettingsSubscriptionSection from './settings-subscription-section'

type Section = 'profile' | 'group' | 'subscription' | 'billing'

const SIDEBAR_ITEMS: { id: Section; label: string }[] = [
  { id: 'profile', label: '프로필' },
  { id: 'group', label: '그룹 관리' },
  { id: 'subscription', label: '구독 플랜' },
  { id: 'billing', label: '결제 및 내역' }
]

const SECTION_DESCRIPTION: Record<Section, string> = {
  profile: '계정 정보와 보안 설정을 관리하세요.',
  group: '소속 그룹을 관리하고 새로운 그룹에 참여하세요.',
  subscription: '현재 구독 상태를 확인하고 플랜을 변경하세요.',
  billing: '결제 수단과 내역을 확인할 수 있어요.'
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
    <div className="mx-auto grid max-w-6xl grid-cols-[180px_minmax(0,1fr)] gap-4 pt-12">
      <aside className="sticky top-20 self-start">
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

      <main className="max-w-md">
        <header className="mb-10">
          <h1 className="text-[28px] font-bold leading-tight text-wefin-text">
            {SIDEBAR_ITEMS.find((i) => i.id === active)?.label}
          </h1>
          <p className="mt-1.5 text-sm text-wefin-subtle">{SECTION_DESCRIPTION[active]}</p>
        </header>

        <div key={active} className="animate-fade-in">
          {active === 'profile' && (
            <SettingsProfileSection
              isLoggedIn={isLoggedIn}
              emailPlaceholder={localStorage.getItem('email') ?? '로그인된 이메일'}
            />
          )}
          {active === 'group' && <SettingsGroupSection isLoggedIn={isLoggedIn} />}
          {active === 'subscription' && <SettingsSubscriptionSection />}
          {active === 'billing' && <SettingsPaymentSection isLoggedIn={isLoggedIn} />}
        </div>
      </main>
    </div>
  )
}

export default SettingsView
