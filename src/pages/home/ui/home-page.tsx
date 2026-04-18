import MarketTrendsSection from '@/features/market-trends/ui/market-trends-section'
import NewsFeedSection from '@/features/news-feed/ui/news-feed-section'
import NewsListSection from '@/features/news-feed/ui/news-list-section'
import RecommendedNewsSection from '@/features/recommended-news/ui/recommended-news-section'
import HomeSidebar from '@/widgets/home-sidebar/ui/home-sidebar'

function HomePage() {
  return (
    <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="flex flex-col gap-2">
        <div className="rounded-xl border border-wefin-line bg-white p-4 shadow-sm">
          <NewsFeedSection />
        </div>
        <div className="rounded-xl border border-wefin-line bg-white p-4 shadow-sm">
          <MarketTrendsSection />
        </div>
        <div className="rounded-xl border border-wefin-line bg-white p-4 shadow-sm">
          <RecommendedNewsSection />
        </div>
        <div className="rounded-xl border border-wefin-line bg-white p-4 shadow-sm">
          <NewsListSection />
        </div>
      </section>
      <aside className="lg:sticky lg:top-[76px] lg:self-start">
        <HomeSidebar />
      </aside>
    </div>
  )
}

export default HomePage
