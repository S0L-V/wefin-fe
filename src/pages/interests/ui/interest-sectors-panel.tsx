import { X } from 'lucide-react'

import { usePopularTagsQuery } from '@/features/news-feed/model/use-popular-tags-query'
import {
  useAddSectorInterest,
  useDeleteSectorInterest,
  useSectorInterestsQuery
} from '@/features/sector-interest/model/use-sector-interest-queries'

const MAX_SECTOR_INTERESTS = 10

export default function InterestSectorsPanel() {
  const { data: interests = [], isLoading } = useSectorInterestsQuery()
  const { data: popular = [], isLoading: isLoadingPopular } = usePopularTagsQuery('SECTOR')
  const addMutation = useAddSectorInterest()
  const deleteMutation = useDeleteSectorInterest()

  const registeredCodes = new Set(interests.map((i) => i.code))
  const isLimitReached = interests.length >= MAX_SECTOR_INTERESTS

  function handleAddSector(code: string, name: string) {
    if (isLimitReached) return
    addMutation.mutate({ code, name })
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-bold text-wefin-text">등록한 관심 분야</h2>
          <span className="text-xs text-wefin-subtle">
            {interests.length} / {MAX_SECTOR_INTERESTS}
          </span>
        </div>
        {isLoading ? (
          <SkeletonRows count={3} />
        ) : interests.length === 0 ? (
          <EmptyState message="아직 등록한 분야가 없습니다. 인기 분야에서 선택해보세요." />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {interests.map((item) => (
              <li key={item.code}>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(item.code)}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-wefin-mint/30 bg-wefin-mint/10 px-3 py-1.5 text-sm text-wefin-text hover:border-red-300 hover:bg-wefin-red-soft"
                >
                  <span>{item.name}</span>
                  <X className="h-3.5 w-3.5 text-wefin-mint group-hover:text-wefin-red" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold text-wefin-text">인기 분야에서 추가</h2>
        {isLoadingPopular ? (
          <SkeletonRows count={2} />
        ) : popular.length === 0 ? (
          <EmptyState message="표시할 인기 분야가 없습니다." />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {popular.map((tag) => {
              const registered = registeredCodes.has(tag.code)
              return (
                <li key={tag.code}>
                  <button
                    type="button"
                    disabled={registered || isLimitReached || addMutation.isPending}
                    onClick={() => handleAddSector(tag.code, tag.name)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      registered
                        ? 'border-gray-200 bg-gray-50 text-gray-400'
                        : 'border-gray-200 bg-wefin-surface text-wefin-text hover:border-wefin-mint hover:bg-wefin-mint/5'
                    }`}
                  >
                    <span>{tag.name}</span>
                    <span className="text-xs text-wefin-subtle">{tag.clusterCount}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <ul className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="h-10 animate-pulse rounded-full bg-gray-50" />
      ))}
    </ul>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-wefin-subtle">
      {message}
    </div>
  )
}
