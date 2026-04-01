import type { ApiResponse, SignupResponseData } from '../model/signup.schema'

type SignupRequest = {
  email: string
  nickname: string
  password: string
}

export async function signup(request: SignupRequest) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  })

  const result: ApiResponse<SignupResponseData | Record<string, string>> = await response.json()

  return {
    response,
    result
  }
}
