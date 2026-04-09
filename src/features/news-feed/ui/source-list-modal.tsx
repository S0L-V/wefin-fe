import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import type { ArticleSource } from '../api/fetch-cluster-detail'

const INITIAL_COLORS = ['#2b3a4a', '#24a8ab', '#6b7b8d', '#3b82f6', '#8b5cf6']

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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-modal-title"
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3
            id="source-modal-title"
            className="flex items-center gap-1.5 text-base font-bold text-wefin-text"
          >
            <span className="text-wefin-mint">✦</span>
            출처 {sources.length}개
          </h3>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="닫기"
            className="cursor-pointer rounded-lg p-1 text-wefin-subtle hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-sm text-wefin-subtle">{heading}</p>

        {/* Source list */}
        <div className="max-h-[400px] space-y-3 overflow-y-auto">
          {sources.map((src, i) => (
            <a
              key={src.articleId}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
            >
              <span className="mb-2 inline-flex items-center gap-1.5 text-xs text-wefin-subtle">
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
                  style={{ backgroundColor: INITIAL_COLORS[i % INITIAL_COLORS.length] }}
                >
                  {src.publisherName.charAt(0).toUpperCase()}
                </span>
                {src.publisherName}
              </span>
              <p className="text-sm font-semibold text-wefin-text">{src.title}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
