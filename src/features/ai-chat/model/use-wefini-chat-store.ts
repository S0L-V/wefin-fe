import { create } from 'zustand'

interface WefiniChatState {
  isOpen: boolean
  pendingPrompt: string | null
  open: () => void
  close: () => void
  toggle: () => void
  openWithPrompt: (prompt: string) => void
  consumePendingPrompt: () => string | null
}

/**
 * 위피니 AI 챗봇의 열림 상태와 외부에서 주입한 프롬프트를 전역에서 제어한다.
 *
 * 뉴스 상세 페이지의 "AI에게 더 물어보기" 질문 클릭처럼,
 * 위젯 외부 컴포넌트에서 챗봇을 열면서 입력창에 텍스트를 자동으로 채우기 위해 사용한다.
 */
export const useWefiniChatStore = create<WefiniChatState>((set, get) => ({
  isOpen: false,
  pendingPrompt: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  openWithPrompt: (prompt) => set({ isOpen: true, pendingPrompt: prompt }),
  consumePendingPrompt: () => {
    const prompt = get().pendingPrompt
    if (prompt !== null) set({ pendingPrompt: null })
    return prompt
  }
}))
