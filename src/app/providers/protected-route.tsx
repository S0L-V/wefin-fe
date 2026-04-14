import { type ReactNode, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useLoginDialogStore } from '@/features/auth-dialog/model/use-login-dialog-store'

type ProtectedRouteProps = {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'))
  const openLogin = useLoginDialogStore((state) => state.openLogin)
  const location = useLocation()

  useEffect(() => {
    const syncAuthState = () => {
      setToken(localStorage.getItem('accessToken'))
    }

    window.addEventListener('auth-changed', syncAuthState)

    return () => {
      window.removeEventListener('auth-changed', syncAuthState)
    }
  }, [])

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
