export const routes = {
  home: '/',
  news: '/news',
  stocks: '/stocks',
  stockDetail: (code: string) => `/stocks/${code}`,
  history: '/history',
  chat: '/chat',
  settings: '/settings',
  account: '/account',
  accountTab: (tab: AccountTab) => `/account?tab=${tab}`,
  interests: '/interests'
} as const

export type AccountTab = 'asset' | 'trade-history' | 'order-history' | 'profit-analysis'

type NavigationItem = {
  to: string
  label: string
  end?: boolean
}

export const navigationItems: NavigationItem[] = [
  { to: routes.home, label: '홈', end: true },
  { to: routes.stocks, label: '실시간 주식' },
  { to: routes.history, label: '과거 기반' },
  { to: routes.chat, label: '채팅' },
  { to: routes.settings, label: '설정' }
]
