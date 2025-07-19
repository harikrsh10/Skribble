'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Point, Stroke } from '@/types/game'
import { debounce, throttle } from '@/utils/gameUtils'

interface EnhancedDrawingCanvasProps {
  isDrawer: boolean
  strokes: Stroke[]
  onStrokesChange: (strokes: Stroke[]) => void
}

export default function EnhancedDrawingCanvas({ 
  isDrawer, 
  strokes, 
  onStrokesChange 
}: EnhancedDrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null)
  const [tool, setTool] = useState<'draw' | 'eraser' | 'shape'>('draw')
  const [shape, setShape] = useState<'rectangle' | 'circle' | 'triangle'>('rectangle')
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(2)
  const [isDrawingShape, setIsDrawingShape] = useState(false)
  const [shapeStartPoint, setShapeStartPoint] = useState<Point | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  // Memoized canvas context
  const canvasContext = useMemo(() => {
    const canvas = canvasRef.current
    return canvas ? canvas.getContext('2d') : null
  }, [canvasRef.current])

  // Handle canvas resize with debouncing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = debounce(() => {
      const container = canvas.parentElement
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const maxWidth = containerRect.width - 32
      const maxHeight = 600
      
      const aspectRatio = 4 / 3
      let width = maxWidth
      let height = width / aspectRatio
      
      if (height > maxHeight) {
        height = maxHeight
        width = height * aspectRatio
      }
      
      canvas.width = width
      canvas.height = height
      setCanvasSize({ width, height })
    }, 100)

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  // Optimized drawing function with memoization
  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (!stroke.points || stroke.points.length === 0) return

    ctx.beginPath()
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    const points = stroke.points
    ctx.moveTo(points[0].x, points[0].y)
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    
    ctx.stroke()
  }, [])

  // Optimized shape drawing
  const drawShape = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (!stroke.startPoint || !stroke.points[1]) return

    const start = stroke.startPoint
    const end = stroke.points[1]
    
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.fillStyle = stroke.color + '20'

    switch (stroke.shape) {
      case 'rectangle': {
        const width = end.x - start.x
        const height = end.y - start.y
        ctx.strokeRect(start.x, start.y, width, height)
        ctx.fillRect(start.x, start.y, width, height)
        break
      }
      
      case 'circle': {
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
        ctx.beginPath()
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.fill()
        break
      }
      
      case 'triangle': {
        const centerX = (start.x + end.x) / 2
        const centerY = start.y
        const bottomLeftX = start.x
        const bottomRightX = end.x
        const bottomY = end.y
        
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(bottomLeftX, bottomY)
        ctx.lineTo(bottomRightX, bottomY)
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
        break
      }
    }
  }, [])

  // Optimized canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvasContext
    if (!canvas || !ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw all strokes in batch
    strokes.forEach(stroke => {
      if (stroke.type === 'shape' && stroke.shape && stroke.startPoint) {
        drawShape(ctx, stroke)
      } else if (stroke.points && stroke.points.length > 0) {
        drawStroke(ctx, stroke)
      }
    })

    // Draw current stroke
    if (currentStroke) {
      if (currentStroke.type === 'shape' && currentStroke.startPoint && shapeStartPoint) {
        drawShape(ctx, {
          ...currentStroke,
          points: [currentStroke.startPoint, shapeStartPoint]
        })
      } else if (currentStroke.points && currentStroke.points.length > 0) {
        drawStroke(ctx, currentStroke)
      }
    }
  }, [strokes, currentStroke, shapeStartPoint, canvasContext, drawStroke, drawShape])

  // Optimized mouse position calculation
  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }, [])

  // Throttled mouse move handler for better performance
  const handleMouseMove = useMemo(
    () => throttle((e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawer || !isDrawing) return
      
      const pos = getMousePos(e)
      
      if (tool === 'shape' && isDrawingShape && shapeStartPoint) {
        setShapeStartPoint(pos)
      } else if (currentStroke && currentStroke.points) {
        setCurrentStroke(prev => prev ? {
          ...prev,
          points: [...prev.points, pos]
        } : null)
      }
    }, 16), // ~60fps
    [isDrawer, isDrawing, tool, isDrawingShape, shapeStartPoint, currentStroke, getMousePos]
  )

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return
    
    const pos = getMousePos(e)
    
    if (tool === 'shape') {
      setIsDrawingShape(true)
      setShapeStartPoint(pos)
      setCurrentStroke({
        points: [],
        color,
        width: brushSize,
        type: 'shape',
        shape,
        startPoint: pos
      })
    } else {
      setIsDrawing(true)
      setCurrentStroke({
        points: [pos],
        color: tool === 'eraser' ? '#ffffff' : color,
        width: brushSize,
        type: tool
      })
    }
  }, [isDrawer, tool, color, brushSize, shape, getMousePos])

  const handleMouseUp = useCallback(() => {
    if (!isDrawer) return
    
    if (currentStroke) {
      const newStrokes = [...strokes, currentStroke]
      onStrokesChange(newStrokes)
    }
    
    setIsDrawing(false)
    setIsDrawingShape(false)
    setCurrentStroke(null)
    setShapeStartPoint(null)
  }, [isDrawer, currentStroke, strokes, onStrokesChange])

  const handleMouseLeave = useCallback(() => {
    handleMouseUp()
  }, [handleMouseUp])

  const clearCanvas = useCallback(() => {
    onStrokesChange([])
  }, [onStrokesChange])

  const undoLastStroke = useCallback(() => {
    if (strokes.length > 0) {
      onStrokesChange(strokes.slice(0, -1))
    }
  }, [strokes, onStrokesChange])

  // Tool buttons with memoization
  const toolButtons = useMemo(() => [
    { id: 'draw', label: '✏️', tool: 'draw' as const },
    { id: 'eraser', label: '🧽', tool: 'eraser' as const },
    { id: 'shape', label: '🔷', tool: 'shape' as const }
  ], [])

  const shapeButtons = useMemo(() => [
    { id: 'rectangle', label: '⬜', shape: 'rectangle' as const },
    { id: 'circle', label: '⭕', shape: 'circle' as const },
    { id: 'triangle', label: '🔺', shape: 'triangle' as const }
  ], [])

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Drawing tools */}
        <div className="flex gap-1">
          {toolButtons.map(({ id, label, tool: toolType }) => (
            <button
              key={id}
              onClick={() => setTool(toolType)}
              className={`p-2 rounded ${tool === toolType ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              disabled={!isDrawer}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Shape tools (only show when shape tool is selected) */}
        {tool === 'shape' && (
          <div className="flex gap-1">
            {shapeButtons.map(({ id, label, shape: shapeType }) => (
              <button
                key={id}
                onClick={() => setShape(shapeType)}
                className={`p-2 rounded ${shape === shapeType ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                disabled={!isDrawer}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Color picker */}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 rounded border cursor-pointer"
          disabled={!isDrawer}
        />

        {/* Brush size */}
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-20"
          disabled={!isDrawer}
        />

        {/* Action buttons */}
        <div className="flex gap-1">
          <button
            onClick={undoLastStroke}
            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={!isDrawer || strokes.length === 0}
          >
            ↩️ Undo
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={!isDrawer}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair block w-full"
          style={{ 
            maxWidth: '100%', 
            height: 'auto',
            touchAction: 'none' // Prevent touch scrolling on mobile
          }}
        />
      </div>

      {/* Status */}
      {!isDrawer && (
        <div className="mt-2 text-center text-gray-600">
          You are not the current drawer
        </div>
      )}
    </div>
  )
} 