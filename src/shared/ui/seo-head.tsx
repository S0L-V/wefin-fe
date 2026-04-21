import { Helmet } from 'react-helmet-async'

interface SeoHeadProps {
  title?: string
  description?: string
  path?: string
  type?: 'website' | 'article'
}

const DEFAULT_TITLE = 'WeFin — 과거에서 배우고, 현재에 투자하는 모의투자'
const DEFAULT_DESCRIPTION =
  '실시간 모의투자 트레이딩 시스템. 실시간 거래, 타임머신 투자, AI 시장 브리핑을 제공합니다.'
const SITE_URL = 'https://www.wefin.ai.kr'
const MAX_DESC_LENGTH = 155

function truncateDescription(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= MAX_DESC_LENGTH) return normalized
  return normalized.slice(0, MAX_DESC_LENGTH - 1) + '\u2026'
}

export default function SeoHead({ title, description, path, type = 'website' }: SeoHeadProps) {
  const pageTitle = title ? `${title} | WeFin` : DEFAULT_TITLE
  const pageDescription = truncateDescription(description ?? DEFAULT_DESCRIPTION)
  const pageUrl = path ? `${SITE_URL}${path}` : SITE_URL
  const ogImage = `${SITE_URL}/og-image.png`

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={pageUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content="WeFin" />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}
