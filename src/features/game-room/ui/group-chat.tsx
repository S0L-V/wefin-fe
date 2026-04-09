import { MessageCircle } from 'lucide-react'

function GroupChat() {
  return (
    <section className="flex min-h-[400px] flex-1 flex-col rounded-3xl border border-wefin-line bg-white p-5 shadow-sm">
      <header className="mb-4 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
            <MessageCircle size={14} className="text-white" />
          </div>
          <h3 className="text-sm font-bold text-wefin-text">그룹 채팅</h3>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center">
        <p className="text-xs text-wefin-subtle">그룹 채팅 기능 준비 중</p>
      </div>
    </section>
  )
}

export default GroupChat
