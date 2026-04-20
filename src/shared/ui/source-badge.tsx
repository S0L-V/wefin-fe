const INITIAL_COLORS = ['#0B8577', '#14B8A6', '#2A3230', '#0EA394', '#5E6A66']

type Size = 'sm' | 'md'

type Source = {
  publisherName: string
}

type Props = {
  sourceCount: number
  sources?: Source[]
  size?: Size
}

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
  const trimmed = name?.trim() ?? ''
  if (trimmed.length === 0) return '?'
  return trimmed.charAt(0).toUpperCase()
}

const STYLES: Record<Size, { container: string; iconRow: string; icon: string }> = {
  sm: {
    container:
      'inline-flex items-center gap-1.5 rounded-full border border-wefin-line bg-wefin-surface px-2.5 py-1 text-[11px] font-semibold leading-none text-wefin-subtle',
    iconRow: 'flex -space-x-1',
    icon: 'flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white ring-1 ring-wefin-surface'
  },
  md: {
    container:
      'inline-flex items-center gap-2 rounded-full border border-wefin-line bg-wefin-surface px-3 py-1.5 text-xs font-semibold text-wefin-subtle',
    iconRow: 'flex -space-x-1.5',
    icon: 'flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-wefin-surface'
  }
}

export default SourceBadge
