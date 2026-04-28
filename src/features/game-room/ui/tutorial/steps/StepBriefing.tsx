import { motion } from 'framer-motion'
import { ChevronRight, LogOut, Square } from 'lucide-react'

export default function StepBriefing() {
  const progress = (3 / 27) * 100

  return (
    <div className="flex flex-col">
      {/* Content */}
      <div className="grid grid-cols-1 gap-5 p-4 sm:p-6 lg:grid-cols-3 lg:gap-3">
        {/* Briefing */}
        <div className="col-span-1">
          <div className="flex h-11 items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold text-wefin-mint">
                ◆
              </span>
              <span className="text-sm font-bold text-wefin-text">시장 브리핑</span>
            </div>
            <span className="text-sm font-semibold text-wefin-text-2">보유 종목 2</span>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-5 text-sm leading-relaxed text-wefin-text"
          >
            <div>
              <h4 className="mb-2 text-[13px] font-extrabold text-wefin-mint-deep">시장 개요</h4>
              <p className="font-medium text-wefin-text-2">
                코스피가 외국인 매수세에 힘입어 2,400선을 회복했습니다. 반도체와 2차전지 섹터가
                강세를 보이고 있습니다.
              </p>
            </div>
            <div>
              <h4 className="mb-2 text-[13px] font-extrabold text-wefin-mint-deep">주요 이슈</h4>
              <p className="font-medium text-wefin-text-2">
                FOMC 금리 동결 결정으로 안도감이 퍼지며, 삼성전자 반도체 업황 회복 기대감이 커지고
                있습니다.
              </p>
            </div>
            <div>
              <h4 className="mb-2 text-[13px] font-extrabold text-wefin-mint-deep">투자 힌트</h4>
              <p className="font-medium text-wefin-text-2">
                반도체 섹터 비중 확대를 고려해볼 만합니다. 금리 인하 시점 불확실성에 유의하세요.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Holdings */}
        <div className="col-span-1">
          <div className="flex h-11 items-center">
            <span className="text-sm font-bold text-wefin-text">보유 종목</span>
            <span className="font-num ml-1.5 text-xs font-bold text-wefin-mint">2</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid grid-cols-3 gap-0 overflow-hidden rounded-lg border border-wefin-line mb-2">
              {[
                { label: '현금', value: '42,350,000' },
                { label: '평가', value: '10,000,000' },
                { label: '총자산', value: '52,350,000' }
              ].map((item, i) => (
                <div
                  key={item.label}
                  className={`flex flex-col items-center py-2 ${i > 0 ? 'border-l border-wefin-line' : ''}`}
                >
                  <span className="text-xs font-bold text-wefin-subtle">{item.label}</span>
                  <span className="font-num text-sm font-extrabold text-wefin-text">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pb-2">
              <span className="text-xs font-bold text-wefin-subtle">평가손익</span>
              <span className="font-num text-[13px] font-bold text-wefin-red">+2,350,000원</span>
              <span className="font-num text-[11px] text-wefin-red">(+4.7%)</span>
            </div>

            {[
              { name: '삼성전자', qty: 100, avg: '59,200', eval: '6,250,000', rate: 5.57 },
              { name: 'LG에너지솔루션', qty: 10, avg: '365,000', eval: '3,750,000', rate: 2.74 }
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-wefin-surface-2 text-[10px] font-bold text-wefin-subtle">
                  {item.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-wefin-text">{item.name}</p>
                  <p className="font-num text-[11px] font-medium text-wefin-subtle">
                    {item.qty}주 · {item.avg}원
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-num text-[13px] font-bold text-wefin-text">{item.eval}</p>
                  <p className="font-num text-[11px] font-semibold text-wefin-red">
                    +{item.rate.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Info callout */}
        <div className="col-span-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="rounded-2xl border-2 border-wefin-mint bg-wefin-mint-soft p-3.5"
          >
            <p className="text-xs font-bold text-wefin-mint-deep mb-2">
              💡 이 화면에서 할 수 있는 것
            </p>
            <ul className="space-y-1 text-[11px] text-wefin-text leading-relaxed">
              <li>• AI 브리핑으로 시장 동향 파악</li>
              <li>• 보유 종목의 현재 평가손익 확인</li>
              <li>
                • <strong>다음 턴</strong> 버튼으로 투표 시작 (방장)
              </li>
              <li>• 하단 진행바로 게임 진행률 확인</li>
            </ul>

            <div className="mt-2.5 rounded-xl bg-white/60 p-2.5">
              <p className="text-[11px] font-bold text-wefin-red mb-1.5">⚠️ 나가기 vs 게임종료</p>
              <ul className="space-y-1 text-[10px] text-wefin-text leading-relaxed">
                <li>
                  • <strong>나가기</strong> — 잠시 이탈, <strong>재입장 가능</strong>
                </li>
                <li>
                  • <strong>게임종료</strong> — 마무리 후 <strong>AI 리포트</strong> 수령
                </li>
                <li>
                  • 혼자일 때 <strong>나가기</strong> → 결과 없이 방 종료
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* PlayHeader at BOTTOM */}
      <div className="bg-gradient-to-r from-[#1a1f36] to-[#0f2027] px-4 py-2 text-white sm:px-6 sm:py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-7">
            <div className="flex items-baseline gap-1.5">
              <span className="font-num text-lg font-extrabold sm:text-2xl">3</span>
              <span className="font-num text-xs font-bold text-white/60 sm:text-base">/ 27턴</span>
            </div>
            <div className="hidden h-10 w-px bg-white/20 sm:block" />
            <div>
              <p className="hidden text-xs font-bold uppercase tracking-wide text-white/70 sm:block">
                총 자산
              </p>
              <p className="font-num text-sm font-extrabold sm:mt-0.5 sm:text-lg">
                52,350,000
                <span className="ml-0.5 text-xs font-bold text-white/60 sm:ml-1 sm:text-sm">
                  원
                </span>
              </p>
            </div>
            <div className="font-num text-sm font-extrabold text-red-400 sm:text-lg">+4.70%</div>
            <div className="hidden items-center gap-1.5 text-base font-bold text-white/70 sm:flex">
              <span className="h-2 w-2 rounded-full bg-green-400" /> 3명
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <motion.button
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center gap-1 rounded-lg bg-wefin-mint px-3 py-2 text-xs font-bold text-white sm:gap-1.5 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              다음 턴 <ChevronRight size={14} />
            </motion.button>
            <button className="hidden rounded-lg bg-white/10 px-4 py-2.5 text-sm font-bold text-white/70 sm:block">
              <Square size={10} className="mr-1 inline fill-current" /> 종료
            </button>
            <button className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-2 text-xs font-bold text-white/70 sm:gap-1.5 sm:px-4 sm:py-2.5 sm:text-sm">
              <LogOut size={12} /> <span className="hidden sm:inline">나가기</span>
            </button>
          </div>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-wefin-mint to-wefin-mint-deep transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
