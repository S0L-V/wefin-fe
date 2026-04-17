import { useDailyRankingQuery } from '../model/use-user-ranking-queries'
import MyRankBadge from './my-rank-badge'
import RankingRow from './ranking-row'

export default function UserRankingTable() {
  const { data, isLoading, isError } = useDailyRankingQuery()

  if (isLoading) return <Message text="불러오는 중..." />
  if (isError) return <Message text="랭킹을 불러올 수 없어요" />

  const rankings = data?.rankings ?? []
  const myRank = data?.myRank ?? null

  return (
    <div>
      {myRank && (
        <div className="mb-4">
          <MyRankBadge myRank={myRank} />
        </div>
      )}

      {rankings.length === 0 ? (
        <Message text="아직 랭킹이 없어요" />
      ) : (
        <div className="divide-y divide-wefin-line/50">
          {rankings.map((item) => (
            <RankingRow key={`${item.rank}-${item.nickname}`} item={item} />
          ))}
        </div>
      )}
      <p className="py-4 text-center text-sm text-wefin-subtle">거래하고 순위에 도전하세요</p>
    </div>
  )
}

function Message({ text }: { text: string }) {
  return <p className="py-10 text-center text-xs text-wefin-subtle">{text}</p>
}
