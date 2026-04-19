import { useMutation } from '@tanstack/react-query'

import { changePassword, type ChangePasswordRequest } from '../api/change-password'

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (request: ChangePasswordRequest) => changePassword(request)
  })
}
