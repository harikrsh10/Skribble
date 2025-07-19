'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: number
}

interface ChatBoxProps {
  messages: Message[]
  currentUserId: string
  onSendMessage?: (message: string) => void
}

export default function ChatBox({ messages, currentUserId, onSendMessage }: ChatBoxProps) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !onSendMessage) return
    
    onSendMessage(newMessage.trim())
    setNewMessage('')
  }

  return (
    <div className="bg-white rounded-lg shadow h-96 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.userId === currentUserId ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg ${
                message.userId === currentUserId
                  ? 'bg-blue-500 text-white'
                  : message.userId === 'system'
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="text-sm font-medium">
                {message.userName}
                {message.userId !== 'system' && message.userId !== currentUserId && ' 🤖'}
              </div>
              <div className="text-sm">{message.message}</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
} 