import { useSearchParams } from 'react-router-dom'

import { type AccountTab } from '@/shared/config/routes'
import AccountLayout from '@/widgets/account-layout/ui/account-layout'

import AssetTab from './asset-tab'
import OrderHistoryTab from './order-history-tab'
import ProfitAnalysisTab from './profit-analysis-tab'
import TradeHistoryTab from './trade-history-tab'

const VALID_TABS: AccountTab[] = ['asset', 'trade-history', 'order-history', 'profit-analysis']

function isValidTab(value: string | null): value is AccountTab {
  return !!value && (VALID_TABS as string[]).includes(value)
}

function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: AccountTab = isValidTab(tabParam) ? tabParam : 'asset'

  const handleTabChange = (tab: AccountTab) => {
    setSearchParams({ tab }, { replace: true })
  }

  return (
    <AccountLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {activeTab === 'asset' && <AssetTab />}
      {activeTab === 'trade-history' && <TradeHistoryTab />}
      {activeTab === 'order-history' && <OrderHistoryTab />}
      {activeTab === 'profit-analysis' && <ProfitAnalysisTab />}
    </AccountLayout>
  )
}

export default AccountPage
