import { useState } from 'react'

import { ApiError } from '@/shared/api/base-api'

import { useLoginMutation } from './use-login-mutation'

type UseLoginFormParams = {
  onSuccess: () => void
}

export function useLoginForm({ onSuccess }: UseLoginFormParams) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { mutateAsync } = useLoginMutation()

  const handleChange =
    (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value
      }))

      if (error) setError('')
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await mutateAsync({
        email: formData.email,
        password: formData.password
      })

      // 토큰 저장
      localStorage.setItem('accessToken', result.data.accessToken)
      localStorage.setItem('refreshToken', result.data.refreshToken)

      onSuccess()
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
