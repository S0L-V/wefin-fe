import { useQuery } from '@tanstack/react-query'

import { getMySubscription } from '@/features/payment/api/payment.api'
import { ApiError } from '@/shared/api/base-api'

export const MY_SUBSCRIPTION_KEY = ['my-subscription'] as const

function hasAccessToken() {
  return !!localStorage.getItem('accessToken')
}

export function useMySubscriptionQuery(enabled = true) {
  const hasToken = hasAccessToken()

  return useQuery({
    queryKey: MY_SUBSCRIPTION_KEY,
    queryFn: async () => {
      try {
        return await getMySubscription()
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null
        }

        throw error
      }
    },
    enabled: enabled && hasToken
  })
}
