import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useGroupChatStore } from '@/features/chat/model/group/group-chat-store'

import { leaveGroup } from '../api/leave-group'

export function useLeaveGroupMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: leaveGroup,
    onSuccess: async () => {
      useGroupChatStore.getState().resetSessionState()
      await queryClient.invalidateQueries({
        queryKey: ['settings', 'my-group']
      })
    }
  })
}
