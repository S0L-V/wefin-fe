import { useState } from 'react'
import { Link } from 'react-router-dom'

import WefinLogoIcon from '@/shared/ui/wefin-logo-icon'

import FeedbackModal from './feedback-modal'

const SERVICE_LINKS = [
  { label: '실시간 투자', to: '/stocks' },
  { label: '타임머신 투자', to: '/history' }
]

const INQUIRY_LINKS = [
  { label: '이용약관', to: '/terms' },
  { label: '개인정보처리방침', to: '/privacy' },
  { label: '서비스 소개', to: '/about' }
]

export default function AppFooter() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <footer className="border-t border-wefin-line">
      <div className="mx-auto max-w-[1440px] px-5 pt-8 pb-10 sm:px-9 sm:pt-[34px] sm:pb-11">
        {/* 모바일: 세로 스택 */}
        <div className="flex flex-col gap-6 sm:hidden">
          <div className="flex items-baseline">
            <WefinLogoIcon size={18} className="mr-[-3px] translate-y-[3px] text-wefin-text" />
            <span className="text-[13px] font-extrabold text-wefin-text">efin</span>
          </div>

          <div className="flex gap-8">
            <div>
              <h5 className="mb-2 text-[12px] font-extrabold text-wefin-text">서비스</h5>
              <ul className="flex list-none flex-col gap-1.5">
                {SERVICE_LINKS.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-[12px] text-wefin-subtle transition-colors hover:text-wefin-text"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="mb-2 text-[12px] font-extrabold text-wefin-text">문의</h5>
              <ul className="flex list-none flex-col gap-1.5">
                {INQUIRY_LINKS.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-[12px] text-wefin-subtle transition-colors hover:text-wefin-text"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => setFeedbackOpen(true)}
                    className="text-[12px] text-wefin-subtle transition-colors hover:text-wefin-text"
                  >
                    의견 보내기
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-[11px] text-wefin-muted">&copy; 2026 SOLV. All rights reserved.</p>
        </div>

        {/* 데스크탑: 4컬럼 */}
        <div className="hidden gap-7 sm:grid" style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1fr' }}>
          <div>
            <div className="mb-2.5 flex items-baseline">
              <WefinLogoIcon size={18} className="mr-[-3px] translate-y-[3px] text-wefin-text" />
              <span className="text-[13px] font-extrabold text-wefin-text">efin</span>
            </div>
            <p className="text-[13px] leading-relaxed text-wefin-subtle">
              과거에서 배우고, 현재에 투자하는 모의투자 플랫폼
            </p>
          </div>

          <div>
            <h5 className="mb-2.5 text-[13px] font-extrabold text-wefin-text">서비스</h5>
            <ul className="flex list-none flex-col gap-1.5">
              {SERVICE_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-[13px] text-wefin-subtle transition-colors hover:text-wefin-text"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="mb-2.5 text-[13px] font-extrabold text-wefin-text">문의</h5>
            <ul className="flex list-none flex-col gap-1.5">
              {INQUIRY_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-[13px] text-wefin-subtle transition-colors hover:text-wefin-text"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(true)}
                  className="text-[13px] text-wefin-subtle transition-colors hover:text-wefin-text"
                >
                  의견 보내기
                </button>
              </li>
            </ul>
          </div>

          <div className="flex items-end justify-end">
            <p className="text-[13px] text-wefin-subtle">&copy; 2026 SOLV. All rights reserved.</p>
          </div>
        </div>
      </div>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </footer>
  )
}
