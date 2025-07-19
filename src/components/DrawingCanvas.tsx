'use client'

import { useRef, useEffect, useState } from 'react'
import { useMutation } from '@/lib/liveblocks'

interface DrawingCanvasProps {
  isDrawer: boolean
  strokes: any[]
}

export default function DrawingCanvas({ isDrawer, strokes }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentStroke, setCurrentStroke] = useState<any[]>([])
  
  const addStroke = useMutation(({ storage }) => {
    if (currentStroke.length > 0) {
      const strokes = storage.get('canvas').strokes || []
      strokes.push({
        points: currentStroke,
        color: '#000000',
        width: 2
      })
      storage.set('canvas', { strokes })
      setCurrentStroke([])
    }
  }, [currentStroke])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw all strokes
    strokes.forEach(stroke => {
      if (stroke.points && stroke.points.length > 0) {
        ctx.beginPath()
        ctx.strokeStyle = stroke.color || '#000000'
        ctx.lineWidth = stroke.width || 2
        ctx.lineCap = 'round'
        
        stroke.points.forEach((point: any, index: number) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
          }
        })
        
        ctx.stroke()
      }
    })

    // Draw current stroke
    if (currentStroke.length > 0) {
      ctx.beginPath()
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      
      currentStroke.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      
      ctx.stroke()
    }
  }, [strokes, currentStroke])

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return
    
    setIsDrawing(true)
    const pos = getMousePos(e)
    setCurrentStroke([pos])
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawer || !isDrawing) return
    
    const pos = getMousePos(e)
    setCurrentStroke(prev => [...prev, pos])
  }

  const handleMouseUp = () => {
    if (!isDrawer) return
    
    setIsDrawing(false)
    addStroke()
  }

  const handleMouseLeave = () => {
    if (!isDrawer) return
    
    setIsDrawing(false)
    addStroke()
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300 rounded-lg cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDrawer ? 'crosshair' : 'default' }}
      />
    </div>
  )
} 