import { ArrowLeft, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import WefinLogoIcon from '@/shared/ui/wefin-logo-icon'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-6 py-20 text-center">
      <div className="relative mb-2">
        <svg width="160" height="100" viewBox="0 0 160 100" fill="none" className="opacity-80">
          <polyline
            points="10,80 30,70 50,75 70,30 90,50 110,15 130,40 150,35"
            stroke="var(--color-wefin-mint)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray="300"
            strokeDashoffset="300"
            className="animate-[draw_1.5s_ease-out_forwards]"
          />
          <circle cx="110" cy="15" r="4" fill="var(--color-wefin-mint)" opacity="0.5" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-num text-[64px] font-black text-wefin-line/60 sm:text-[80px]">
            404
          </span>
        </div>
      </div>

      <div className="mb-1 flex items-center gap-1.5">
        <WefinLogoIcon size={20} className="text-wefin-mint" />
        <span className="text-sm font-bold text-wefin-mint">WEFIN</span>
      </div>

      <h1 className="text-lg font-extrabold text-wefin-text sm:text-xl">상장폐지된 페이지입니다</h1>
      <p className="mt-1.5 text-sm text-wefin-subtle">
        요청하신 종목(URL)이 존재하지 않거나 거래가 정지되었어요.
      </p>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-wefin-line bg-wefin-surface px-5 py-2.5 text-sm font-bold text-wefin-text transition-colors hover:bg-wefin-surface-2"
        >
          <ArrowLeft size={16} />
          이전 페이지
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 rounded-xl bg-wefin-mint px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-wefin-mint-deep"
        >
          <Home size={16} />
          홈으로
        </button>
      </div>
    </div>
  )
}

export default NotFoundPage
