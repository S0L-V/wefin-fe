import { type ChangeEvent, type FormEvent, useState } from 'react'

import { ApiError } from '@/shared/api/base-api'

import { type IssueAccountRequest, issueAccountRequestSchema } from '../api/issue-account'
import { useIssueAccount } from './use-issue-account'

type FieldErrors = Partial<Record<keyof IssueAccountRequest, string>>

const initialForm: IssueAccountRequest = {
  accountType: 'CONTEST',
  email: '',
  password: '',
  nickname: '',
  targetGroupId: null
}

export function useAccountIssueForm() {
  const [form, setForm] = useState<IssueAccountRequest>(initialForm)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const issueAccount = useIssueAccount()

  const issuedAccount = issueAccount.data?.data ?? null

  const handleChange =
    <T extends keyof IssueAccountRequest>(field: T) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = parseFieldValue(field, event.target.value)

      setForm((current) => ({
        ...current,
        [field]: value as IssueAccountRequest[T]
      }))
      setFieldErrors((current) => ({ ...current, [field]: undefined }))
    }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = issueAccountRequestSchema.safeParse(form)

    if (!parsed.success) {
      setFieldErrors(parseFieldErrors(parsed.error.issues))
      return
    }

    setFieldErrors({})
    issueAccount.mutate(parsed.data)
  }

  return {
    form,
    fieldErrors,
    issuedAccount,
    errorMessage: getIssueAccountErrorMessage(issueAccount.error),
    isPending: issueAccount.isPending,
    isError: issueAccount.isError,
    handleChange,
    handleSubmit
  }
}

function parseFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: FieldErrors = {}

  issues.forEach((issue) => {
    const field = issue.path[0]
    if (isIssueAccountField(field)) {
      errors[field] ??= issue.message
    }
  })

  return errors
}

function isIssueAccountField(field: PropertyKey): field is keyof IssueAccountRequest {
  return (
    field === 'accountType' ||
    field === 'email' ||
    field === 'password' ||
    field === 'nickname' ||
    field === 'targetGroupId'
  )
}

function parseFieldValue(field: keyof IssueAccountRequest, value: string) {
  if (field !== 'targetGroupId') return value
  if (!value.trim()) return null
  return Number(value)
}

function getIssueAccountErrorMessage(error: unknown) {
  if (!error) return null

  if (error instanceof ApiError) {
    if (error.code === 'ADMIN_FORBIDDEN') return '관리자 권한이 없습니다.'
    if (error.code === 'AUTH_EMAIL_DUPLICATED') return '이미 사용 중인 이메일입니다.'
    if (error.code === 'AUTH_NICKNAME_DUPLICATED') return '이미 사용 중인 닉네임입니다.'
    if (error.code === 'AUTH_VALIDATION_FAILED') return '입력값을 확인해 주세요.'
    return error.message
  }

  return '계정 발급에 실패했습니다.'
}
