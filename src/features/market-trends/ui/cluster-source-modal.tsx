import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import type { SourceCluster } from '../api/fetch-market-trends-overview'

const INITIAL_COLORS = ['#2b3a4a', '#24a8ab', '#6b7b8d', '#3b82f6', '#8b5cf6']

interface ClusterSourceModalProps {
  /** 총 기사 수. 전체 시장 개요 등 기사 수 집계가 있는 경우에만 전달. 생략 시 클러스터 개수만 노출 */
  articleCount?: number
  clusters: SourceCluster[]
  onClose: () => void
}

export default function ClusterSourceModal({
  articleCount,
  clusters,
  onClose
}: ClusterSourceModalProps) {
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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cluster-source-modal-title"
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3
            id="cluster-source-modal-title"
            className="flex items-center gap-1.5 text-base font-bold text-wefin-text"
          >
            <span className="text-wefin-mint">✦</span>
            {articleCount != null
              ? `출처 ${articleCount}개 · 클러스터 ${clusters.length}개`
              : `관련 클러스터 ${clusters.length}개`}
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

        <div className="max-h-[400px] space-y-3 overflow-y-auto">
          {clusters.map((c, i) => (
            <Link
              key={c.clusterId}
              to={`/news/${c.clusterId}`}
              onClick={onClose}
              className="block rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
            >
              <span className="mb-2 inline-flex items-center gap-1.5 text-xs text-wefin-subtle">
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
                  style={{ backgroundColor: INITIAL_COLORS[i % INITIAL_COLORS.length] }}
                >
                  {c.title.charAt(0).toUpperCase()}
                </span>
                클러스터 #{c.clusterId}
              </span>
              <p className="text-sm font-semibold text-wefin-text">{c.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
