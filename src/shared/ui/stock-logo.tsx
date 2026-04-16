import { useState } from 'react'

interface StockLogoProps {
  code: string
  name: string
  size?: number
}

const LOGO_SOURCES = [
  (code: string) => `https://ssl.pstatic.net/imgstock/item/logo/${code}.png`,
  (code: string) => `https://static.toss.im/png-icons/securities/icn-sec-fill-${code}.png`
]

export default function StockLogo({ code, name, size = 36 }: StockLogoProps) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const [allFailed, setAllFailed] = useState(false)

  const handleError = () => {
    if (sourceIndex < LOGO_SOURCES.length - 1) {
      setSourceIndex((i) => i + 1)
    } else {
      setAllFailed(true)
    }
  }

  if (allFailed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-wefin-mint-soft text-xs font-bold text-wefin-mint"
        style={{ width: size, height: size }}
      >
        {name.charAt(0)}
      </div>
    )
  }

  return (
    <img
      src={LOGO_SOURCES[sourceIndex](code)}
      alt={name}
      width={size}
      height={size}
      onError={handleError}
      className="shrink-0 rounded-full bg-white object-contain"
      style={{ width: size, height: size }}
    />
  )
}
