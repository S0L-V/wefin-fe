interface HoldingsPanelProps {
  code: string
}

export default function HoldingsPanel({ code: _code }: HoldingsPanelProps) {
  return (
    <div>
      <div className="border-b border-gray-100 px-3 py-1.5">
        <span className="text-xs font-medium text-wefin-text">보유 주식</span>
      </div>
      <div className="px-3 py-4 text-center text-[10px] text-gray-400">
        보유 주식 정보 (추후 연동)
      </div>
    </div>
  )
}
