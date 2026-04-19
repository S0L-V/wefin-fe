import { useState } from 'react'

import HighlightedText from '@/shared/ui/highlighted-text'
import SourceBadge from '@/shared/ui/source-badge'
import WefinLogoIcon from '@/shared/ui/wefin-logo-icon'

import type { InsightCard, SourceCluster } from '../api/fetch-market-trends-overview'
import ClusterSourceModal from './cluster-source-modal'

type Props = {
  cards: InsightCard[]
  sourceClusters: SourceCluster[]
}

function InsightCardList({ cards, sourceClusters }: Props) {
  if (cards.length === 0) return null

  const clusterById = new Map(sourceClusters.map((c) => [c.clusterId, c]))

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {cards.map((card, i) => (
        <InsightCardItem key={`${card.headline}-${i}`} card={card} clusterById={clusterById} />
      ))}
    </div>
  )
}

function InsightCardItem({
  card,
  clusterById
}: {
  card: InsightCard
  clusterById: Map<number, SourceCluster>
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const cardClusters: SourceCluster[] = card.relatedClusterIds
    .map((id) => clusterById.get(id))
    .filter((c): c is SourceCluster => Boolean(c))
  const sourceCount = cardClusters.length
  const badgeSources = cardClusters.slice(0, 2).map((c) => ({ publisherName: c.title }))

  const hasAdvice = Boolean(card.advice && card.adviceLabel)

  return (
    <article className="flex h-full flex-col rounded-2xl bg-wefin-bg/60 px-4 py-3.5 transition-colors hover:bg-wefin-bg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-wefin-text">{card.headline}</h3>
          <p className="mt-1 text-[13px] font-medium leading-relaxed text-wefin-text">
            <HighlightedText text={card.body} />
          </p>
        </div>
        {sourceCount > 0 && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 cursor-pointer transition-opacity hover:opacity-80"
          >
            <SourceBadge sourceCount={sourceCount} sources={badgeSources} size="sm" />
          </button>
        )}
      </div>
      {hasAdvice && (
        <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-wefin-mint-soft/40 px-3 py-2">
          <WefinLogoIcon size={12} className="mt-0.5 shrink-0 text-wefin-mint-deep" />
          <div className="text-xs leading-relaxed text-wefin-mint-deep">
            <p className="font-bold">{card.adviceLabel}</p>
            <p className="mt-0.5 text-wefin-text/75">{card.advice}</p>
          </div>
        </div>
      )}
      {isModalOpen && (
        <ClusterSourceModal clusters={cardClusters} onClose={() => setIsModalOpen(false)} />
      )}
    </article>
  )
}

export default InsightCardList
