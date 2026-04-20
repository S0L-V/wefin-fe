import { useMutation } from '@tanstack/react-query'

import { withdraw } from '../api/withdraw'

export function useWithdrawMutation() {
  return useMutation({
    mutationFn: withdraw
  })
}
