import { Bell, BellOff } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'
import {
  fetchChatUnread,
  markGlobalChatRead,
  markGroupChatRead
} from '@/features/chat/api/chat-unread'
import {
  updateChatToastPreference,
  useChatToastPreferences
} from '@/features/chat/model/chat-toast-preferences'
import { useChatUnreadStore } from '@/features/chat/model/chat-unread-store'
import type { ChatType } from '@/features/chat/model/chat-unread-types'
import GlobalChatRoom from '@/features/chat/ui/global-chat-room'
import GroupChatRoom from '@/features/chat/ui/group-chat-room'
import { useMyGroupQuery } from '@/features/settings/model/use-my-group-query'
import SegmentedTabs, { type SegmentedTabItem } from '@/shared/ui/segmented-tabs'

import type { ChatInnerTab } from '../model/chat-tabs'

function useIsLoggedIn(): boolean {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('accessToken'))

  useEffect(() => {
    const sync = () => setIsLoggedIn(!!localStorage.getItem('accessToken'))
    window.addEventListener('auth-changed', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('auth-changed', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return isLoggedIn
}

function TabLabel({
  label,
  hasUnread,
  side
}: {
  label: string
  hasUnread: boolean
  side: 'left' | 'right'
}) {
  const badgeClass = side === 'left' ? 'absolute -top-1 -left-1' : 'absolute -right-1 -top-1'

  return (
    <>
      <span>{label}</span>
      {hasUnread && (
        <span
          className={`${badgeClass} pointer-events-none h-2.5 w-2.5 rounded-full bg-rose-500 ring-1.5 ring-white shadow-[0_0_0_1px_rgba(255,255,255,0.45)] animate-[pulse_1.8s_ease-in-out_infinite]`}
        />
      )}
    </>
  )
}

function ToastToggleButton({
  checked,
  label,
  disabled,
  onClick
}: {
  checked: boolean
  label: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={checked ? `${label} 끄기` : `${label} 켜기`}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
        checked
          ? 'border-wefin-line bg-wefin-mint-soft text-wefin-mint-deep hover:bg-wefin-mint-100'
          : 'border-wefin-line bg-wefin-surface text-wefin-muted hover:bg-wefin-surface-2'
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {checked ? <Bell size={18} /> : <BellOff size={18} />}
    </button>
  )
}

async function markChatRead(chatType: ChatType) {
  if (chatType === 'GROUP') {
    await markGroupChatRead()
    return
  }

  await markGlobalChatRead()
}

export default function ChatPanel() {
  const userId = useAuthUserId()
  const isLoggedIn = useIsLoggedIn()
  const { data: group } = useMyGroupQuery({ enabled: isLoggedIn })
  const chatToastPreferences = useChatToastPreferences(userId)
  const globalUnreadCount = useChatUnreadStore((state) => state.globalUnreadCount)
  const groupUnreadCount = useChatUnreadStore((state) => state.groupUnreadCount)
  const setUnread = useChatUnreadStore((state) => state.setUnread)
  const setChatPanelState = useChatUnreadStore((state) => state.setChatPanelState)
  const markChatReadLocally = useChatUnreadStore((state) => state.markChatReadLocally)
  const snapshotUnreadLine = useChatUnreadStore((state) => state.snapshotUnreadLine)

  const hasGroup = isLoggedIn && group != null
  const isHomeGroup = hasGroup && group.isHomeGroup

  const [innerTab, setInnerTab] = useState<ChatInnerTab>(isHomeGroup ? 'global' : 'group')
  const [prevIsHomeGroup, setPrevIsHomeGroup] = useState(isHomeGroup)

  if (prevIsHomeGroup !== isHomeGroup) {
    setPrevIsHomeGroup(isHomeGroup)
    setInnerTab(isHomeGroup ? 'global' : 'group')
  }

  const activeChatType: ChatType = !hasGroup || innerTab === 'global' ? 'GLOBAL' : 'GROUP'
  const isCurrentToastEnabled =
    activeChatType === 'GLOBAL'
      ? chatToastPreferences.globalEnabled
      : chatToastPreferences.groupEnabled
  const currentToastLabel = activeChatType === 'GLOBAL' ? '전체 채팅 알림' : '그룹 채팅 알림'

  const tabs = useMemo<SegmentedTabItem<ChatInnerTab>[]>(() => {
    const groupLabel = isHomeGroup ? '메모' : '그룹'

    return [
      {
        key: 'group',
        label: (
          <TabLabel
            label={groupLabel}
            hasUnread={groupUnreadCount > 0 && innerTab !== 'group'}
            side="left"
          />
        )
      },
      {
        key: 'global',
        label: (
          <TabLabel
            label="전체"
            hasUnread={globalUnreadCount > 0 && innerTab !== 'global'}
            side="right"
          />
        )
      }
    ]
  }, [globalUnreadCount, groupUnreadCount, innerTab, isHomeGroup])

  useEffect(() => {
    setChatPanelState(true, activeChatType)

    return () => {
      setChatPanelState(false, null)
    }
  }, [activeChatType, setChatPanelState])

  useEffect(() => {
    if (!isLoggedIn) {
      return
    }

    let cancelled = false

    snapshotUnreadLine(activeChatType)
    markChatReadLocally(activeChatType)

    void markChatRead(activeChatType)
      .then(() => fetchChatUnread())
      .then((payload) => {
        if (cancelled) {
          return
        }
        setUnread(payload)
      })
      .catch((error) => {
        if (cancelled) {
          return
        }
        console.error('Failed to mark chat as read:', error)
      })

    return () => {
      cancelled = true
    }
  }, [activeChatType, isLoggedIn, markChatReadLocally, setUnread, snapshotUnreadLine])

  const handleToggleToast = () => {
    updateChatToastPreference(userId, activeChatType, !isCurrentToastEnabled)
  }

  if (!hasGroup) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 justify-end px-3 pt-2 pb-1">
          <ToastToggleButton
            checked={isCurrentToastEnabled}
            label={currentToastLabel}
            disabled={!isLoggedIn || !userId}
            onClick={handleToggleToast}
          />
        </div>
        <div className="min-h-0 flex-1">
          <GlobalChatRoom bare />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-center gap-3 px-3 pt-2 pb-1">
        <SegmentedTabs items={tabs} activeKey={innerTab} onChange={setInnerTab} />
        <ToastToggleButton
          checked={isCurrentToastEnabled}
          label={currentToastLabel}
          disabled={!isLoggedIn || !userId}
          onClick={handleToggleToast}
        />
      </div>
      <div className="min-h-0 flex-1">
        {innerTab === 'group' ? <GroupChatRoom bare /> : <GlobalChatRoom bare />}
      </div>
    </div>
  )
}
