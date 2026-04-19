import { baseApi } from '@/shared/api/base-api'

type ApiResponse<T> = {
  status: number
  code: string
  message: string
  data: T
}

export type ResetPasswordRequest = {
  email: string
  newPassword: string
}

export async function resetPassword(request: ResetPasswordRequest) {
  const { data } = await baseApi.post<ApiResponse<null>>('/auth/password/reset', request)
  return data
}
