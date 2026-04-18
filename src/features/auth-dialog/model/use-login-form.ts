import { useQueryClient } from '@tanstack/react-query'
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ApiError } from '@/shared/api/base-api'

import { useLoginMutation } from './use-login-mutation'

type UseLoginFormParams = {
  onSuccess: () => void
}

type LocationState = {
  from?: string
}

export function useLoginForm({ onSuccess }: UseLoginFormParams) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [loading, setLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToastMsg(''), 3000)
  }

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState | null)?.from || '/'

  const { mutateAsync } = useLoginMutation()

  const handleChange = (field: 'email' | 'password') => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await mutateAsync({
        email: formData.email,
        password: formData.password
      })

      localStorage.setItem('nickname', result.nickname)
      localStorage.setItem('email', formData.email)
      localStorage.setItem('accessToken', result.accessToken)
      localStorage.setItem('refreshToken', result.refreshToken)

      // 다른 사용자 캐시(그룹 등)가 남아 분기 로직이 잘못 계산되지 않도록 사용자 스코프 쿼리 제거
      queryClient.removeQueries({ queryKey: ['settings', 'my-group'] })
      await queryClient.invalidateQueries({ queryKey: ['quests', 'today'] })
      window.dispatchEvent(new Event('auth-changed'))

      onSuccess()
      navigate(from, { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message || '로그인에 실패했어요')
      } else {
        showToast('서버 통신 오류가 발생했어요')
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    formData,
    loading,
    toastMsg,
    handleChange,
    handleSubmit
  }
}
