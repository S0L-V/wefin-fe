const RANK_STYLES = [
  {
    gradient: 'from-yellow-300 via-amber-400 to-amber-600',
    text: 'text-amber-900',
    ring: 'ring-amber-300/50'
  },
  {
    gradient: 'from-slate-200 via-slate-300 to-slate-500',
    text: 'text-slate-700',
    ring: 'ring-slate-300/50'
  },
  {
    gradient: 'from-orange-300 via-amber-500 to-amber-800',
    text: 'text-amber-950',
    ring: 'ring-amber-400/40'
  }
]

interface RankBadgeProps {
  rank: number | null
  size?: 'sm' | 'md'
}

export default function RankBadge({ rank, size = 'md' }: RankBadgeProps) {
  const sizeClass = size === 'sm' ? 'h-6 w-6' : 'h-10 w-10'
  const fontSize = size === 'sm' ? 'text-[11px]' : 'text-[16px]'

  if (rank != null && rank >= 1 && rank <= 3) {
    const s = RANK_STYLES[rank - 1]
    return (
      <div
        className={`relative flex ${sizeClass} items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${s.gradient} ring-2 ${s.ring}`}
      >
        <span
          className={`relative z-10 font-num ${fontSize} font-black tracking-tight ${s.text}`}
          style={{ textShadow: '0 1px 0 rgba(255,255,255,0.5), 0 -1px 0 rgba(0,0,0,0.1)' }}
        >
          {rank}
        </span>
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/35 to-transparent"
          style={{ height: '45%' }}
        />
      </div>
    )
  }

  return (
    <div
      className={`flex ${sizeClass} items-center justify-center rounded-full bg-wefin-surface-2`}
    >
      <span className={`font-num ${fontSize} font-bold text-wefin-muted`}>{rank ?? '-'}</span>
    </div>
  )
}
