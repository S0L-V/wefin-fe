import { useMutation, useQueryClient } from '@tanstack/react-query'

import { placeOrder, type PlaceOrderParams } from '../api/fetch-stocks'
import { gameRoomKeys } from './query-keys'

export function useOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: PlaceOrderParams) => placeOrder(params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: gameRoomKeys.detail(variables.roomId) })
      queryClient.invalidateQueries({ queryKey: gameRoomKeys.portfolio(variables.roomId) })
      queryClient.invalidateQueries({ queryKey: gameRoomKeys.holdings(variables.roomId) })
    }
  })
}
