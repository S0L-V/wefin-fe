import { useQueryClient } from '@tanstack/react-query'
import { type ChangeEvent, type FormEvent, useState } from 'react'
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

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

    if (error) setError('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await mutateAsync({
        email: formData.email,
        password: formData.password
      })

      localStorage.setItem('nickname', result.nickname)
      localStorage.setItem('accessToken', result.accessToken)
      localStorage.setItem('refreshToken', result.refreshToken)

      await queryClient.invalidateQueries({ queryKey: ['quests', 'today'] })
      window.dispatchEvent(new Event('auth-changed'))

      onSuccess()
      navigate(from, { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message || '로그인 실패')
      } else {
        setError('서버 통신 오류')
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    formData,
    error,
    loading,
    handleChange,
    handleSubmit
  }
}
