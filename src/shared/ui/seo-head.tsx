import { Helmet } from 'react-helmet-async'

interface SeoHeadProps {
  title?: string
  description?: string
  path?: string
}

const DEFAULT_TITLE = 'WeFin — 과거에서 배우고, 현재에 투자하는 모의투자'
const DEFAULT_DESCRIPTION =
  '한국투자증권 Open API 기반 실시간 시세로 모의투자를 경험하세요. 실시간 거래, 타임머신 투자, AI 시장 브리핑을 제공합니다.'
const SITE_URL = 'https://www.wefin.ai.kr'

export default function SeoHead({ title, description, path }: SeoHeadProps) {
  const pageTitle = title ? `${title} | WeFin` : DEFAULT_TITLE
  const pageDescription = description ?? DEFAULT_DESCRIPTION
  const pageUrl = path ? `${SITE_URL}${path}` : SITE_URL

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={pageUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content="WeFin" />
      <meta property="og:image" content={`${SITE_URL}/og-image.png`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
    </Helmet>
  )
}
