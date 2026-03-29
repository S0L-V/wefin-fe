import axios from 'axios'

export const baseApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5_000
})

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

baseApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      const { status, code, message } = error.response.data
      if (code && message) {
        return Promise.reject(new ApiError(status, code, message))
      }
    }
    return Promise.reject(error)
  }
)
