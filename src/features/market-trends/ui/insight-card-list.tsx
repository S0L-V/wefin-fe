import { useState } from 'react'

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
    <article className="flex h-full flex-col rounded-2xl bg-wefin-bg/60 p-5 transition-colors hover:bg-wefin-bg">
      <h3 className="mb-2 text-sm font-bold text-wefin-text">{card.headline}</h3>
      <p className="mb-3 flex-grow text-[13px] font-medium leading-relaxed text-wefin-text/70">
        {card.body}
      </p>
      {hasAdvice && (
        <div className="mb-3 rounded-xl bg-gradient-to-r from-wefin-mint-soft/60 to-transparent px-4 py-3">
          <div className="mb-1 flex items-center gap-1.5">
            <WefinLogoIcon size={13} className="text-wefin-mint-deep" />
            <span className="text-xs font-bold text-wefin-mint-deep">{card.adviceLabel}</span>
          </div>
          <p className="text-[13px] font-medium leading-relaxed text-wefin-text">{card.advice}</p>
        </div>
      )}
      {sourceCount > 0 && (
        <div className="mt-auto flex justify-end">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer transition-opacity hover:opacity-80"
          >
            <SourceBadge sourceCount={sourceCount} sources={badgeSources} size="sm" />
          </button>
        </div>
      )}
      {isModalOpen && (
        <ClusterSourceModal clusters={cardClusters} onClose={() => setIsModalOpen(false)} />
      )}
    </article>
  )
}

export default InsightCardList
