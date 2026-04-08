/**
 * localStorage의 accessToken(JWT)에서 userId를 추출한다.
 * JWT payload의 sub 필드에 userId(UUID)가 들어있음.
 * 서명 검증은 서버가 하므로, 프론트에서는 Base64 디코딩만 수행.
 */
export function getCurrentUserId(): string {
  const token = localStorage.getItem('accessToken')
  if (!token) return ''

  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded.sub ?? ''
  } catch {
    return ''
  }
}
