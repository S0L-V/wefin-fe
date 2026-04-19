const HIGHLIGHT_PATTERN =
  /(\d[\d,.]*%|\d[\d,.]*원|\d[\d,.]*억|\d[\d,.]*조|\d[\d,.]*달러|[+-]?\d[\d,.]*(?:포인트|bp))|([A-Z가-힣][A-Z가-힣\d]*(?:전자|하이닉스|중공업|오션|증권|은행|제약|바이오|화학|건설|에너지|반도체|자동차|항공|조선|코스피|나스닥|환율|금리))/g

export default function HighlightedText({ text }: { text: string }) {
  const parts: { text: string; highlight: boolean }[] = []
  let lastIndex = 0

  for (const match of text.matchAll(HIGHLIGHT_PATTERN)) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), highlight: false })
    }
    parts.push({ text: match[0], highlight: true })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false })
  }

  if (parts.length === 0) return <>{text}</>

  return (
    <>
      {parts.map((part, i) =>
        part.highlight ? (
          <span key={i} className="font-bold text-[#0a5c5e]">
            {part.text}
          </span>
        ) : (
          part.text
        )
      )}
    </>
  )
}
