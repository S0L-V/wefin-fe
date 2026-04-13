import GlobalChatRoom from '@/features/chat/ui/global-chat-room'
import NewsFeedSection from '@/features/news-feed/ui/news-feed-section'
import NewsListSection from '@/features/news-feed/ui/news-list-section'

function HomePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-3xl border border-wefin-line bg-white p-6 shadow-sm">
        <NewsFeedSection />
        <NewsListSection />
      </section>

      <aside className="min-h-[640px]">
        <GlobalChatRoom />
      </aside>
    </div>
  )
}

export default HomePage
