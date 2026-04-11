import type { AiChatMessage } from '@/features/ai-chat/api/fetch-ai-chat-messages'

const SAME_MESSAGE_WINDOW_MS = 15000

export type UserMessageSignature = {
  userId: string | null
  content: string
  createdAt: string
  afterMessageId: number | null
  afterCreatedAt: string | null
}

export function getMessageKey(message: AiChatMessage, index: number): string {
  return [
    message.messageId ?? `temp-${index}`,
    message.userId ?? 'anonymous',
    message.role,
    message.content,
    message.createdAt
  ].join(':')
}

export function getAiMarker(message: AiChatMessage): string | null {
  if (message.role !== 'AI') {
    return null
  }

  return message.messageId != null
    ? `id:${message.messageId}`
    : `temp:${message.content}:${message.createdAt}`
}

export function getLatestAiMarker(messages: AiChatMessage[]): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const marker = getAiMarker(messages[index])

    if (marker != null) {
      return marker
    }
  }

  return null
}

export function getLatestPersistedUserMessage(messages: AiChatMessage[]): AiChatMessage | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]

    if (message.role === 'USER' && message.messageId != null) {
      return message
    }
  }

  return null
}

export function toTimestamp(value: string | null): number {
  if (!value) {
    return 0
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function isAfterReference(message: AiChatMessage, signature: UserMessageSignature): boolean {
  if (signature.afterMessageId != null) {
    return message.messageId != null && message.messageId > signature.afterMessageId
  }

  if (signature.afterCreatedAt != null) {
    return toTimestamp(message.createdAt) > toTimestamp(signature.afterCreatedAt)
  }

  return true
}

export function isLikelyPersistedUserMessage(
  message: AiChatMessage,
  signature: UserMessageSignature
): boolean {
  if (message.role !== 'USER') {
    return false
  }

  return (
    isAfterReference(message, signature) &&
    message.userId === signature.userId &&
    message.content === signature.content &&
    Math.abs(toTimestamp(message.createdAt) - toTimestamp(signature.createdAt)) <=
      SAME_MESSAGE_WINDOW_MS
  )
}

export function isSameMessage(left: AiChatMessage, right: AiChatMessage): boolean {
  if (left.messageId != null && right.messageId != null) {
    return left.messageId === right.messageId
  }

  return (
    left.userId === right.userId &&
    left.role === right.role &&
    left.content === right.content &&
    left.createdAt === right.createdAt
  )
}

export function mergeMessages(currentMessages: AiChatMessage[], incomingMessages: AiChatMessage[]) {
  const mergedMessages = [...incomingMessages]

  currentMessages.forEach((message) => {
    const alreadyExists = mergedMessages.some((item) => {
      if (isSameMessage(item, message)) {
        return true
      }

      return (
        message.messageId == null &&
        isLikelyPersistedUserMessage(item, {
          userId: message.userId,
          content: message.content,
          createdAt: message.createdAt,
          afterMessageId: null,
          afterCreatedAt: null
        })
      )
    })

    if (!alreadyExists) {
      mergedMessages.push(message)
    }
  })

  return mergedMessages.sort(
    (left, right) => toTimestamp(left.createdAt) - toTimestamp(right.createdAt)
  )
}

export function hasRecoveredAiReply(
  messages: AiChatMessage[],
  previousAiMarker: string | null,
  userMessageSignature: UserMessageSignature
): boolean {
  let matchedUserIndex = -1

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (isLikelyPersistedUserMessage(messages[index], userMessageSignature)) {
      matchedUserIndex = index
      break
    }
  }

  if (matchedUserIndex < 0) {
    return false
  }

  return messages.slice(matchedUserIndex + 1).some((message) => {
    const marker = getAiMarker(message)

    return marker != null && marker !== previousAiMarker
  })
}

export function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function readHasAccessToken() {
  return typeof window !== 'undefined' && !!window.localStorage.getItem('accessToken')
}
