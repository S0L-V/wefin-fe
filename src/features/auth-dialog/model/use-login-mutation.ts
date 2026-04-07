import { useMutation } from '@tanstack/react-query'

import { login } from '../api/login'

export function useLoginMutation() {
  return useMutation({
    mutationFn: login
  })
}
