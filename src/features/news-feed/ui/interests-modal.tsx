import { X } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import InterestSectorsPanel from '@/pages/interests/ui/interest-sectors-panel'
import InterestStocksPanel from '@/pages/interests/ui/interest-stocks-panel'

type Tab = 'stocks' | 'sectors'

const TABS: { id: Tab; label: string }[] = [
  { id: 'stocks', label: '관심 종목' },
  { id: 'sectors', label: '관심 분야' }
]

interface InterestsModalProps {
  open: boolean
  onClose: () => void
}

export default function InterestsModal({ open, onClose }: InterestsModalProps) {
  const [tab, setTab] = useState<Tab>('stocks')

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg animate-[slideDown_0.2s_ease-out] rounded-2xl bg-wefin-surface px-6 py-5 shadow-[0_16px_48px_rgba(0,0,0,0.12)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-wefin-text">관심 목록 관리</h2>
            <p className="mt-0.5 text-xs text-wefin-subtle">
              타입별 최대 10개까지 등록할 수 있어요
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-wefin-subtle transition-colors hover:bg-wefin-bg hover:text-wefin-text"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-full bg-wefin-mint-soft/50 p-1" role="tablist">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  active ? 'bg-wefin-surface text-wefin-mint-deep shadow-sm' : 'text-wefin-subtle'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-wefin-line [&::-webkit-scrollbar-track]:bg-transparent">
          {tab === 'stocks' && <InterestStocksPanel />}
          {tab === 'sectors' && <InterestSectorsPanel />}
        </div>
      </div>
    </div>,
    document.body
  )
}
