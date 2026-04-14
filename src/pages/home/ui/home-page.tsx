import GlobalChatRoom from '@/features/chat/ui/global-chat-room'
import MarketTrendsSection from '@/features/market-trends/ui/market-trends-section'
import NewsFeedSection from '@/features/news-feed/ui/news-feed-section'
import NewsListSection from '@/features/news-feed/ui/news-list-section'
import DailyQuestPanel from '@/features/quest/ui/daily-quest-panel'

function HomePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="flex flex-col gap-8 rounded-3xl border border-wefin-line bg-white p-6 shadow-sm">
        <NewsFeedSection />
        <MarketTrendsSection />
        <NewsListSection />
      </section>

      <aside className="flex flex-col gap-6">
        <DailyQuestPanel />
        <GlobalChatRoom />
      </aside>
    </div>
  )
}

export default HomePage
