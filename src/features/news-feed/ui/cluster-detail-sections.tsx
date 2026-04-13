import { useState } from 'react'

import type { ArticleSource, ClusterSection } from '../api/fetch-cluster-detail'
import SourceListModal from './source-list-modal'

const INITIAL_COLORS = ['#2b3a4a', '#24a8ab', '#6b7b8d']

interface ClusterDetailSectionsProps {
  sections: ClusterSection[]
  articleContent?: string | null
}

export default function ClusterDetailSections({
  sections,
  articleContent
}: ClusterDetailSectionsProps) {
  const [modalSection, setModalSection] = useState<ClusterSection | null>(null)

  if (sections.length === 0 && articleContent) {
    return (
      <div className="mt-8">
        <p className="whitespace-pre-line text-[15px] leading-relaxed text-wefin-text">
          {articleContent}
        </p>
      </div>
    )
  }

  if (sections.length === 0) return null

  return (
    <>
      <div className="mt-8 space-y-10">
        {sections.map((section) => (
          <div key={section.sectionOrder}>
            <h2 className="text-lg font-bold text-wefin-text">{section.heading}</h2>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-wefin-text">
              {section.body}
            </p>

            {section.sources.length > 0 && (
              <div className="mt-4">
                <SectionSourceBadge
                  sources={section.sources}
                  count={section.sourceCount}
                  onClick={() => setModalSection(section)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {modalSection && (
        <SourceListModal
          heading={modalSection.heading}
          sources={modalSection.sources}
          onClose={() => setModalSection(null)}
        />
      )}
    </>
  )
}

function SectionSourceBadge({
  sources,
  count,
  onClick
}: {
  sources: ArticleSource[]
  count: number
  onClick: () => void
}) {
  const visibleSources = sources.slice(0, 3)

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 text-xs text-wefin-subtle transition-colors hover:bg-gray-100"
    >
      <span className="flex -space-x-1.5">
        {visibleSources.map((src, i) => (
          <span
            key={src.articleId}
            className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-gray-50"
            style={{ backgroundColor: INITIAL_COLORS[i % INITIAL_COLORS.length] }}
          >
            {src.publisherName.charAt(0).toUpperCase()}
          </span>
        ))}
      </span>
      {count}개 출처
    </button>
  )
}
