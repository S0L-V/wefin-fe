import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createGroupInviteCode } from '../api/create-group-invite-code'

export function useCreateGroupInviteCodeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGroupInviteCode,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ['settings', 'group-invite-code', data.groupId]
      })
    }
  })
}
