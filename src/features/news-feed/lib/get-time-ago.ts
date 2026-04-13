export function getTimeAgo(dateStr: string): string {
  const published = new Date(dateStr).getTime()
  if (Number.isNaN(published)) return '알 수 없음'

  const diffMs = Math.max(0, Date.now() - published)

  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`

  const diffHours = Math.floor(diffMs / 3_600_000)
  if (diffHours < 24) return `${diffHours}시간 전`

  const diffDays = Math.floor(diffMs / 86_400_000)
  return `${diffDays}일 전`
}
