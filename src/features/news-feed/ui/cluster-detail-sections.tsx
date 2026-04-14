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
