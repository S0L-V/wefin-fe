import { ChevronDown, ChevronLeft, ChevronUp, Search, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import StockLogo from '@/shared/ui/stock-logo'

import type { SectorItem, StockSearchItem } from '../model/stock.schema'
import { type OrderSide, useOrderForm } from '../model/use-order-form'
import { useSelectedStockStore } from '../model/use-selected-stock-store'
import {
  useSectorKeywords,
  useSectors,
  useSectorStocks,
  useStockSearch
} from '../model/use-stock-search'

interface OrderPanelProps {
  roomId: string
  cash: number
}

type PanelStep = 'sector' | 'keyword' | 'stock'

const SECTOR_DESC: Record<string, string> = {
  에너지: '석유, 가스, 신재생 에너지 관련 기업',
  유틸리티: '전력, 가스, 수도 등 공공 인프라',
  소재: '철강, 화학, 비철금속 등 원자재',
  산업재: '기계, 건설, 조선, 항공 등 제조업',
  소비재: '자동차, 가전, 의류 등 선택 소비',
  필수소비: '식품, 생활용품, 유통 등 필수재',
  헬스케어: '제약, 바이오, 의료기기',
  금융: '은행, 증권, 보험, 카드사',
  IT: '반도체, 소프트웨어, 하드웨어',
  통신: '이동통신, 인터넷 서비스',
  부동산: '건물, 토지, 리츠(REITs)',
  경기소비재: '패션, 여행, 엔터테인먼트',
  필수소비재: '식음료, 담배, 생필품',
  커뮤니케이션서비스: '미디어, 게임, 광고'
}

const KEYWORD_DESC: Record<string, string> = {
  담배: 'KT&G 등 담배 제조/판매',
  식품: '가공식품, 음식료 제조업체',
  생활용품: '세제, 위생용품 등 일용소비재',
  '유통(마트/편의점)': '대형마트, 편의점 프랜차이즈',
  '음료/주류': '음료수, 맥주, 소주 제조사',
  반도체: '메모리, 비메모리 칩 제조',
  소프트웨어: 'SI, 클라우드, SaaS 기업',
  하드웨어: 'PC, 서버, 네트워크 장비',
  자동차: '완성차, 부품 제조사',
  화학: '석유화학, 정밀화학 소재',
  철강: '철강 제조, 가공, 유통',
  건설: '토목, 건축, 플랜트 시공',
  조선: '선박 건조, 해양 플랜트',
  항공: '항공사, 공항 운영',
  은행: '시중은행, 특수은행',
  증권: '증권사, 투자은행',
  보험: '생명보험, 손해보험',
  제약: '의약품 개발, 제조',
  바이오: '바이오시밀러, 신약 개발',
  의료기기: '진단장비, 치료기기',
  태양광: '태양전지, 모듈 제조',
  풍력: '풍력발전 터빈, 부품',
  원자력: '원전 건설, 핵연료',
  전기차: 'EV 완성차, 충전 인프라',
  배터리: '2차전지 셀, 소재',
  게임: '온라인, 모바일 게임사',
  엔터테인먼트: '기획사, 콘텐츠 제작',
  미디어: '방송, 신문, OTT',
  통신서비스: '이동통신, 유선통신',
  방산: '무기체계, 방위산업',
  물류: '택배, 해운, 항공화물',
  패션: '의류, 잡화 브랜드',
  화장품: '스킨케어, 색조 화장품',
  호텔: '숙박, 리조트 운영',
  카드: '신용카드, 결제 서비스',
  자산운용: '펀드, 투자신탁 운용사',
  '리스/캐피탈': '할부금융, 장비/차량 리스',
  기계: '산업용 기계, 로봇',
  전기장비: '변압기, 배전반, 전선',
  운송: '해운, 육상운송, 철도',
  비철금속: '구리, 알루미늄, 아연',
  제지: '종이, 포장재 제조',
  카지노: '카지노, 복합리조트'
}

const KEYWORD_IMAGES: Record<string, string> = {
  담배: 'https://images.unsplash.com/photo-1474649107449-ea4f014b7e9f?w=800&q=80',
  식품: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80',
  생활용품: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&q=80',
  '유통(마트/편의점)': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
  '음료/주류': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80',
  반도체: '/images/keyword-semiconductor.jpg',
  소프트웨어: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  하드웨어: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80',
  자동차: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
  화학: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
  철강: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
  건설: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  조선: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80',
  항공: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=800&q=80',
  은행: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=800&q=80',
  증권: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
  보험: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
  제약: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80',
  바이오: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
  의료기기: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80',
  태양광: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
  풍력: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=800&q=80',
  원자력: 'https://images.unsplash.com/photo-1591621544896-356ced43ea8e?w=800&q=80',
  전기차: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
  배터리: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
  게임: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
  엔터테인먼트: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  미디어: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80',
  통신서비스: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  방산: 'https://images.unsplash.com/photo-1579912437766-7896df6d3cd3?w=800&q=80',
  물류: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
  패션: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
  화장품: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
  호텔: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  카지노: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&q=80',
  카드: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&q=80',
  자산운용: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  '리스/캐피탈': 'https://images.unsplash.com/photo-1589666564459-93cdd3ab856a?w=800&q=80',
  기계: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80',
  전기장비: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
  운송: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=800&q=80',
  비철금속: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=800&q=80',
  제지: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&q=80',
  '제지/펄프': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&q=80',
  부동산개발: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  철도: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80',
  건자재: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  산업부품: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&q=80',
  '자동차 부품': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
  '물류/운송': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
  '항공/방산': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&q=80',
  신재생: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
  신재생에너지: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
  '석유/가스': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=80',
  석유가스: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=80',
  에너지인프라: '/images/sector-energy-infra.jpg',
  '에너지 인프라': '/images/sector-energy-infra.jpg',
  진단: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80',
  '헬스케어 서비스': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
  가전: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
  유통: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
  콘텐츠: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
  '의류/패션': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
  '호텔/레저': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  '광고/마케팅': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
  통신사: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  '인터넷 플랫폼': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  디스플레이: '/images/keyword-display.jpg',
  '클라우드/AI': '/images/keyword-cloud-ai.jpg',
  섬유: 'https://images.unsplash.com/photo-1558171813-01ed3d751f10?w=800&q=80',
  유리: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&q=80',
  시멘트: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  플라스틱: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&q=80',
  가스: 'https://images.unsplash.com/photo-1543674892-7d64d45df18b?w=800&q=80',
  전력: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
  수도: 'https://images.unsplash.com/photo-1538300342682-cf57afb97285?w=800&q=80',
  인터넷: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  광고: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
  교육: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
  여행: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
  음식료: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'
}

const SECTOR_IMAGES: Record<string, string> = {
  에너지: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
  유틸리티: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&q=80',
  소재: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
  산업재: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
  소비재: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
  필수소비: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
  헬스케어: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
  금융: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
  IT: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  통신: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  부동산: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  경기소비재: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
  필수소비재: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
  커뮤니케이션서비스: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'
}

function OrderPanel({ roomId, cash }: OrderPanelProps) {
  const form = useOrderForm({ roomId, cash })
  const { clearStock, selectStock } = useSelectedStockStore()

  const [stockSearchKeyword, setStockSearchKeyword] = useState('')
  const [selectedSectorName, setSelectedSectorName] = useState<string | null>(null)
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null)
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const { data: sectors = [] } = useSectors(roomId)
  const { data: keywords = [] } = useSectorKeywords(roomId, selectedSectorName)
  const {
    data: sectorStocks = [],
    isLoading: isSectorStocksLoading,
    isError: isSectorStocksError
  } = useSectorStocks(roomId, selectedSectorName, selectedKeyword)

  const searchQuery = stockSearchKeyword.trim()
  const {
    data: searchStocks = [],
    isLoading: isSearchLoading,
    isError: isSearchError
  } = useStockSearch(roomId, searchQuery)

  const stocks = searchQuery ? searchStocks : sectorStocks
  const isLoading = searchQuery ? isSearchLoading : isSectorStocksLoading
  const isError = searchQuery ? isSearchError : isSectorStocksError

  const step: PanelStep = stockSearchKeyword.trim()
    ? 'stock'
    : selectedKeyword
      ? 'stock'
      : selectedSectorName
        ? 'keyword'
        : 'sector'

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
      setSelectedSectorName(null)
      setSelectedKeyword(null)
    }
  }

  function handleSelectSector(sectorName: string) {
    resetExpandedSelection()
    setStockSearchKeyword('')
    setSelectedKeyword(null)
    setSelectedSectorName(sectorName)
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
    requestAnimationFrame(() => {
      document
        .getElementById(`stock-${stock.symbol}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
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
    if (selectedSectorName) {
      setSelectedSectorName(null)
    }
  }

  function handleResetFilters() {
    resetExpandedSelection()
    setStockSearchKeyword('')
    setSelectedSectorName(null)
    setSelectedKeyword(null)
  }

  function handleOrderClick() {
    if (!form.selectedStock || form.quantity === 0 || form.isSubmitting) return
    setShowConfirm(true)
  }

  function handleConfirm() {
    setShowConfirm(false)
    form.submit({
      onSuccess: (data) => {
        const result = data.data
        const feeAndTax = Math.floor(result.fee + result.tax)
        toast.success(`${sideLabel} 체결`, {
          description: `${result.stockName} ${result.quantity}주 / ${(result.price * result.quantity).toLocaleString()}원 (수수료+세금 ${feeAndTax.toLocaleString()}원)`
        })
      }
    })
  }

  return (
    <section className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-wefin-text">주문</span>
            {step !== 'sector' && (
              <button
                type="button"
                onClick={handleGoBack}
                className="flex items-center gap-0.5 rounded-full bg-wefin-surface-2 px-2 py-0.5 text-[11px] font-medium text-wefin-subtle transition-colors hover:text-wefin-text"
              >
                <ChevronLeft size={11} />
                뒤로
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-wefin-surface-2 px-3 py-1.5">
            <Search size={13} className="shrink-0 text-wefin-muted" />
            <input
              type="text"
              value={stockSearchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="종목명 또는 코드"
              className="w-28 bg-transparent text-xs text-wefin-text outline-none placeholder:text-wefin-muted"
            />
            {stockSearchKeyword && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="text-wefin-muted hover:text-wefin-text"
              >
                <X size={10} />
              </button>
            )}
          </div>
        </div>

        <div className="mb-2 flex px-4">
          <FunnelStep
            label="섹터"
            active={step === 'sector'}
            completed={!!selectedSectorName}
            onClick={handleResetFilters}
            position="first"
          />
          <FunnelStep
            label={selectedSectorName ?? '키워드'}
            active={step === 'keyword'}
            completed={!!selectedKeyword}
            onClick={
              selectedSectorName
                ? () => {
                    resetExpandedSelection()
                    setStockSearchKeyword('')
                    setSelectedKeyword(null)
                  }
                : undefined
            }
            position="middle"
          />
          <FunnelStep
            label={selectedKeyword ?? '종목'}
            active={step === 'stock'}
            completed={false}
            onClick={undefined}
            position="last"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-4 pb-2">
          {step === 'sector' && (
            <div className="grid h-full min-h-0 grid-cols-3 auto-rows-fr gap-2 overflow-hidden">
              {sectors.map((sector) => (
                <SectorCard
                  key={sector.sector}
                  sector={sector}
                  active={sector.sector === selectedSectorName}
                  onClick={() => handleSelectSector(sector.sector)}
                />
              ))}
            </div>
          )}

          {step === 'keyword' && selectedSectorName && (
            <div className="h-full overflow-hidden">
              <div
                className={`grid h-full gap-2 ${
                  keywords.length <= 2
                    ? 'grid-cols-2 grid-rows-1'
                    : keywords.length <= 4
                      ? 'grid-cols-2 auto-rows-fr'
                      : 'grid-cols-3 auto-rows-fr'
                }`}
              >
                {keywords.map((keyword) => (
                  <KeywordCard
                    key={keyword}
                    keyword={keyword}
                    onClick={() => handleSelectKeyword(keyword)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 'stock' && (
            <div className="h-full overflow-y-auto">
              {isLoading ? (
                <EmptyBlock text="관련 종목을 불러오는 중이에요..." />
              ) : isError ? (
                <EmptyBlock text="종목을 불러오지 못했어요." />
              ) : stocks.length === 0 ? (
                <EmptyBlock text="조건에 맞는 종목이 없어요." />
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

function FunnelStep({
  label,
  active,
  completed,
  onClick,
  position
}: {
  label: string
  active: boolean
  completed: boolean
  onClick?: () => void
  position: 'first' | 'middle' | 'last'
}) {
  const isHighlight = active || completed
  const clipFirst = 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)'
  const clipMiddle =
    'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)'
  const clipLast = 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 12px 50%)'
  const clip = position === 'first' ? clipFirst : position === 'last' ? clipLast : clipMiddle

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`relative flex-1 overflow-hidden py-2 text-center text-[11px] font-bold transition-all duration-500 ease-out ${
        isHighlight ? 'bg-wefin-mint-deep text-white' : 'bg-wefin-surface-2 text-wefin-muted'
      } ${onClick ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}`}
      style={{ clipPath: clip }}
    >
      {isHighlight && (
        <span className="absolute inset-0 animate-[shimmer_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
      <span className="relative">{label}</span>
    </button>
  )
}

function SectorCard({
  sector,
  active,
  onClick
}: {
  sector: SectorItem
  active: boolean
  onClick: () => void
}) {
  const bgImage = SECTOR_IMAGES[sector.sector]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative min-h-[70px] overflow-hidden rounded-2xl text-left transition-all duration-500 ease-out hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-[0.98] ${
        active
          ? 'ring-2 ring-wefin-mint shadow-[0_8px_24px_rgba(20,184,166,0.25)] scale-[1.02]'
          : 'shadow-sm'
      }`}
    >
      {bgImage ? (
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover brightness-[0.55] saturate-[0.6] transition-all duration-700 ease-out group-hover:scale-[1.08] group-hover:brightness-[0.9] group-hover:saturate-100"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-wefin-text to-wefin-text-2" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-500 group-hover:opacity-70" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex h-full flex-col justify-end p-3">
        <div
          className="text-[15px] font-bold tracking-tight text-white transition-transform duration-500 group-hover:-translate-y-0.5"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
        >
          {sector.sector}
        </div>
        <div
          className="text-[11px] font-semibold text-white/80 transition-all duration-500 group-hover:text-white group-hover:-translate-y-0.5"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
        >
          <span className="group-hover:hidden">{sector.keywordCount}개 키워드</span>
          <span className="hidden group-hover:inline">
            {SECTOR_DESC[sector.sector] ?? `${sector.keywordCount}개 키워드`}
          </span>
        </div>
      </div>
    </button>
  )
}

function KeywordCard({ keyword, onClick }: { keyword: string; onClick: () => void }) {
  const bgImage = KEYWORD_IMAGES[keyword]

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative min-h-[60px] overflow-hidden rounded-xl text-left transition-all duration-500 ease-out hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-[0.98]"
    >
      {bgImage ? (
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover brightness-[0.5] saturate-[0.6] transition-all duration-700 ease-out group-hover:scale-[1.08] group-hover:brightness-[0.85] group-hover:saturate-100"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-wefin-text-2 to-wefin-subtle" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="relative flex h-full flex-col justify-end p-3">
        <div
          className="text-[15px] font-bold text-white transition-transform duration-500 group-hover:-translate-y-0.5"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
        >
          {keyword}
        </div>
        {KEYWORD_DESC[keyword] && (
          <div
            className="max-h-0 overflow-hidden text-[11px] font-semibold text-white/0 transition-all duration-500 group-hover:max-h-5 group-hover:text-white/90"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
          >
            {KEYWORD_DESC[keyword]}
          </div>
        )}
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
  return (
    <div
      id={`stock-${stock.symbol}`}
      className="overflow-hidden rounded-xl border border-wefin-line bg-wefin-surface"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-wefin-surface-2"
      >
        <StockLogo code={stock.symbol} name={stock.stockName} size={32} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-wefin-text">{stock.stockName}</p>
          <p className="text-[11px] text-wefin-muted">{stock.symbol}</p>
        </div>
        <span className="font-num text-sm font-bold text-wefin-text">
          {stock.price.toLocaleString()}원
        </span>
        {expanded ? (
          <ChevronUp size={14} className="text-wefin-muted" />
        ) : (
          <ChevronDown size={14} className="text-wefin-muted" />
        )}
      </button>

      {expanded && (
        <div className="space-y-2.5 border-t border-wefin-line px-3 py-3">
          <SideTabs side={form.side} onChange={form.setSide} />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-wefin-subtle">수량</span>
              <span className="text-[11px] text-wefin-muted">최대 {form.maxQuantity}주</span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <input
                type="text"
                inputMode="numeric"
                className="min-w-0 flex-1 rounded-lg border border-wefin-line py-1.5 text-center text-sm font-bold text-wefin-text outline-none"
                value={form.quantity === 0 ? '' : form.quantity}
                placeholder="0"
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '')
                  form.setQuantityRaw(raw === '' ? 0 : parseInt(raw, 10))
                }}
              />
              <StepButton onClick={form.decrement} label="수량 감소">
                -
              </StepButton>
              <StepButton onClick={form.increment} label="수량 증가">
                +
              </StepButton>
            </div>
            <div className="mt-1.5 flex gap-1">
              {[10, 25, 50, 100].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => form.setPercent(p)}
                  className="flex-1 rounded bg-wefin-surface-2 py-0.5 text-[9px] font-semibold text-wefin-subtle hover:bg-wefin-line hover:text-wefin-text"
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1 border-t border-wefin-line pt-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-wefin-subtle">주문 금액</span>
              <span className="font-num font-bold text-wefin-text">
                {form.totalAmount.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-wefin-subtle">잔고</span>
              <span className="font-num text-wefin-muted">{cash.toLocaleString()}원</span>
            </div>
          </div>
          {form.errorMessage && <p className="text-[11px] text-wefin-red">{form.errorMessage}</p>}
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

function SideTabs({ side, onChange }: { side: OrderSide; onChange: (s: OrderSide) => void }) {
  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={() => onChange('buy')}
        className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-colors ${side === 'buy' ? 'bg-red-500 text-white' : 'bg-wefin-surface-2 text-wefin-subtle'}`}
      >
        매수
      </button>
      <button
        type="button"
        onClick={() => onChange('sell')}
        className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-colors ${side === 'sell' ? 'bg-blue-500 text-white' : 'bg-wefin-surface-2 text-wefin-subtle'}`}
      >
        매도
      </button>
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
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-wefin-line text-base font-extrabold text-wefin-text transition-colors hover:bg-wefin-surface-2"
    >
      {children}
    </button>
  )
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-wefin-line px-4 py-5 text-center text-sm text-wefin-subtle">
      {text}
    </div>
  )
}

function OrderConfirmDialog({
  stockName,
  side,
  quantity,
  price,
  totalAmount,
  onConfirm,
  onCancel
}: {
  stockName: string
  side: string
  quantity: number
  price: number
  totalAmount: number
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-80 rounded-2xl bg-wefin-surface p-6 shadow-xl">
        <h3 className="mb-4 text-center text-base font-bold text-wefin-text">주문 확인</h3>
        <div className="space-y-2 rounded-xl bg-wefin-surface-2 p-4">
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
            <span className="font-num font-bold text-wefin-text">{price.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between border-t border-wefin-line pt-2 text-sm">
            <span className="font-bold text-wefin-text">총 금액</span>
            <span className="font-num font-bold text-wefin-text">
              {totalAmount.toLocaleString()}원
            </span>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-wefin-line bg-wefin-surface py-2.5 text-sm font-bold text-wefin-subtle hover:bg-wefin-surface-2"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white ${side === '매수' ? 'bg-red-500' : 'bg-blue-500'}`}
          >
            {side} 확인
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderPanel
