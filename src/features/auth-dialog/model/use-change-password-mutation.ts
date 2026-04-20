import { useMutation } from '@tanstack/react-query'

import { changePassword } from '../api/change-password'

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: changePassword
  })
}
