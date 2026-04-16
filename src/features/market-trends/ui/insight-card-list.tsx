import { Activity, Flame, type LucideIcon, ShieldCheck, TrendingUp } from 'lucide-react'
import { useState } from 'react'

import SourceBadge from '@/shared/ui/source-badge'

import type { InsightCard, SourceCluster } from '../api/fetch-market-trends-overview'
import ClusterSourceModal from './cluster-source-modal'

const CARD_ICONS: LucideIcon[] = [TrendingUp, Activity, Flame, ShieldCheck]

type Props = {
  cards: InsightCard[]
  sourceClusters: SourceCluster[]
}

function InsightCardList({ cards, sourceClusters }: Props) {
  if (cards.length === 0) return null

  const clusterById = new Map(sourceClusters.map((c) => [c.clusterId, c]))

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {cards.map((card, index) => (
        <InsightCardItem
          key={`${card.headline}-${index}`}
          card={card}
          index={index}
          clusterById={clusterById}
        />
      ))}
    </div>
  )
}

function InsightCardItem({
  card,
  index,
  clusterById
}: {
  card: InsightCard
  index: number
  clusterById: Map<number, SourceCluster>
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const Icon = CARD_ICONS[index % CARD_ICONS.length]

  const cardClusters: SourceCluster[] = card.relatedClusterIds
    .map((id) => clusterById.get(id))
    .filter((c): c is SourceCluster => Boolean(c))
  const sourceCount = cardClusters.length
  const badgeSources = cardClusters.slice(0, 2).map((c) => ({ publisherName: c.title }))

  return (
    <article className="flex h-full flex-col rounded-xl border border-wefin-line bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-wefin-mint" />
        <h3 className="text-sm font-bold text-wefin-text">{card.headline}</h3>
      </div>
      <p className="mb-4 flex-grow text-xs leading-relaxed text-wefin-subtle">{card.body}</p>
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
