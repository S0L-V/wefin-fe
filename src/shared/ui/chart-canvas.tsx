import { useEffect, useRef } from 'react'

interface Candle {
  open: number
  close: number
  high: number
  low: number
}

interface ChartLine {
  candles: Candle[]
  speed: number
  offset: number
  opacity: number
  y: number
  scale: number
}

const LINE_COUNT = 4

function generateCandles(count: number, scale: number): Candle[] {
  const candles: Candle[] = []
  let price = 0
  let trend = 0

  for (let i = 0; i < count; i++) {
    if (Math.random() < 0.1) trend = (Math.random() - 0.5) * scale * 1.0
    trend *= 0.94

    const open = price
    const move = trend + (Math.random() - 0.49) * scale * 0.7
    price += move
    const close = price

    const wick = Math.abs(close - open) * (0.6 + Math.random() * 1.5)
    const high = Math.max(open, close) + Math.random() * wick
    const low = Math.min(open, close) - Math.random() * wick

    candles.push({ open, close, high, low })
  }
  return candles
}

export default function ChartCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const mouseRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dpr = window.devicePixelRatio || 1

    const resize = () => {
      dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const w = () => window.innerWidth
    const h = () => window.innerHeight

    const lines: ChartLine[] = []
    for (let i = 0; i < LINE_COUNT; i++) {
      const layer = i / (LINE_COUNT - 1)
      lines.push({
        candles: generateCandles(500, 8 + layer * 15),
        speed: 0.04 + layer * 0.02,
        offset: 0,
        opacity: 0.1 + layer * 0.15,
        y: 0.2 + layer * 0.5,
        scale: 8 + layer * 15
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    const animate = () => {
      const cw = w()
      const ch = h()
      ctx.clearRect(0, 0, cw, ch)

      const mouse = mouseRef.current

      const candleW = 7
      const gap = 3
      const step = candleW + gap

      for (const line of lines) {
        line.offset += line.speed

        if (line.offset > line.candles.length - cw / step - 20) {
          const more = generateCandles(200, line.scale)
          line.candles.push(...more)
        }

        const baseY = ch * line.y
        const startIdx = Math.floor(line.offset)
        const pixelOffset = (line.offset - startIdx) * step

        for (let i = 0; i < Math.ceil(cw / step) + 2; i++) {
          const ci = startIdx + i
          if (ci < 0 || ci >= line.candles.length) continue

          const candle = line.candles[ci]
          const x = i * step - pixelOffset
          if (x < -step || x > cw + step) continue

          const edgeFade = Math.min(x / (cw * 0.15), 1, (cw - x) / (cw * 0.15))
          let op = line.opacity * Math.max(0.15, edgeFade)

          let oY = baseY + candle.open
          let cY = baseY + candle.close
          let hY = baseY + candle.high
          let lY = baseY + candle.low

          const cx = x + candleW / 2
          const midY = (oY + cY) / 2

          if (mouse.x > 0 && mouse.y > 0) {
            const dx = cx - mouse.x
            const dy = midY - mouse.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 200) {
              const fade = 1 - dist / 200
              const push = fade * fade * 40
              const dir = dy > 0 ? 1 : -1
              oY += dir * push
              cY += dir * push
              hY += dir * push
              lY += dir * push
              op = Math.min(op + fade * 0.3, 0.8)
            }
          }

          const isUp = candle.close >= candle.open
          const r = isUp ? 239 : 59
          const g = isUp ? 68 : 130
          const b = isUp ? 68 : 246

          // glow
          if (op > 0.15) {
            const glowSize = Math.abs(cY - oY) + 8
            const glow = ctx.createRadialGradient(cx, midY, 0, cx, midY, glowSize)
            glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${op * 0.2})`)
            glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
            ctx.beginPath()
            ctx.arc(cx, midY, glowSize, 0, Math.PI * 2)
            ctx.fillStyle = glow
            ctx.fill()
          }

          // wick
          ctx.beginPath()
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${op * 0.8})`
          ctx.lineWidth = 1
          ctx.moveTo(cx, hY)
          ctx.lineTo(cx, lY)
          ctx.stroke()

          // body
          const bodyTop = Math.min(oY, cY)
          const bodyH = Math.max(Math.abs(cY - oY), 1.5)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${op})`
          ctx.beginPath()
          ctx.roundRect(x, bodyTop, candleW, bodyH, 1)
          ctx.fill()
        }
      }

      // mouse spotlight
      if (mouse.x > 0 && mouse.y > 0) {
        const spot = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150)
        spot.addColorStop(0, 'rgba(255, 255, 255, 0.05)')
        spot.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)')
        spot.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 150, 0, Math.PI * 2)
        ctx.fillStyle = spot
        ctx.fill()

        // crosshair
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
        ctx.lineWidth = 0.5
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(mouse.x, 0)
        ctx.lineTo(mouse.x, ch)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, mouse.y)
        ctx.lineTo(cw, mouse.y)
        ctx.stroke()
        ctx.setLineDash([])
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />
  )
}
