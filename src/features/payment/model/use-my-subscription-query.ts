import { useQuery } from '@tanstack/react-query'

import { getMySubscription } from '@/features/payment/api/payment.api'

export const MY_SUBSCRIPTION_KEY = ['my-subscription'] as const

function hasAccessToken() {
  return !!localStorage.getItem('accessToken')
}

export function useMySubscriptionQuery(enabled = true) {
  const hasToken = hasAccessToken()

  return useQuery({
    queryKey: MY_SUBSCRIPTION_KEY,
    queryFn: getMySubscription,
    enabled: enabled && hasToken
  })
}
