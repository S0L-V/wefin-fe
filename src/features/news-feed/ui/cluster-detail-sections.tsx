import { useState } from 'react'

import SourceBadge from '@/shared/ui/source-badge'

import type { ClusterSection } from '../api/fetch-cluster-detail'
import SourceListModal from './source-list-modal'

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
      <div className="mt-6 sm:mt-8">
        <p className="whitespace-pre-line text-[14px] leading-relaxed text-wefin-text [overflow-wrap:anywhere] sm:text-[15px]">
          {articleContent}
        </p>
      </div>
    )
  }

  if (sections.length === 0) return null

  return (
    <>
      <div className="mt-6 space-y-8 sm:mt-8 sm:space-y-10">
        {sections.map((section) => (
          <div key={section.sectionOrder}>
            <h2 className="text-base font-bold text-wefin-text sm:text-lg">{section.heading}</h2>
            <p className="mt-2.5 whitespace-pre-line text-[14px] leading-relaxed text-wefin-text [overflow-wrap:anywhere] sm:mt-3 sm:text-[15px]">
              {section.body}
            </p>

            {section.sources.length > 0 && (
              <button
                type="button"
                onClick={() => setModalSection(section)}
                className="mt-4 inline-block cursor-pointer transition-opacity hover:opacity-80"
              >
                <SourceBadge
                  sourceCount={section.sourceCount}
                  sources={section.sources}
                  size="md"
                />
              </button>
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
