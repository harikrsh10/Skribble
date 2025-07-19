'use client'

import { useRef, useEffect, useState } from 'react'

interface Point {
  x: number
  y: number
}

interface Stroke {
  points: Point[]
  color: string
  width: number
  type: 'draw' | 'eraser' | 'shape'
  shape?: 'rectangle' | 'circle' | 'triangle'
  startPoint?: Point
}

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

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const maxWidth = containerRect.width - 32 // Account for padding
      const maxHeight = 600
      
      // Maintain aspect ratio
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
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw all strokes
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
  }, [strokes, currentStroke, shapeStartPoint])

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    ctx.beginPath()
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    stroke.points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    
    ctx.stroke()
  }

  const drawShape = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (!stroke.startPoint || !stroke.points[1]) return

    const start = stroke.startPoint
    const end = stroke.points[1]
    
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.fillStyle = stroke.color + '20' // Add transparency for fill

    switch (stroke.shape) {
      case 'rectangle':
        const width = end.x - start.x
        const height = end.y - start.y
        ctx.strokeRect(start.x, start.y, width, height)
        ctx.fillRect(start.x, start.y, width, height)
        break
      
      case 'circle':
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
        ctx.beginPath()
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.fill()
        break
      
      case 'triangle':
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

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
        width: tool === 'eraser' ? 20 : brushSize,
        type: tool
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return
    
    const pos = getMousePos(e)
    
    if (tool === 'shape' && isDrawingShape && shapeStartPoint) {
      setShapeStartPoint(pos)
    } else if (isDrawing && currentStroke) {
      setCurrentStroke(prev => prev ? {
        ...prev,
        points: [...prev.points, pos]
      } : null)
    }
  }

  const handleMouseUp = () => {
    if (!isDrawer) return
    
    if (tool === 'shape' && isDrawingShape && currentStroke && shapeStartPoint) {
      // Add the shape to strokes
      const newStroke: Stroke = {
        ...currentStroke,
        points: [currentStroke.startPoint!, shapeStartPoint]
      }
      onStrokesChange([...strokes, newStroke])
      setIsDrawingShape(false)
      setShapeStartPoint(null)
    } else if (isDrawing && currentStroke && currentStroke.points.length > 0) {
      // Add the stroke to strokes
      onStrokesChange([...strokes, currentStroke])
    }
    
    setIsDrawing(false)
    setCurrentStroke(null)
  }

  const handleMouseLeave = () => {
    handleMouseUp()
  }

  const clearCanvas = () => {
    onStrokesChange([])
  }

  const undoLastStroke = () => {
    if (strokes.length > 0) {
      onStrokesChange(strokes.slice(0, -1))
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      {/* Toolbar */}
      {isDrawer && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap items-center gap-4">
            {/* Tool Selection */}
            <div className="flex gap-2">
              <button
                onClick={() => setTool('draw')}
                className={`p-2 rounded ${tool === 'draw' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                title="Draw"
              >
                ✏️
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`p-2 rounded ${tool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                title="Eraser"
              >
                🧽
              </button>
              <button
                onClick={() => setTool('shape')}
                className={`p-2 rounded ${tool === 'shape' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                title="Shapes"
              >
                ⬜
              </button>
            </div>

            {/* Shape Selection (only when shape tool is active) */}
            {tool === 'shape' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShape('rectangle')}
                  className={`p-2 rounded ${shape === 'rectangle' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                  title="Rectangle"
                >
                  ⬜
                </button>
                <button
                  onClick={() => setShape('circle')}
                  className={`p-2 rounded ${shape === 'circle' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                  title="Circle"
                >
                  ⭕
                </button>
                <button
                  onClick={() => setShape('triangle')}
                  className={`p-2 rounded ${shape === 'triangle' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                  title="Triangle"
                >
                  🔺
                </button>
              </div>
            )}

            {/* Color Picker */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Color:</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
            </div>

            {/* Brush Size */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Size:</label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-600 w-6">{brushSize}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={undoLastStroke}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                title="Undo"
              >
                ↩️ Undo
              </button>
              <button
                onClick={clearCanvas}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                title="Clear Canvas"
              >
                🗑️ Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded-lg cursor-crosshair w-full max-w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ 
          cursor: isDrawer 
            ? tool === 'eraser' 
              ? 'crosshair' 
              : tool === 'shape' 
                ? 'crosshair' 
                : 'crosshair'
            : 'default',
          maxHeight: '600px'
        }}
      />
    </div>
  )
} 