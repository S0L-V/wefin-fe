import AccountIssueForm from '@/features/admin-accounts/ui/account-issue-form'
import CollectMarketButton from '@/features/admin-market/ui/collect-market-button'
import MarketSnapshotTable from '@/features/admin-market/ui/market-snapshot-table'
import NewsCollectButtons from '@/features/admin-news/ui/news-collect-buttons'

function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-wefin-text">관리자</h1>

      <section className="rounded-xl border border-wefin-line bg-wefin-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-wefin-text">뉴스</h2>
        <NewsCollectButtons />
      </section>

      <section className="rounded-xl border border-wefin-line bg-wefin-surface p-6">
        <div className="mb-4 space-y-1">
          <h2 className="text-lg font-semibold text-wefin-text">계정 발급</h2>
          <p className="text-sm text-wefin-subtle">
            대회/비즈니스 계정을 이메일 인증 없이 발급합니다.
          </p>
        </div>
        <AccountIssueForm />
      </section>

      <section className="rounded-xl border border-wefin-line bg-wefin-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-wefin-text">시장 지표</h2>
        <div className="space-y-4">
          <CollectMarketButton />
          <MarketSnapshotTable />
        </div>
      </section>
    </div>
  )
}

export default AdminPage
