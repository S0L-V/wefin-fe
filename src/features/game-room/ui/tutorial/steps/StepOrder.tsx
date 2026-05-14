import { motion } from 'framer-motion'
import { ChevronDown, ChevronLeft, Search } from 'lucide-react'

const SECTOR_IMAGES: Record<string, string> = {
  에너지: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
  IT: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  산업재: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
  헬스케어: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
  금융: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
  소재: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80'
}

const KEYWORD_IMAGES: Record<string, string> = {
  반도체: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  소프트웨어: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  하드웨어: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80',
  디스플레이: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'
}

function FunnelStep({
  label,
  active,
  completed,
  position
}: {
  label: string
  active: boolean
  completed: boolean
  position: 'first' | 'middle' | 'last'
}) {
  const isHighlight = active || completed
  const clipFirst = 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)'
  const clipMiddle =
    'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)'
  const clipLast = 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 12px 50%)'
  const clip = position === 'first' ? clipFirst : position === 'last' ? clipLast : clipMiddle

  return (
    <div
      className={`relative flex-1 overflow-hidden py-2 text-center text-[11px] font-bold transition-all ${
        isHighlight ? 'bg-wefin-mint-deep text-white' : 'bg-wefin-surface-2 text-wefin-muted'
      }`}
      style={{ clipPath: clip }}
    >
      {isHighlight && (
        <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
      <span className="relative">{label}</span>
    </div>
  )
}

function SectorCard({
  name,
  keywordCount,
  delay
}: {
  name: string
  keywordCount: number
  delay: number
}) {
  const bgImage = SECTOR_IMAGES[name]
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative min-h-[70px] overflow-hidden rounded-2xl text-left shadow-sm"
    >
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover brightness-[0.55] saturate-[0.6] transition-all duration-700 group-hover:scale-[1.08] group-hover:brightness-[0.9] group-hover:saturate-100"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="relative flex h-full flex-col justify-end p-3">
        <div
          className="text-[15px] font-bold tracking-tight text-white"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
        >
          {name}
        </div>
        <div
          className="text-[11px] font-semibold text-white/80"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
        >
          {keywordCount}개 키워드
        </div>
      </div>
    </motion.div>
  )
}

export function KeywordCard({ keyword, delay }: { keyword: string; delay: number }) {
  const bgImage = KEYWORD_IMAGES[keyword]
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative min-h-[60px] overflow-hidden rounded-xl text-left shadow-sm"
    >
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover brightness-[0.5] saturate-[0.6] transition-all duration-700 group-hover:scale-[1.08] group-hover:brightness-[0.85] group-hover:saturate-100"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="relative flex h-full flex-col justify-end p-3">
        <div
          className="text-[15px] font-bold text-white"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
        >
          {keyword}
        </div>
      </div>
    </motion.div>
  )
}

export default function StepOrder() {
  return (
    <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-2">
      {/* Order Panel - Sector Step */}
      <div className="flex flex-col overflow-hidden rounded-xl border border-wefin-line bg-wefin-surface">
        <div className="flex h-12 shrink-0 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-wefin-text">주문</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-wefin-surface-2 px-3 py-1.5">
            <Search size={13} className="shrink-0 text-wefin-muted" />
            <span className="text-xs text-wefin-muted">종목명 또는 코드</span>
          </div>
        </div>

        {/* FunnelStep breadcrumb */}
        <div className="mb-2 flex px-4">
          <FunnelStep label="섹터" active completed={false} position="first" />
          <FunnelStep label="키워드" active={false} completed={false} position="middle" />
          <FunnelStep label="종목" active={false} completed={false} position="last" />
        </div>

        {/* Sector Grid with images */}
        <div className="min-h-0 flex-1 overflow-hidden px-4 pb-3">
          <div className="grid h-full grid-cols-3 auto-rows-fr gap-2">
            {[
              { name: '에너지', count: 8 },
              { name: 'IT', count: 8 },
              { name: '산업재', count: 9 },
              { name: '헬스케어', count: 5 },
              { name: '금융', count: 7 },
              { name: '소재', count: 6 }
            ].map((sector, i) => (
              <SectorCard
                key={sector.name}
                name={sector.name}
                keywordCount={sector.count}
                delay={0.2 + i * 0.08}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Order Form - expanded stock accordion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col overflow-hidden rounded-xl border border-wefin-line bg-wefin-surface"
      >
        {/* Header with back + funnel showing IT > 반도체 > 종목 */}
        <div className="flex h-12 shrink-0 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-wefin-text">주문</span>
            <button className="flex items-center gap-0.5 rounded-full bg-wefin-surface-2 px-2 py-0.5 text-[11px] font-medium text-wefin-subtle">
              <ChevronLeft size={11} /> 뒤로
            </button>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-wefin-surface-2 px-3 py-1.5">
            <Search size={13} className="shrink-0 text-wefin-muted" />
            <span className="text-xs text-wefin-muted">종목명 또는 코드</span>
          </div>
        </div>

        <div className="mb-2 flex px-4">
          <FunnelStep label="섹터" active={false} completed position="first" />
          <FunnelStep label="IT" active={false} completed position="middle" />
          <FunnelStep label="반도체" active completed={false} position="last" />
        </div>

        {/* Stock accordion item */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 space-y-2">
          <div className="overflow-hidden rounded-xl border border-wefin-line bg-wefin-surface">
            <button className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wefin-surface-2 text-[10px] font-bold text-wefin-subtle">
                삼
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-wefin-text">삼성전자</p>
                <p className="text-[11px] text-wefin-muted">005930</p>
              </div>
              <span className="font-num text-sm font-bold text-wefin-text">62,500원</span>
              <ChevronDown size={14} className="rotate-180 text-wefin-muted" />
            </button>

            <div className="space-y-2.5 border-t border-wefin-line px-3 py-3">
              {/* Side tabs */}
              <div className="flex gap-1">
                <div className="flex-1 rounded-md bg-wefin-red py-1.5 text-center text-xs font-bold text-white">
                  매수
                </div>
                <div className="flex-1 rounded-md bg-wefin-surface-2 py-1.5 text-center text-xs font-bold text-wefin-subtle">
                  매도
                </div>
              </div>

              {/* Quantity */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-wefin-subtle">수량</span>
                  <span className="text-[11px] text-wefin-muted">최대 800주</span>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <div className="min-w-0 flex-1 rounded-lg border border-wefin-line py-1.5 text-center text-sm font-bold text-wefin-text">
                    100
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-wefin-line text-base font-extrabold text-wefin-text">
                    -
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-wefin-line text-base font-extrabold text-wefin-text">
                    +
                  </div>
                </div>
                <div className="mt-1.5 flex gap-1">
                  {[10, 25, 50, 100].map((p) => (
                    <div
                      key={p}
                      className="flex-1 rounded bg-wefin-surface-2 py-0.5 text-center text-[9px] font-semibold text-wefin-subtle"
                    >
                      {p}%
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1 border-t border-wefin-line pt-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-wefin-subtle">주문 금액</span>
                  <span className="font-num font-bold text-wefin-text">6,250,000원</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-wefin-subtle">잔고</span>
                  <span className="font-num text-wefin-muted">42,350,000원</span>
                </div>
              </div>

              <motion.button
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-full rounded-lg bg-wefin-red py-2 text-sm font-bold text-white"
              >
                매수
              </motion.button>
            </div>
          </div>

          {/* Another collapsed stock */}
          <div className="overflow-hidden rounded-xl border border-wefin-line bg-wefin-surface">
            <button className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wefin-surface-2 text-[10px] font-bold text-wefin-subtle">
                S
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-wefin-text">SK하이닉스</p>
                <p className="text-[11px] text-wefin-muted">000660</p>
              </div>
              <span className="font-num text-sm font-bold text-wefin-text">128,500원</span>
              <ChevronDown size={14} className="text-wefin-muted" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
