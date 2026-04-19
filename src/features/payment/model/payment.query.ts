import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { confirmPayment, createPayment, getMySubscription } from '../api/payment.api'

export const PAYMENT_QUERY_KEY = {
  mySubscription: ['payments', 'me', 'subscription'] as const
}

export function useCreatePaymentMutation() {
  return useMutation({
    mutationFn: (planId: number) => createPayment(planId)
  })
}

export function useConfirmPaymentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: confirmPayment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: PAYMENT_QUERY_KEY.mySubscription
      })
    }
  })
}

export function useMySubscriptionQuery() {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEY.mySubscription,
    queryFn: getMySubscription,
    retry: false
  })
}
