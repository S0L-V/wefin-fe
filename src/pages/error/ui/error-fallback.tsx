import { RefreshCw } from 'lucide-react'

import WefinLogoIcon from '@/shared/ui/wefin-logo-icon'

interface ErrorFallbackProps {
  onReset: () => void
}

export default function ErrorFallback({ onReset }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-wefin-bg px-6 text-center">
      <div className="relative mb-4">
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="text-wefin-red">
          <polyline
            points="5,60 20,55 35,40 50,50 65,20 80,35 95,10 110,30"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="95" cy="10" r="5" fill="currentColor" opacity="0.3" />
          <line
            x1="95"
            y1="10"
            x2="95"
            y2="75"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity="0.2"
          />
        </svg>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <WefinLogoIcon size={28} className="text-wefin-mint" />
        </div>
      </div>

      <h1 className="mt-4 text-xl font-extrabold text-wefin-text sm:text-2xl">
        일시적인 장애가 발생했어요
      </h1>
      <p className="mt-2 text-sm text-wefin-subtle">
        시장은 항상 변동합니다. 잠시 후 다시 시도해주세요.
      </p>

      <button
        type="button"
        onClick={() => {
          onReset()
          window.location.href = '/'
        }}
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-wefin-mint px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-wefin-mint-deep"
      >
        <RefreshCw size={16} />
        다시 시작하기
      </button>
    </div>
  )
}
