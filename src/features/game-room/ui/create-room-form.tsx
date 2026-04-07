import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useCreateRoomForm } from '../model/use-create-room-form'

function formatSeedLabel(value: number) {
  return `${(value / 10_000).toLocaleString()}만원`
}

function formatPeriodLabel(months: number) {
  if (months === 12) return '1년'
  return `${months}개월`
}

function CreateRoomForm() {
  const navigate = useNavigate()
  const {
    seedMoney,
    setSeedMoney,
    periodMonths,
    setPeriodMonths,
    moveDays,
    setMoveDays,
    handleSubmit,
    errorMessage,
    isSubmitting,
    seedOptions,
    periodOptions,
    moveDaysOptions,
    disabledPeriods
  } = useCreateRoomForm()

  return (
    <div className="mx-auto max-w-lg">
      <Header onBack={() => navigate('/history')} />

      <div className="mt-6 rounded-2xl border border-wefin-line bg-white p-6">
        <h2 className="mb-6 text-lg font-bold text-wefin-text">게임 설정</h2>

        <OptionGroup label="시드머니">
          {seedOptions.map((value) => (
            <OptionButton
              key={value}
              selected={seedMoney === value}
              onClick={() => setSeedMoney(value)}
            >
              {formatSeedLabel(value)}
            </OptionButton>
          ))}
        </OptionGroup>

        <OptionGroup label="게임 기간">
          {periodOptions.map((value) => (
            <OptionButton
              key={value}
              selected={periodMonths === value}
              disabled={disabledPeriods.includes(value)}
              onClick={() => setPeriodMonths(value)}
            >
              {formatPeriodLabel(value)}
            </OptionButton>
          ))}
        </OptionGroup>

        <OptionGroup label="이동 단위">
          {moveDaysOptions.map((value) => (
            <OptionButton
              key={value}
              selected={moveDays === value}
              onClick={() => setMoveDays(value)}
            >
              {value}일
            </OptionButton>
          ))}
        </OptionGroup>

        {errorMessage && (
          <p className="mt-4 text-center text-sm text-red-500" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="mt-4 w-full rounded-xl bg-wefin-mint py-3.5 text-base font-semibold text-white transition-colors hover:bg-wefin-mint/90 disabled:opacity-50"
        >
          {isSubmitting ? '생성 중...' : '게임 시작'}
        </button>
      </div>
    </div>
  )
}

export default CreateRoomForm

// --- Sub Components ---

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        aria-label="뒤로 가기"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-wefin-line transition-colors hover:bg-wefin-bg"
      >
        <ArrowLeft className="h-5 w-5 text-wefin-text" />
      </button>
      <div>
        <h1 className="text-xl font-bold text-wefin-text">게임 설정</h1>
        <p className="text-sm text-wefin-subtle">투자 분석을 설정하세요</p>
      </div>
    </div>
  )
}

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-sm font-medium text-wefin-subtle" id={`label-${label}`}>
        {label}
      </p>
      <div className="flex gap-2" role="radiogroup" aria-labelledby={`label-${label}`}>
        {children}
      </div>
    </div>
  )
}

function OptionButton({
  selected,
  disabled,
  onClick,
  children
}: {
  selected: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  if (disabled) {
    return (
      <button
        disabled
        role="radio"
        aria-checked={false}
        className="flex-1 rounded-xl border border-wefin-line bg-gray-50 py-2.5 text-sm text-gray-300"
      >
        {children}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
        selected
          ? 'border-wefin-mint bg-wefin-mint-soft text-wefin-mint'
          : 'border-wefin-line bg-white text-wefin-text hover:bg-wefin-bg'
      }`}
    >
      {children}
    </button>
  )
}
