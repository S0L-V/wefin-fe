import { SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'
import { routes } from '@/shared/config/routes'

type Props = {
  /** icon-only — 좁은 자리에 들어갈 때. 기본은 아이콘 + 라벨 */
  compact?: boolean
}

/**
 * "관심 목록 관리" 진입 버튼.
 *
 * 뉴스 피드 / 뉴스 목록 헤더 우측에 배치해 관심 종목·분야 관리 페이지로 이동시킨다.
 * 로그인된 사용자에게만 노출되며, 페이지 자체도 ProtectedRoute로 보호된다
 */
export default function ManageInterestsButton({ compact = false }: Props) {
  const userId = useAuthUserId()
  if (!userId) return null

  const baseClass =
    'inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-wefin-text transition-colors hover:border-wefin-mint/40 hover:bg-wefin-mint/5'

  if (compact) {
    return (
      <Link
        to={routes.interests}
        aria-label="관심 목록 관리"
        title="관심 목록 관리"
        className={`${baseClass} h-8 w-8 justify-center p-0`}
      >
        <SlidersHorizontal className="h-4 w-4 text-wefin-mint" />
      </Link>
    )
  }

  return (
    <Link to={routes.interests} className={`${baseClass} px-3 py-1.5`}>
      <SlidersHorizontal className="h-3.5 w-3.5 text-wefin-mint" />
      <span>관심 목록 관리</span>
    </Link>
  )
}
