import { useMutation } from '@tanstack/react-query'

import { issueAccount, type IssueAccountRequest } from '../api/issue-account'

export function useIssueAccount() {
  return useMutation({
    mutationFn: (request: IssueAccountRequest) => issueAccount(request)
  })
}
