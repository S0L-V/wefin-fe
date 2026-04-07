import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ApiError } from '@/shared/api/base-api'

import { useCreateGameRoomMutation } from './use-game-room-query'

const SEED_OPTIONS = [5_000_000, 10_000_000, 30_000_000] as const
const PERIOD_OPTIONS = [3, 6, 12] as const
const MOVE_DAYS_OPTIONS = [7, 14] as const
const DISABLED_PERIODS: readonly number[] = [12]

export function useCreateRoomForm() {
  const navigate = useNavigate()
  const mutation = useCreateGameRoomMutation()

  const [seedMoney, setSeedMoney] = useState<number>(10_000_000)
  const [periodMonths, setPeriodMonths] = useState<number>(6)
  const [moveDays, setMoveDays] = useState<number>(7)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function handleSubmit() {
    if (mutation.isPending) return
    setErrorMessage(null)

    mutation.mutate(
      { seedMoney, periodMonths, moveDays },
      {
        onSuccess: (data) => {
          const roomId = data.data.roomId
          navigate(`/history/room/${roomId}`)
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            setErrorMessage(error.message)
          } else {
            setErrorMessage('방 생성에 실패했습니다. 다시 시도해주세요.')
          }
        }
      }
    )
  }

  return {
    seedMoney,
    setSeedMoney,
    periodMonths,
    setPeriodMonths,
    moveDays,
    setMoveDays,
    handleSubmit,
    errorMessage,
    isSubmitting: mutation.isPending,
    seedOptions: SEED_OPTIONS,
    periodOptions: PERIOD_OPTIONS,
    moveDaysOptions: MOVE_DAYS_OPTIONS,
    disabledPeriods: DISABLED_PERIODS
  }
}
