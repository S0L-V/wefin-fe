/**
 * localStorage의 accessToken(JWT)에서 userId를 추출한다.
 * JWT payload의 sub 필드에 userId(UUID)가 들어있음.
 * 서명 검증은 서버가 하므로, 프론트에서는 Base64URL 디코딩만 수행.
 *
 * 주의: JWT payload는 Base64URL 인코딩이라 `atob()`가 기대하는 표준 Base64와 다름.
 *   - `-` → `+`, `_` → `/` 치환
 *   - padding(`=`)을 4의 배수가 되도록 보정
 */
export function getCurrentUserId(): string {
  const token = localStorage.getItem('accessToken')
  if (!token) return ''

  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const decoded = JSON.parse(atob(padded))
    return decoded.sub ?? ''
  } catch {
    return ''
  }
}
