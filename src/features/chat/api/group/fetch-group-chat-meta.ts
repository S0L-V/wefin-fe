export type GroupChatMeta = {
  groupId: number
  groupName: string
}

type ApiResponse<T> = {
  status: number
  code: string | null
  message: string | null
  data: T
}

export async function fetchGroupChatMeta(userId: string): Promise<GroupChatMeta> {
  const response = await fetch('/api/chat/group/me', {
    method: 'GET',
    headers: {
      'X-User-Id': userId
    }
  })

  if (!response.ok) {
    throw new Error('그룹 메타 정보를 불러오지 못했습니다.')
  }

  const result = (await response.json()) as ApiResponse<GroupChatMeta>
  return result.data
}
