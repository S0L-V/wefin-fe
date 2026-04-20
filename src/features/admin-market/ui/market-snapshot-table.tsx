import { useMarketSnapshotsQuery } from '../model/use-market-snapshots-query'

function MarketSnapshotTable() {
  const { data, isLoading, isError } = useMarketSnapshotsQuery()

  if (isLoading) return <p className="text-sm text-wefin-subtle">로딩 중...</p>
  if (isError) return <p className="text-sm text-wefin-red">조회 실패</p>
  if (!data || data.length === 0) return <p className="text-sm text-wefin-subtle">데이터 없음</p>

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-wefin-line text-left text-wefin-subtle">
          <th className="py-2">지표</th>
          <th className="py-2 text-right">현재 값</th>
          <th className="py-2 text-right">변동률</th>
          <th className="py-2 text-right">변동 값</th>
          <th className="py-2 text-center">방향</th>
        </tr>
      </thead>
      <tbody>
        {data.map((snapshot) => (
          <tr key={snapshot.metricType} className="border-b border-wefin-line/50">
            <td className="py-3 font-medium text-wefin-text">{snapshot.label}</td>
            <td className="py-3 text-right">{snapshot.value.toLocaleString()}</td>
            <td className="py-3 text-right">
              {snapshot.changeRate != null ? `${snapshot.changeRate}%` : '-'}
            </td>
            <td className="py-3 text-right">
              {snapshot.changeValue != null ? snapshot.changeValue.toLocaleString() : '-'}
            </td>
            <td className="py-3 text-center">
              <span
                className={
                  snapshot.changeDirection === 'UP'
                    ? 'text-wefin-red'
                    : snapshot.changeDirection === 'DOWN'
                      ? 'text-blue-400'
                      : 'text-wefin-subtle'
                }
              >
                {snapshot.changeDirection === 'UP'
                  ? '▲'
                  : snapshot.changeDirection === 'DOWN'
                    ? '▼'
                    : '-'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default MarketSnapshotTable
