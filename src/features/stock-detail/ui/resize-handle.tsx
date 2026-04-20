import { useCallback, useEffect, useRef } from 'react'

interface ResizeHandleProps {
  direction?: 'horizontal' | 'vertical'
  onResize: (delta: number) => void
}

export default function ResizeHandle({ direction = 'horizontal', onResize }: ResizeHandleProps) {
  const dragging = useRef(false)
  const startPos = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      dragging.current = true
      startPos.current = direction === 'horizontal' ? e.clientX : e.clientY
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
      document.body.style.userSelect = 'none'
    },
    [direction]
  )

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragging.current) return
      const pos = direction === 'horizontal' ? e.clientX : e.clientY
      const delta = pos - startPos.current
      startPos.current = pos
      onResize(delta)
    }

    function handleMouseUp() {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [direction, onResize])

  if (direction === 'vertical') {
    return (
      <div
        onMouseDown={handleMouseDown}
        className="group flex h-2 shrink-0 cursor-row-resize items-center justify-center"
      >
        <div className="h-0.5 w-8 rounded-full bg-wefin-line transition-colors group-hover:bg-wefin-muted" />
      </div>
    )
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className="group flex w-2 shrink-0 cursor-col-resize items-center justify-center"
    >
      <div className="h-8 w-0.5 rounded-full bg-wefin-line transition-colors group-hover:bg-wefin-muted" />
    </div>
  )
}
