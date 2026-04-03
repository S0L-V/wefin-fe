import GlobalChatRoom from '@/features/chat/ui/global-chat-room'

function HomePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="min-h-[640px] rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Home</h1>
          <p className="mt-2 text-sm text-gray-500">
            This is the main home content area. The global chat stays live on the right.
          </p>
        </div>
      </section>

      <aside className="min-h-[640px]">
        <GlobalChatRoom />
      </aside>
    </div>
  )
}

export default HomePage
