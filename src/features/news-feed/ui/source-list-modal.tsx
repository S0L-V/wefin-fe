import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import type { ArticleSource } from '../api/fetch-cluster-detail'

interface SourceListModalProps {
  heading: string
  sources: ArticleSource[]
  onClose: () => void
}

export default function SourceListModal({ heading, sources, onClose }: SourceListModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-modal-title"
        className="relative w-full max-w-md animate-[slideDown_0.2s_ease-out] rounded-2xl bg-white px-6 py-5 shadow-[0_16px_48px_rgba(0,0,0,0.12)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 id="source-modal-title" className="text-base font-bold text-wefin-text">
              {heading}
            </h3>
            <p className="mt-0.5 text-xs text-wefin-subtle">{sources.length}개 출처</p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-wefin-subtle transition-colors hover:bg-wefin-bg hover:text-wefin-text"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative max-h-[360px] overflow-x-hidden overflow-y-auto pl-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-wefin-line [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-wefin-mint-deep via-wefin-mint to-wefin-mint-soft" />
          {sources.map((src) => (
            <a
              key={src.articleId}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex gap-4 py-3"
            >
              <span className="absolute left-[-13px] top-[18px] h-2 w-2 rounded-full border-2 border-wefin-mint-deep bg-white transition-colors group-hover:bg-wefin-mint-deep" />
              <div className="min-w-0 flex-1 rounded-xl px-3 py-2 transition-colors group-hover:bg-wefin-bg">
                <p className="text-sm font-semibold text-wefin-text underline decoration-transparent decoration-1 underline-offset-4 transition-all group-hover:text-wefin-mint-deep group-hover:decoration-wefin-mint-deep/40">
                  {src.title}
                </p>
                <span className="mt-0.5 block text-xs text-wefin-subtle">{src.publisherName}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
