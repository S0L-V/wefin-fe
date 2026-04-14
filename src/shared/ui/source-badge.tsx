const INITIAL_COLORS = ['#2b3a4a', '#24a8ab', '#6b7b8d', '#3b82f6', '#8b5cf6']

type Size = 'sm' | 'md'

type Source = {
  publisherName: string
}

type Props = {
  sourceCount: number
  /** publisher 아이콘을 표시할 출처 목록. 없으면 숫자 배지만 렌더한다 */
  sources?: Source[]
  size?: Size
}

/**
 * "N개 출처" 배지. publisher 이니셜 아이콘 + 카운트 형태.
 *
 * - {@link sources}를 전달하면 상위 2~3개 publisher 이니셜 원형 아이콘을 앞에 표시
 * - 전달하지 않거나 빈 배열이면 숫자 배지만 렌더 (market trends overview 등에서 사용)
 */
function SourceBadge({ sourceCount, sources, size = 'sm' }: Props) {
  const visibleSources = sources ? sources.slice(0, size === 'md' ? 3 : 2) : []
  const classes = STYLES[size]

  return (
    <span className={classes.container}>
      {visibleSources.length > 0 && (
        <span className={classes.iconRow}>
          {visibleSources.map((src, i) => (
            <span
              key={`${src.publisherName}-${i}`}
              className={classes.icon}
              style={{ backgroundColor: INITIAL_COLORS[i % INITIAL_COLORS.length] }}
            >
              {getInitial(src.publisherName)}
            </span>
          ))}
        </span>
      )}
      {sourceCount}개 출처
    </span>
  )
}

function getInitial(name: string): string {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

const STYLES: Record<Size, { container: string; iconRow: string; icon: string }> = {
  sm: {
    container:
      'inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-[10px] leading-none text-wefin-subtle',
    iconRow: 'flex -space-x-1',
    icon: 'flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] font-bold text-white ring-1 ring-white'
  },
  md: {
    container:
      'inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-wefin-subtle',
    iconRow: 'flex -space-x-1.5',
    icon: 'flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-white'
  }
}

export default SourceBadge
