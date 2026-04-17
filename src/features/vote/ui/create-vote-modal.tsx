import '@/app/styles/dialog.css'

import * as Dialog from '@radix-ui/react-dialog'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { refreshTodayQuestsAfterRealtimeAction } from '@/features/quest/model/use-today-quests'
import { createVote } from '@/features/vote/api/create-vote'
import { ApiError } from '@/shared/api/base-api'

const DURATION_OPTIONS = [
  { value: 1, label: '1h' },
  { value: 4, label: '4h' },
  { value: 8, label: '8h' },
  { value: 24, label: '24h' },
  { value: 72, label: '72h' }
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
  const [title, setTitle] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [maxSelectCount, setMaxSelectCount] = useState(1)
  const [durationHours, setDurationHours] = useState<number>(24)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setTitle('')
      setOptions(['', ''])
      setMaxSelectCount(1)
      setDurationHours(24)
      setErrorMessage(null)
      setIsSubmitting(false)
    }
  }, [open])

  const optionCount = options.length
  const maxSelectChoices = useMemo(
    () => Array.from({ length: optionCount }, (_, index) => index + 1),
    [optionCount]
  )

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
      setErrorMessage('Please enter a title.')
      return
    }

    if (trimmedOptions.some((item) => !item)) {
      setErrorMessage('Please fill in all options.')
      return
    }

    if (new Set(trimmedOptions).size !== trimmedOptions.length) {
      setErrorMessage('Duplicate options are not allowed.')
      return
    }

    if (maxSelectCount > trimmedOptions.length) {
      setErrorMessage('Max selections cannot exceed option count.')
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
        setErrorMessage('Failed to create vote. Please try again.')
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
                Create Vote
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-wefin-subtle">
                Create a vote and share it directly into the group chat.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-wefin-subtle transition hover:bg-wefin-bg"
                aria-label="Close vote modal"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-wefin-text">Title</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="What should we decide?"
                className="h-11 w-full rounded-xl border border-wefin-line bg-white px-3 text-sm text-wefin-text outline-none focus:border-wefin-mint"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-wefin-text">Options</label>
                <button
                  type="button"
                  onClick={handleAddOption}
                  disabled={options.length >= MAX_OPTION_COUNT}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-wefin-mint transition hover:bg-wefin-mint-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>

              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={`vote-option-${index}`} className="flex items-center gap-2">
                    <input
                      value={option}
                      onChange={(event) => handleOptionChange(index, event.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="h-11 flex-1 rounded-xl border border-wefin-line bg-white px-3 text-sm text-wefin-text outline-none focus:border-wefin-mint"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      disabled={options.length <= MIN_OPTION_COUNT}
                      aria-label={`Remove option ${index + 1}`}
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
                  Max selections
                </label>
                <select
                  value={maxSelectCount}
                  onChange={(event) => setMaxSelectCount(Number(event.target.value))}
                  className="h-11 w-full rounded-xl border border-wefin-line bg-white px-3 text-sm text-wefin-text outline-none focus:border-wefin-mint"
                >
                  {maxSelectChoices.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-wefin-text">Duration</label>
                <select
                  value={durationHours}
                  onChange={(event) => setDurationHours(Number(event.target.value))}
                  className="h-11 w-full rounded-xl border border-wefin-line bg-white px-3 text-sm text-wefin-text outline-none focus:border-wefin-mint"
                >
                  {DURATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleSubmit()
                }}
                disabled={!groupId || isSubmitting}
                className="h-11 rounded-xl bg-wefin-mint px-4 text-sm font-medium text-white transition hover:bg-wefin-mint-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? 'Creating...' : 'Create vote'}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
