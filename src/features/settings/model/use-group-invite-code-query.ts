import { useQuery } from '@tanstack/react-query'

import { getGroupInviteCode } from '../api/get-group-invite-code'

type Options = {
  groupId: number | undefined
  enabled?: boolean
}

export function useGroupInviteCodeQuery({ groupId, enabled = true }: Options) {
  return useQuery({
    queryKey: ['settings', 'group-invite-code', groupId],
    queryFn: () => getGroupInviteCode(groupId!),
    enabled: enabled && groupId != null
  })
}
