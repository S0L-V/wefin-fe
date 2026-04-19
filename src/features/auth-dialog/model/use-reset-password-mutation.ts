import { useMutation } from '@tanstack/react-query'

import { resetPassword, type ResetPasswordRequest } from '../api/reset-password'

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (request: ResetPasswordRequest) => resetPassword(request)
  })
}
