import axios, { type InternalAxiosRequestConfig } from 'axios'

// 공통 axios 인스턴스
export const baseApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5_000
})

// refresh 전용 인스턴스
const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5_000
})

// 서버 에러를 표현하는 공통 에러 클래스
export class ApiError<T = unknown> extends Error {
  readonly status: number
  readonly code: string
  readonly data: T | null

  constructor(status: number, code: string, message: string, data: T | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
  }
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let isRefreshing = false
let pendingRequests: Array<(token: string | null) => void> = []

function notifyPendingRequests(token: string | null) {
  pendingRequests.forEach((callback) => callback(token))
  pendingRequests = []
}

function clearAuthStorage() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('nickname')
  window.dispatchEvent(new Event('auth-changed'))
}

function getResponseErrorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) {
    return undefined
  }

  const data = error.response?.data
  if (!data || typeof data !== 'object') {
    return undefined
  }

  return 'code' in data && typeof data.code === 'string' ? data.code : undefined
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken')

  if (!refreshToken) {
    clearAuthStorage()
    throw new Error('refresh token not found')
  }

  const response = await refreshApi.post('/auth/refresh', {
    refreshToken
  })

  const newAccessToken = response.data?.data?.accessToken
  const newRefreshToken = response.data?.data?.refreshToken

  if (!newAccessToken || typeof newAccessToken !== 'string') {
    throw new Error('invalid refresh response')
  }

  localStorage.setItem('accessToken', newAccessToken)

  if (typeof newRefreshToken === 'string') {
    localStorage.setItem('refreshToken', newRefreshToken)
  }

  window.dispatchEvent(new Event('auth-changed'))

  return newAccessToken
}

// 요청 시 access token 자동 첨부
baseApi.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

// 서버 에러를 ApiError로 변환 + 인증 401 응답 시 refresh 처리
baseApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const requestUrl = originalRequest?.url ?? ''

    const isAuthRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/signup') ||
      requestUrl.includes('/auth/refresh')

    const errorCode = getResponseErrorCode(error)

    const shouldRefresh =
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !!originalRequest &&
      !isAuthRequest &&
      errorCode !== 'AUTH_REFRESH_TOKEN_EXPIRED'

    if (shouldRefresh) {
      if (originalRequest._retry) {
        clearAuthStorage()
        window.location.href = '/'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push((token) => {
            if (!token) {
              reject(error)
              return
            }

            originalRequest._retry = true
            originalRequest.headers = axios.AxiosHeaders.from(originalRequest.headers)
            originalRequest.headers.set('Authorization', `Bearer ${token}`)
            resolve(baseApi(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newAccessToken = await refreshAccessToken()

        notifyPendingRequests(newAccessToken)

        originalRequest.headers = axios.AxiosHeaders.from(originalRequest.headers)
        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`)
        return baseApi(originalRequest)
      } catch (refreshError) {
        notifyPendingRequests(null)

        const shouldLogout =
          !localStorage.getItem('refreshToken') ||
          (axios.isAxiosError(refreshError) && refreshError.response?.status === 401)

        if (shouldLogout) {
          clearAuthStorage()
          window.location.href = '/'
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (axios.isAxiosError(error) && error.response?.data) {
      const { status, code, message, data } = error.response.data

      if (typeof status === 'number' && typeof code === 'string' && typeof message === 'string') {
        return Promise.reject(new ApiError(status, code, message, data ?? null))
      }
    }

    return Promise.reject(error)
  }
)
