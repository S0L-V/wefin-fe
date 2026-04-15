import { useMutation } from '@tanstack/react-query'

import { castVote } from '../api/vote'

export function useVoteMutation(roomId: string) {
  return useMutation({
    mutationFn: (agree: boolean) => castVote(roomId, agree)
  })
}
