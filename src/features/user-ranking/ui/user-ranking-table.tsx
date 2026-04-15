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
    <div className="space-y-4">
      {myRank && <MyRankBadge myRank={myRank} />}

      <div>
        <div className="flex items-center gap-3 border-b border-wefin-line py-2 text-xs text-wefin-subtle">
          <span className="w-10">순위</span>
          <span className="w-28">닉네임</span>
          <span className="w-14 text-right">거래횟수</span>
          <span className="flex-1 text-right">실현수익</span>
        </div>
        <div className="divide-y divide-wefin-line">
          {rankings.length === 0 ? (
            <Message text="아직 랭킹이 없어요" />
          ) : (
            rankings.map((item) => <RankingRow key={`${item.rank}-${item.nickname}`} item={item} />)
          )}
        </div>
      </div>
    </div>
  )
}

function Message({ text }: { text: string }) {
  return <p className="py-10 text-center text-xs text-wefin-subtle">{text}</p>
}
