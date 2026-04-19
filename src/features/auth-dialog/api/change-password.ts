import { baseApi } from '@/shared/api/base-api'

type ApiResponse<T> = {
  status: number
  code: string
  message: string
  data: T
}

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}

export async function changePassword(request: ChangePasswordRequest) {
  const { data } = await baseApi.post<ApiResponse<null>>('/auth/password/change', request)
  return data
}
