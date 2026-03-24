import { useQuery } from '@tanstack/react-query'

import { fetchLoginDialogData } from '../api/fetch-login-dialog-data'

export function useLoginDialogQuery() {
  return useQuery({
    queryKey: ['auth-dialog'],
    queryFn: fetchLoginDialogData
  })
}
