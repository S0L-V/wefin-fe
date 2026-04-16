import ChatPanel from '@/features/chat/ui/chat-panel'

function ChatPage() {
  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col">
      <header className="mb-6 border-b border-wefin-line pb-4">
        <h2 className="text-2xl font-bold text-wefin-text">채팅</h2>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-wefin-line bg-white shadow-sm">
        <ChatPanel />
      </div>
    </div>
  )
}

export default ChatPage
