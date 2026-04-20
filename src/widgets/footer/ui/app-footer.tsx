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
      <div
        className="mx-auto grid gap-7 px-9 pt-[34px] pb-11"
        style={{
          maxWidth: 1440,
          gridTemplateColumns: '1.2fr 1fr 1fr 1fr'
        }}
      >
        {/* Brand */}
        <div>
          <div className="mb-2.5 flex items-baseline">
            <WefinLogoIcon size={18} className="mr-[-3px] translate-y-[3px] text-wefin-text" />
            <span className="text-[13px] font-extrabold text-wefin-text">efin</span>
          </div>
          <p className="text-[13px] leading-relaxed text-wefin-subtle">
            과거에서 배우고, 현재에 투자하는 모의투자 플랫폼
          </p>
        </div>

        {/* 서비스 */}
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

        {/* 문의 */}
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

        {/* Copyright */}
        <div className="flex items-end justify-end">
          <p className="text-[13px] text-wefin-subtle">&copy; 2026 SOLV. All rights reserved.</p>
        </div>
      </div>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </footer>
  )
}
