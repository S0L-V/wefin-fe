import { useQuery } from '@tanstack/react-query'

import { getMySubscription } from '@/features/payment/api/payment.api'

const MY_SUBSCRIPTION_KEY = ['my-subscription'] as const

function hasAccessToken() {
  return !!localStorage.getItem('accessToken')
}

export function useMySubscriptionQuery() {
  return useQuery({
    queryKey: MY_SUBSCRIPTION_KEY,
    queryFn: getMySubscription,
    enabled: hasAccessToken()
  })
}
