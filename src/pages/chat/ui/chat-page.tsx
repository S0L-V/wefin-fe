import GlobalChatRoom from '@/features/chat/ui/global-chat-room'

function ChatPage() {
  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Chat</h2>
          <span className="rounded-full bg-[#3db9b9]/10 px-3 py-1 text-sm font-bold text-[#3db9b9]">
            Global Chat
          </span>
        </div>
      </div>

      <GlobalChatRoom />
    </div>
  )
}

export default ChatPage
