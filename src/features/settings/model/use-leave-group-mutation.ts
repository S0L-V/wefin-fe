import { useMutation, useQueryClient } from '@tanstack/react-query'

import { leaveGroup } from '../api/leave-group'

export function useLeaveGroupMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: leaveGroup,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['settings', 'my-group']
      })
    }
  })
}
