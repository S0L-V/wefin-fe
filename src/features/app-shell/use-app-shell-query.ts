import { useQuery } from '@tanstack/react-query'

import { fetchAppShell } from './api'

export function useAppShellQuery() {
  return useQuery({
    queryKey: ['app-shell'],
    queryFn: fetchAppShell
  })
}
