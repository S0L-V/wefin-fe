import ChatPanel from '@/features/chat/ui/chat-panel'

function ChatPage() {
  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-wefin-text">채팅</h2>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-wefin-surface">
        <ChatPanel />
      </div>
    </div>
  )
}

export default ChatPage
