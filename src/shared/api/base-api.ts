import axios from 'axios'

// 공통 axios 인스턴스
export const baseApi = axios.create({
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

// 서버 에러를 ApiError로 변환
baseApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      const { status, code, message, data } = error.response.data

      // 서버 표준 에러 포맷일 경우 ApiError로 래핑
      if (code && message) {
        return Promise.reject(new ApiError(status, code, message, data ?? null))
      }
    }

    return Promise.reject(error)
  }
)
