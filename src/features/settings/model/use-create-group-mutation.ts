import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createGroup } from '../api/create-group'

export function useCreateGroupMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGroup,
    onSuccess: async () => {
      onSuccess?.()

      await queryClient.invalidateQueries({
        queryKey: ['settings', 'my-group']
      })
    }
  })
}
