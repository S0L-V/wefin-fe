import { useQuery } from '@tanstack/react-query'

import { fetchGlobalChatMessages } from '../api/fetch-global-chat-messages'

export function useGlobalChatMessagesQuery() {
  return useQuery({
    queryKey: ['chat', 'global', 'messages'],
    queryFn: fetchGlobalChatMessages
  })
}
