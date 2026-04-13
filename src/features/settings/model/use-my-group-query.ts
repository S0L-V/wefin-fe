import { useQuery } from '@tanstack/react-query'

import { getMyGroup } from '../api/get-my-group'

type Options = {
  enabled?: boolean
}

export function useMyGroupQuery({ enabled = true }: Options = {}) {
  return useQuery({
    queryKey: ['settings', 'my-group'],
    queryFn: getMyGroup,
    enabled
  })
}
