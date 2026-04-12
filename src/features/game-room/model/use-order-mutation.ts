import { useMutation, useQueryClient } from '@tanstack/react-query'

import { placeOrder, type PlaceOrderParams } from '../api/fetch-stocks'

export function useOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: PlaceOrderParams) => placeOrder(params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['game-room', 'detail', variables.roomId] })
    }
  })
}
