import {
  Banknote,
  BatteryCharging,
  Beaker,
  Bolt,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Factory,
  HeartPulse,
  Landmark,
  Search,
  Signal,
  Smartphone,
  X
} from 'lucide-react'
import { useMemo, useState } from 'react'

import StockLogo from '@/shared/ui/stock-logo'

import type { StockSearchItem } from '../model/stock.schema'
import { type OrderSide, type OrderType, useOrderForm } from '../model/use-order-form'
import { useSelectedStockStore } from '../model/use-selected-stock-store'
import { useStockSearch } from '../model/use-stock-search'

interface OrderPanelProps {
  roomId: string
  cash: number
}

type SectorOption = {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  accentClass: string
  image: string
  keywords: string[]
}

type PanelStep = 'sector' | 'keyword' | 'stock'

const PANEL_BODY_HEIGHT_CLASS = 'h-[620px]'

const SECTORS: SectorOption[] = [
  {
    id: 'energy',
    label: '에너지',
    icon: Bolt,
    accentClass: 'from-amber-400 to-orange-500',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=200&fit=crop',
    keywords: [
      '석유/가스',
      '정유',
      '석유화학',
      'LNG',
      '신재생에너지',
      '2차전지',
      '2차전지 소재',
      '수소'
    ]
  },
  {
    id: 'utilities',
    label: '유틸리티',
    icon: Signal,
    accentClass: 'from-sky-400 to-blue-500',
    image: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=400&h=200&fit=crop',
    keywords: ['전력', '가스', '수도', '신재생 발전', '에너지 인프라']
  },
  {
    id: 'materials',
    label: '소재',
    icon: Beaker,
    accentClass: 'from-violet-400 to-purple-600',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=200&fit=crop',
    keywords: ['철강', '비철금속', '화학', '정밀화학', '건자재', '제지/펄프', '비료', '신소재']
  },
  {
    id: 'industrials',
    label: '산업재',
    icon: Factory,
    accentClass: 'from-slate-400 to-slate-600',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop',
    keywords: [
      '건설',
      '플랜트',
      '기계',
      '로봇/자동화',
      '조선',
      '항공/방산',
      '물류/운송',
      '철도',
      '산업부품'
    ]
  },
  {
    id: 'consumer-discretionary',
    label: '소비재',
    icon: Smartphone,
    accentClass: 'from-rose-400 to-pink-600',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop',
    keywords: [
      '자동차',
      '자동차 부품',
      '전기차',
      '의류/패션',
      '화장품',
      '유통',
      '호텔/레저',
      '여행/항공',
      '가전',
      '콘텐츠',
      '게임',
      '외식'
    ]
  },
  {
    id: 'consumer-staples',
    label: '필수소비',
    icon: Banknote,
    accentClass: 'from-emerald-400 to-green-600',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop',
    keywords: ['식품', '음료/주류', '생활용품', '담배', '유통(마트/편의점)', '농축산']
  },
  {
    id: 'healthcare',
    label: '헬스케어',
    icon: HeartPulse,
    accentClass: 'from-red-400 to-rose-600',
    image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=200&fit=crop',
    keywords: ['제약', '바이오', '의료기기', '진단', '헬스케어 서비스']
  },
  {
    id: 'financials',
    label: '금융',
    icon: Landmark,
    accentClass: 'from-blue-400 to-indigo-600',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop',
    keywords: ['은행', '보험', '증권', '자산운용', '카드', '핀테크', '리스/캐피탈']
  },
  {
    id: 'it',
    label: 'IT',
    icon: BatteryCharging,
    accentClass: 'from-cyan-400 to-teal-600',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop',
    keywords: [
      '반도체',
      '반도체 장비',
      '반도체 소재',
      '디스플레이',
      '하드웨어',
      '소프트웨어',
      '클라우드/AI',
      '보안'
    ]
  },
  {
    id: 'communication',
    label: '통신',
    icon: Signal,
    accentClass: 'from-indigo-400 to-blue-600',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop',
    keywords: ['통신사', '인터넷 플랫폼', '광고/마케팅', '미디어', '엔터테인먼트', '게임 퍼블리싱']
  },
  {
    id: 'real-estate',
    label: '부동산',
    icon: Building2,
    accentClass: 'from-stone-400 to-stone-600',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop',
    keywords: ['리츠', '상업용 부동산', '주거용 부동산', '물류센터', '데이터센터', '부동산 개발']
  }
]

function OrderPanel({ roomId, cash }: OrderPanelProps) {
  const form = useOrderForm({ roomId, cash })
  const { clearStock, selectStock } = useSelectedStockStore()

  const [stockSearchKeyword, setStockSearchKeyword] = useState('')
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null)
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null)
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [resultMessage, setResultMessage] = useState<string | null>(null)

  const selectedSector = useMemo(
    () => SECTORS.find((sector) => sector.id === selectedSectorId) ?? null,
    [selectedSectorId]
  )

  const activeQuery = stockSearchKeyword.trim() || selectedKeyword || ''
  const { data: stocks = [], isError, isLoading } = useStockSearch(roomId, activeQuery)

  const step: PanelStep = stockSearchKeyword.trim()
    ? 'stock'
    : selectedKeyword
      ? 'stock'
      : selectedSector
        ? 'keyword'
        : 'sector'

  const isDisabled = !form.selectedStock || form.quantity === 0
  const sideLabel = form.side === 'buy' ? '매수' : '매도'

  function resetExpandedSelection() {
    clearStock()
    setExpandedSymbol(null)
    setShowConfirm(false)
  }

  function handleSearchChange(value: string) {
    resetExpandedSelection()
    setStockSearchKeyword(value)

    if (value.trim()) {
      setSelectedSectorId(null)
      setSelectedKeyword(null)
    }
  }

  function handleSelectSector(sectorId: string) {
    resetExpandedSelection()
    setStockSearchKeyword('')
    setSelectedKeyword(null)
    setSelectedSectorId(sectorId)
  }

  function handleSelectKeyword(keyword: string) {
    resetExpandedSelection()
    setStockSearchKeyword('')
    setSelectedKeyword(keyword)
  }

  function handleToggleStock(stock: StockSearchItem) {
    if (expandedSymbol === stock.symbol) {
      resetExpandedSelection()
      return
    }

    setExpandedSymbol(stock.symbol)
    setShowConfirm(false)
    selectStock(stock)
  }

  function handleGoBack() {
    resetExpandedSelection()

    if (stockSearchKeyword.trim()) {
      setStockSearchKeyword('')
      return
    }

    if (selectedKeyword) {
      setSelectedKeyword(null)
      return
    }

    if (selectedSectorId) {
      setSelectedSectorId(null)
    }
  }

  function handleResetFilters() {
    resetExpandedSelection()
    setStockSearchKeyword('')
    setSelectedSectorId(null)
    setSelectedKeyword(null)
  }

  function handleOrderClick() {
    if (isDisabled || form.isSubmitting) return
    setShowConfirm(true)
  }

  function handleConfirm() {
    setShowConfirm(false)
    form.submit({
      onSuccess: (data) => {
        const result = data.data
        const feeAndTax = result.fee + result.tax

        setResultMessage(
          `${sideLabel} 체결: ${result.stockName} ${result.quantity}주 / ${(result.price * result.quantity).toLocaleString()}원 (수수료+세금 ${feeAndTax.toLocaleString()}원)`
        )
      }
    })
  }

  const panelTitle =
    step === 'sector'
      ? '섹터를 선택해보세요'
      : step === 'keyword'
        ? `${selectedSector?.label ?? ''} 키워드`
        : stockSearchKeyword.trim()
          ? `"${stockSearchKeyword.trim()}" 검색 결과`
          : `${selectedKeyword ?? ''} 관련 종목`

  const panelDescription =
    step === 'sector'
      ? '관심 있는 섹터를 먼저 고르면 초보자도 종목을 훨씬 쉽게 찾을 수 있어요.'
      : step === 'keyword'
        ? '키워드를 하나 선택하면 해당 분류에 맞는 종목 리스트가 열립니다.'
        : '종목을 누르면 주문 패널이 펼쳐지고 다시 누르면 접힙니다.'

  return (
    <section className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-11 shrink-0 items-center px-3">
          <span className="text-sm font-semibold text-wefin-text">주문</span>
        </div>

        {resultMessage && (
          <div className="mx-3 mb-2 flex items-center justify-between rounded-lg bg-green-50 px-3 py-1.5">
            <span className="text-[11px] font-medium text-green-600">{resultMessage}</span>
            <button
              type="button"
              onClick={() => setResultMessage(null)}
              className="text-[11px] text-green-400 hover:text-green-600"
            >
              닫기
            </button>
          </div>
        )}

        <div className="mb-2 flex items-center gap-2 px-3">
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleResetFilters}
              className={`relative py-2 pl-3 pr-5 text-xs font-semibold transition-all duration-300 ${
                step === 'sector'
                  ? 'bg-wefin-mint-deep text-white shadow-md shadow-wefin-mint/20'
                  : 'bg-wefin-mint-soft/60 text-wefin-mint-deep hover:bg-wefin-mint-soft'
              }`}
              style={{
                clipPath:
                  'polygon(0 4px, 4px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 4px 100%, 0 calc(100% - 4px))'
              }}
            >
              {step !== 'sector' && <span className="mr-1 inline-block text-[10px]">✓</span>}
              {selectedSector?.label ?? '섹터'}
            </button>
            <button
              type="button"
              onClick={
                selectedSector
                  ? () => {
                      resetExpandedSelection()
                      setStockSearchKeyword('')
                      setSelectedKeyword(null)
                    }
                  : undefined
              }
              className={`relative py-2 pl-5 pr-5 text-xs font-semibold transition-all duration-300 ${
                step === 'keyword'
                  ? 'bg-wefin-mint-deep text-white shadow-md shadow-wefin-mint/20'
                  : selectedSector
                    ? step === 'stock'
                      ? 'bg-wefin-mint-soft/60 text-wefin-mint-deep hover:bg-wefin-mint-soft'
                      : 'bg-wefin-bg text-wefin-subtle/40'
                    : 'bg-wefin-bg text-wefin-subtle/40'
              }`}
              style={{
                clipPath:
                  'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)'
              }}
            >
              {step === 'stock' && <span className="mr-1 inline-block text-[10px]">✓</span>}
              {selectedKeyword ?? '키워드'}
            </button>
            <span
              className={`relative rounded-r-lg py-2 pl-5 pr-3 text-xs font-semibold transition-all duration-300 ${
                step === 'stock'
                  ? 'bg-wefin-mint-deep text-white shadow-md shadow-wefin-mint/20'
                  : 'bg-wefin-bg text-wefin-subtle/40'
              }`}
              style={{
                clipPath:
                  'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 10px 50%)'
              }}
            >
              종목
            </span>
          </div>

          {step !== 'sector' && (
            <button
              type="button"
              onClick={handleGoBack}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-wefin-bg text-wefin-subtle transition-colors hover:bg-wefin-line hover:text-wefin-text"
            >
              <ChevronLeft size={13} />
            </button>
          )}

          <div className="ml-auto flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
            <Search size={14} className="shrink-0 text-wefin-subtle" />
            <input
              type="text"
              value={stockSearchKeyword}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="종목명 또는 코드"
              className="min-w-0 flex-1 bg-transparent text-xs text-wefin-text outline-none placeholder:text-wefin-subtle"
            />
            {stockSearchKeyword && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="shrink-0 text-wefin-subtle hover:text-wefin-text"
              >
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3">
          {step === 'sector' && (
            <div className="grid grid-cols-3 gap-1.5">
              {SECTORS.map((sector) => (
                <SectorCard
                  key={sector.id}
                  sector={sector}
                  active={sector.id === selectedSectorId}
                  onClick={() => handleSelectSector(sector.id)}
                />
              ))}
            </div>
          )}

          {step === 'keyword' && selectedSector && (
            <div className="h-full overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-2">
                {selectedSector.keywords.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => handleSelectKeyword(keyword)}
                    className="rounded-2xl border border-wefin-line bg-white px-3 py-3 text-left text-sm font-semibold text-wefin-text transition-colors hover:border-wefin-mint/35 hover:bg-wefin-mint/5"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'stock' && (
            <div className="h-full overflow-y-auto pr-1">
              {isLoading ? (
                <EmptyBlock text="관련 종목을 불러오는 중이에요..." />
              ) : isError ? (
                <EmptyBlock text="종목을 불러오지 못했어요. 잠시 후 다시 시도해주세요." />
              ) : stocks.length === 0 ? (
                <EmptyBlock text="조건에 맞는 종목이 아직 없어요." />
              ) : (
                <div className="space-y-2">
                  {stocks.map((stock) => (
                    <StockAccordionItem
                      key={stock.symbol}
                      stock={stock}
                      expanded={expandedSymbol === stock.symbol}
                      form={form}
                      cash={cash}
                      onToggle={() => handleToggleStock(stock)}
                      onSubmitClick={handleOrderClick}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showConfirm && form.selectedStock && (
        <OrderConfirmDialog
          stockName={form.selectedStock.stockName}
          side={sideLabel}
          quantity={form.quantity}
          price={form.currentPrice}
          totalAmount={form.totalAmount}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </section>
  )
}

function StageBadge({
  active,
  onClick,
  children
}: {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
        active ? 'bg-wefin-mint text-white' : 'bg-wefin-bg text-wefin-subtle'
      } ${onClick ? 'cursor-pointer transition-opacity hover:opacity-85' : 'cursor-default'}`}
    >
      {children}
    </button>
  )
}

function SectorCard({
  sector,
  active,
  onClick
}: {
  sector: SectorOption
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative h-[72px] overflow-hidden rounded-xl text-left transition-all duration-300 ${
        active
          ? 'ring-2 ring-wefin-mint shadow-lg shadow-wefin-mint/20 scale-[1.02]'
          : 'shadow-sm hover:shadow-lg hover:-translate-y-0.5'
      }`}
    >
      <img
        src={sector.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover brightness-[0.3] saturate-[0.6] transition-all duration-500 group-hover:brightness-[0.5] group-hover:saturate-100 group-hover:scale-110"
      />
      <div
        className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r ${sector.accentClass}`}
        style={{ mixBlendMode: 'soft-light' }}
      />
      <div className="relative flex h-full items-end justify-between p-2.5">
        <div>
          <p className="text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            {sector.label}
          </p>
          <p className="text-[11px] font-medium text-white/70">{sector.keywords.length}개 키워드</p>
        </div>
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/0 transition-all duration-300 group-hover:bg-white/20">
          <ChevronDown
            size={12}
            className="-rotate-90 text-white/0 transition-all duration-300 group-hover:text-white/80"
          />
        </div>
      </div>
    </button>
  )
}

function StockAccordionItem({
  stock,
  expanded,
  form,
  cash,
  onToggle,
  onSubmitClick
}: {
  stock: StockSearchItem
  expanded: boolean
  form: ReturnType<typeof useOrderForm>
  cash: number
  onToggle: () => void
  onSubmitClick: () => void
}) {
  const panelId = `stock-order-panel-${stock.symbol}`

  return (
    <div className="overflow-hidden rounded-xl border border-wefin-line bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-wefin-bg/40"
      >
        <StockLogo code={stock.symbol} name={stock.stockName} size={32} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-wefin-text">{stock.stockName}</p>
          <p className="text-[11px] text-wefin-subtle">{stock.symbol}</p>
        </div>
        <span className="text-sm font-bold tabular-nums text-wefin-text">
          {stock.price.toLocaleString()}원
        </span>
        {expanded ? (
          <ChevronUp size={14} className="text-wefin-subtle" />
        ) : (
          <ChevronDown size={14} className="text-wefin-subtle" />
        )}
      </button>

      {expanded && (
        <div id={panelId} className="space-y-2.5 border-t border-wefin-line px-3 py-3">
          <SideTabs side={form.side} onChange={form.setSide} />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-wefin-subtle">수량</span>
              <span className="text-[11px] text-wefin-subtle">최대 {form.maxQuantity}주</span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <StepButton onClick={form.decrement} label="수량 감소">
                -
              </StepButton>
              <input
                type="text"
                inputMode="numeric"
                className="min-w-0 flex-1 rounded-lg border border-wefin-line py-1.5 text-center text-sm font-bold text-wefin-text outline-none"
                value={form.quantity === 0 ? '' : form.quantity}
                placeholder="0"
                onChange={(event) => {
                  const raw = event.target.value.replace(/[^0-9]/g, '')
                  form.setQuantityRaw(raw === '' ? 0 : parseInt(raw, 10))
                }}
              />
              <StepButton onClick={form.increment} label="수량 증가">
                +
              </StepButton>
            </div>
            <div className="mt-1.5 flex gap-1">
              {[10, 25, 50, 100].map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => form.setPercent(percent)}
                  className="flex-1 rounded-md bg-wefin-bg py-1 text-[10px] font-semibold text-wefin-subtle transition-colors hover:bg-wefin-line hover:text-wefin-text"
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 border-t border-wefin-line/50 pt-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-wefin-subtle">주문 금액</span>
              <span className="font-bold tabular-nums text-wefin-text">
                {form.totalAmount.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-wefin-subtle">잔고</span>
              <span className="tabular-nums text-wefin-subtle">{cash.toLocaleString()}원</span>
            </div>
          </div>

          {form.errorMessage && <p className="text-[11px] text-red-500">{form.errorMessage}</p>}

          <button
            type="button"
            disabled={form.quantity === 0 || form.isSubmitting}
            onClick={onSubmitClick}
            className={`w-full rounded-lg py-2 text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 ${
              form.side === 'buy' ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            {form.isSubmitting ? '주문 중...' : form.side === 'buy' ? '매수' : '매도'}
          </button>
        </div>
      )}
    </div>
  )
}

function SideTabs({ side, onChange }: { side: OrderSide; onChange: (next: OrderSide) => void }) {
  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={() => onChange('buy')}
        className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-colors ${
          side === 'buy' ? 'bg-red-500 text-white' : 'bg-wefin-bg text-wefin-subtle'
        }`}
      >
        매수
      </button>
      <button
        type="button"
        onClick={() => onChange('sell')}
        className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-colors ${
          side === 'sell' ? 'bg-blue-500 text-white' : 'bg-wefin-bg text-wefin-subtle'
        }`}
      >
        매도
      </button>
    </div>
  )
}

function TypeTabs({ type, onChange }: { type: OrderType; onChange: (next: OrderType) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-wefin-line">
        <TabButton
          active={type === 'limit'}
          onClick={() => onChange('limit')}
          activeClass="bg-wefin-mint shadow-sm shadow-wefin-mint/20"
          size="sm"
          disabled
        >
          지정가
        </TabButton>
        <TabButton
          active={type === 'market'}
          onClick={() => onChange('market')}
          activeClass="bg-wefin-text"
          size="sm"
        >
          시장가
        </TabButton>
      </div>
      <p className="text-[11px] text-wefin-subtle">현재 게임 주문은 시장가만 지원합니다.</p>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  activeClass,
  size = 'md',
  disabled = false,
  children
}: {
  active: boolean
  onClick: () => void
  activeClass: string
  size?: 'sm' | 'md'
  disabled?: boolean
  children: React.ReactNode
}) {
  const sizeClass = size === 'sm' ? 'py-2 text-xs' : 'py-2.5 text-sm'
  const stateClass = active ? `${activeClass} text-white` : 'text-wefin-subtle'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 rounded-xl font-bold transition-all ${sizeClass} ${stateClass} ${
        disabled ? 'cursor-not-allowed opacity-45' : ''
      }`}
    >
      {children}
    </button>
  )
}

interface QuantityControlProps {
  quantity: number
  maxQuantity: number
  onIncrement: () => void
  onDecrement: () => void
  onChange: (value: number) => void
  onPercent: (percent: number) => void
}

function QuantityControl({
  quantity,
  maxQuantity,
  onIncrement,
  onDecrement,
  onChange,
  onPercent
}: QuantityControlProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-bold text-wefin-subtle">수량</label>
        <span className="text-xs text-wefin-subtle">최대 {maxQuantity}주</span>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <StepButton onClick={onDecrement} label="수량 감소">
          -
        </StepButton>
        <input
          type="text"
          inputMode="numeric"
          className="flex-1 rounded-xl border border-wefin-line bg-white py-2 text-center text-lg font-bold text-wefin-text focus:outline-none"
          value={quantity === 0 ? '' : quantity}
          placeholder="0"
          onChange={(event) => {
            const raw = event.target.value.replace(/[^0-9]/g, '')
            onChange(raw === '' ? 0 : parseInt(raw, 10))
          }}
        />
        <StepButton onClick={onIncrement} label="수량 증가">
          +
        </StepButton>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {[10, 25, 50, 100].map((percent) => (
          <button
            key={percent}
            type="button"
            onClick={() => onPercent(percent)}
            className="rounded-xl border border-wefin-line bg-white py-1.5 text-xs font-bold text-wefin-text shadow-sm transition-colors hover:bg-wefin-bg"
          >
            {percent}%
          </button>
        ))}
      </div>
    </div>
  )
}

function StepButton({
  onClick,
  label,
  children
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-wefin-line text-sm font-bold text-wefin-text"
    >
      {children}
    </button>
  )
}

interface SummaryRowsProps {
  type: OrderType
  currentPrice: number
  quantity: number
  totalAmount: number
  cash: number
}

function SummaryRows({ type, currentPrice, quantity, totalAmount, cash }: SummaryRowsProps) {
  const priceLabel = type === 'market' ? '시장가' : `${currentPrice.toLocaleString()}원`

  return (
    <div className="space-y-2 border-t border-wefin-line pt-3">
      <SummaryRow label="주문 단가" value={priceLabel} />
      <SummaryRow label="주문 수량" value={`${quantity}주`} />
      <div className="flex justify-between pt-1 text-sm">
        <span className="font-bold text-wefin-text">총 주문 금액</span>
        <span className="font-bold text-wefin-text">{totalAmount.toLocaleString()}원</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-wefin-subtle">보유 현금</span>
        <span className="text-wefin-subtle">{cash.toLocaleString()}원</span>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-wefin-subtle">{label}</span>
      <span className="font-bold text-wefin-text">{value}</span>
    </div>
  )
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-wefin-line px-4 py-5 text-center text-sm text-wefin-subtle">
      {text}
    </div>
  )
}

interface OrderConfirmDialogProps {
  stockName: string
  side: string
  quantity: number
  price: number
  totalAmount: number
  onConfirm: () => void
  onCancel: () => void
}

function OrderConfirmDialog({
  stockName,
  side,
  quantity,
  price,
  totalAmount,
  onConfirm,
  onCancel
}: OrderConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-80 rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-center text-base font-bold text-wefin-text">주문 확인</h3>

        <div className="space-y-2 rounded-xl bg-wefin-bg p-4">
          <div className="flex justify-between text-xs">
            <span className="text-wefin-subtle">종목</span>
            <span className="font-bold text-wefin-text">{stockName}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-wefin-subtle">구분</span>
            <span className={`font-bold ${side === '매수' ? 'text-red-500' : 'text-blue-500'}`}>
              {side}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-wefin-subtle">수량</span>
            <span className="font-bold text-wefin-text">{quantity}주</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-wefin-subtle">단가</span>
            <span className="font-bold text-wefin-text">{price.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between border-t border-wefin-line pt-2 text-sm">
            <span className="font-bold text-wefin-text">총 금액</span>
            <span className="font-bold text-wefin-text">{totalAmount.toLocaleString()}원</span>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-wefin-line bg-white py-2.5 text-sm font-bold text-wefin-subtle transition-colors hover:bg-wefin-bg"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-colors ${
              side === '매수' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {side} 확인
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderPanel
