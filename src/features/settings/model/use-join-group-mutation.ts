import { useMutation, useQueryClient } from '@tanstack/react-query'

import { joinGroup } from '../api/join-group'

export function useJoinGroupMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: joinGroup,
    onSuccess: () => {
      onSuccess?.()

      void queryClient.invalidateQueries({
        queryKey: ['settings', 'my-group']
      })

      void queryClient.invalidateQueries({
        queryKey: ['settings', 'group-invite-code']
      })
    }
  })
}
