import CollectMarketButton from '@/features/admin-market/ui/collect-market-button'
import MarketSnapshotTable from '@/features/admin-market/ui/market-snapshot-table'
import NewsCollectButtons from '@/features/admin-news/ui/news-collect-buttons'

function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-wefin-text">관리자</h1>

      <section className="rounded-xl border border-wefin-line bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-wefin-text">뉴스</h2>
        <NewsCollectButtons />
      </section>

      <section className="rounded-xl border border-wefin-line bg-white p-6">
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
