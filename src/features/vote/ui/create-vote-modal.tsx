import '@/app/styles/dialog.css'

import * as Dialog from '@radix-ui/react-dialog'
import { useQueryClient } from '@tanstack/react-query'
import { Check, ChevronDown, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { refreshTodayQuestsAfterRealtimeAction } from '@/features/quest/model/use-today-quests'
import { createVote } from '@/features/vote/api/create-vote'
import { ApiError } from '@/shared/api/base-api'

const DURATION_OPTIONS = [
  { value: 1, label: '1시간' },
  { value: 4, label: '4시간' },
  { value: 8, label: '8시간' },
  { value: 24, label: '24시간' },
  { value: 72, label: '72시간' }
] as const

const MIN_OPTION_COUNT = 2
const MAX_OPTION_COUNT = 5

interface CreateVoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: number | null
}

export default function CreateVoteModal({ open, onOpenChange, groupId }: CreateVoteModalProps) {
  const queryClient = useQueryClient()
  const maxSelectDropdownRef = useRef<HTMLDivElement>(null)
  const durationDropdownRef = useRef<HTMLDivElement>(null)
  const [title, setTitle] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [maxSelectCount, setMaxSelectCount] = useState(1)
  const [durationHours, setDurationHours] = useState<number>(24)
  const [isMaxSelectMenuOpen, setIsMaxSelectMenuOpen] = useState(false)
  const [isDurationMenuOpen, setIsDurationMenuOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setTitle('')
      setOptions(['', ''])
      setMaxSelectCount(1)
      setDurationHours(24)
      setIsMaxSelectMenuOpen(false)
      setIsDurationMenuOpen(false)
      setErrorMessage(null)
      setIsSubmitting(false)
    }
  }, [open])

  useEffect(() => {
    if (!isMaxSelectMenuOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!maxSelectDropdownRef.current?.contains(event.target as Node)) {
        setIsMaxSelectMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isMaxSelectMenuOpen])

  useEffect(() => {
    if (!isDurationMenuOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!durationDropdownRef.current?.contains(event.target as Node)) {
        setIsDurationMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isDurationMenuOpen])

  const optionCount = options.length
  const maxSelectChoices = useMemo(
    () => Array.from({ length: optionCount }, (_, index) => index + 1),
    [optionCount]
  )
  const selectedMaxSelectLabel = `${maxSelectCount}개`
  const selectedDurationLabel =
    DURATION_OPTIONS.find((option) => option.value === durationHours)?.label ?? '24시간'

  const handleOptionChange = (index: number, value: string) => {
    setOptions((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)))
  }

  const handleAddOption = () => {
    if (options.length >= MAX_OPTION_COUNT) {
      return
    }

    setOptions((current) => [...current, ''])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length <= MIN_OPTION_COUNT) {
      return
    }

    setOptions((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index)
      setMaxSelectCount((prev) => Math.min(prev, next.length))
      return next
    })
  }

  const handleSubmit = async () => {
    if (!groupId || isSubmitting) {
      return
    }

    const trimmedTitle = title.trim()
    const trimmedOptions = options.map((item) => item.trim())

    if (!trimmedTitle) {
      setErrorMessage('투표 주제를 입력해주세요.')
      return
    }

    if (trimmedOptions.some((item) => !item)) {
      setErrorMessage('모든 선택지를 입력해주세요.')
      return
    }

    if (new Set(trimmedOptions).size !== trimmedOptions.length) {
      setErrorMessage('중복된 선택지는 사용할 수 없습니다.')
      return
    }

    if (maxSelectCount > trimmedOptions.length) {
      setErrorMessage('최대 선택 개수는 선택지 개수를 넘을 수 없습니다.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await createVote({
        groupId,
        title: trimmedTitle,
        options: trimmedOptions,
        maxSelectCount,
        durationHours
      })

      refreshTodayQuestsAfterRealtimeAction(queryClient)
      onOpenChange(false)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('투표 생성에 실패했습니다. 다시 시도해주세요.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" style={{ zIndex: 70 }} />
        <Dialog.Content className="dialog-content" style={{ zIndex: 71, maxWidth: 520 }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-wefin-text">
                투표 만들기
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-wefin-subtle">
                투표를 만들어 사람들과 토론해보세요!
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-wefin-subtle transition hover:bg-wefin-bg"
                aria-label="투표 만들기 닫기"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-wefin-text">제목</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="무슨 주제를 토론하고 싶으신가요?"
                className="h-11 w-full rounded-xl border border-wefin-line bg-white px-3 text-sm text-wefin-text outline-none focus:border-wefin-mint"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-wefin-text">선택지</label>
                <button
                  type="button"
                  onClick={handleAddOption}
                  disabled={options.length >= MAX_OPTION_COUNT}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-wefin-mint transition hover:bg-wefin-mint-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={14} />
                  추가
                </button>
              </div>

              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={`vote-option-${index}`} className="flex items-center gap-2">
                    <input
                      value={option}
                      onChange={(event) => handleOptionChange(index, event.target.value)}
                      placeholder={`선택지 ${index + 1}`}
                      className="h-11 flex-1 rounded-xl border border-wefin-line bg-white px-3 text-sm text-wefin-text outline-none focus:border-wefin-mint"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      disabled={options.length <= MIN_OPTION_COUNT}
                      aria-label={`선택지 ${index + 1} 삭제`}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-wefin-line text-wefin-subtle transition hover:bg-wefin-bg disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-wefin-text">
                  1인 투표 수
                </label>
                <div ref={maxSelectDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMaxSelectMenuOpen((current) => !current)}
                    aria-haspopup="listbox"
                    aria-expanded={isMaxSelectMenuOpen}
                    className={`flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-left text-sm font-semibold text-wefin-text transition ${
                      isMaxSelectMenuOpen
                        ? 'border-wefin-mint bg-white shadow-[0_0_0_3px_rgba(28,184,165,0.12)]'
                        : 'border-wefin-line bg-wefin-bg hover:border-wefin-mint/60 hover:bg-white'
                    }`}
                  >
                    <span>{selectedMaxSelectLabel}</span>
                    <ChevronDown
                      size={18}
                      className={`text-wefin-subtle transition-transform ${
                        isMaxSelectMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isMaxSelectMenuOpen && (
                    <div className="absolute top-[calc(100%+8px)] left-0 z-10 w-full overflow-hidden rounded-2xl border border-wefin-line bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
                      <div
                        role="listbox"
                        aria-label="1인 투표 수 선택"
                        className="max-h-56 overflow-y-auto p-2"
                      >
                        {maxSelectChoices.map((count) => {
                          const isSelected = count === maxSelectCount

                          return (
                            <button
                              key={count}
                              type="button"
                              onClick={() => {
                                setMaxSelectCount(count)
                                setIsMaxSelectMenuOpen(false)
                              }}
                              role="option"
                              aria-selected={isSelected}
                              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition ${
                                isSelected
                                  ? 'bg-wefin-mint-soft text-wefin-mint-deep shadow-[inset_0_0_0_1px_rgba(28,184,165,0.14)]'
                                  : 'text-wefin-text hover:bg-wefin-bg'
                              }`}
                            >
                              <span className={isSelected ? 'font-semibold' : ''}>{count}개</span>
                              {isSelected && <Check size={16} className="text-wefin-mint-deep" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-wefin-text">지속 시간</label>
                <div ref={durationDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDurationMenuOpen((current) => !current)}
                    aria-haspopup="listbox"
                    aria-expanded={isDurationMenuOpen}
                    className={`flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-left text-sm font-semibold text-wefin-text transition ${
                      isDurationMenuOpen
                        ? 'border-wefin-mint bg-white shadow-[0_0_0_3px_rgba(28,184,165,0.12)]'
                        : 'border-wefin-line bg-wefin-bg hover:border-wefin-mint/60 hover:bg-white'
                    }`}
                  >
                    <span>{selectedDurationLabel}</span>
                    <ChevronDown
                      size={18}
                      className={`text-wefin-subtle transition-transform ${
                        isDurationMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isDurationMenuOpen && (
                    <div className="absolute top-[calc(100%+8px)] left-0 z-10 w-full overflow-hidden rounded-2xl border border-wefin-line bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
                      <div
                        role="listbox"
                        aria-label="지속 시간 선택"
                        className="max-h-56 overflow-y-auto p-2"
                      >
                        {DURATION_OPTIONS.map((option) => {
                          const isSelected = option.value === durationHours

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setDurationHours(option.value)
                                setIsDurationMenuOpen(false)
                              }}
                              role="option"
                              aria-selected={isSelected}
                              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition ${
                                isSelected
                                  ? 'bg-wefin-mint-soft text-wefin-mint-deep shadow-[inset_0_0_0_1px_rgba(28,184,165,0.14)]'
                                  : 'text-wefin-text hover:bg-wefin-bg'
                              }`}
                            >
                              <span className={isSelected ? 'font-semibold' : ''}>
                                {option.label}
                              </span>
                              {isSelected && <Check size={16} className="text-wefin-mint-deep" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {errorMessage}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-11 rounded-xl border border-wefin-line px-4 text-sm font-medium text-wefin-text transition hover:bg-wefin-bg"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleSubmit()
                }}
                disabled={!groupId || isSubmitting}
                className="h-11 rounded-xl bg-wefin-mint px-4 text-sm font-medium text-white transition hover:bg-wefin-mint-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? '생성 중...' : '투표 만들기'}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
