import { type ReactNode, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useLoginDialogStore } from '@/features/auth-dialog/model/use-login-dialog-store'

type ProtectedRouteProps = {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('accessToken')
  const openLogin = useLoginDialogStore((state) => state.openLogin)
  const location = useLocation()

  useEffect(() => {
    if (!token) {
      openLogin()
    }
  }, [token, openLogin])

  if (!token) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
