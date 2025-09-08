import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ConfigPanel } from './ConfigPanel'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface ChatResponse {
  message: string
}

async function sendMessage(
  message: string,
  settings: any,
): Promise<ChatResponse> {
  const response = await fetch('http://localhost:4000/api/completion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: message,
      params: {
        temperature: parseFloat(settings.temperature),
        top_p: settings.topP ? parseFloat(settings.topP) : undefined,
        top_k: settings.topK ? parseInt(settings.topK, 10) : undefined,
        reasoning_effort: settings.reasoningEffort,
      },
    }),
  })

  if (!response.ok) throw new Error('Error al enviar mensaje')

  const data = await response.json()
  return { message: data.message || data.content || 'Sin respuesta' }
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Array<Message>>([])
  const [inputValue, setInputValue] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const [settings, setSettings] = useState({
    temperature: '0.8',
    topK: '',
    topP: '',
    reasoningEffort: 'medium',
  })

  const chatMutation = useMutation({
    mutationFn: (msg: string) => sendMessage(msg, settings),
    onSuccess: (data) => {
      const botMessage: Message = {
        id: Date.now().toString() + '-bot',
        content: data.message,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    },
    onError: (error: any) => {
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        content: `❌ Error: ${error.message}`,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || chatMutation.isPending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    chatMutation.mutate(inputValue)
    setInputValue('')
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          🤖 Chat Assistant
        </h1>
        <button
          onClick={() => setShowSettings((prev) => !prev)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          ⚙ Configuración
        </button>
      </div>

      {showSettings && (
        <div className="bg-white border-b p-4 shadow-sm">
          <ConfigPanel settings={settings} onChange={setSettings} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <span className="text-4xl block mb-2">💬</span>
            <p>¡Hola! Escribe un mensaje para comenzar.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start gap-2 max-w-xs md:max-w-md lg:max-w-lg`}
              >
                {!message.isUser && (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    🤖
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      message.isUser ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.isUser && (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    👤
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div className="bg-white border border-gray-200 rounded-lg rounded-bl-sm px-4 py-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">Escribiendo</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={chatMutation.isPending}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            📤
          </button>
        </form>
      </div>
    </div>
  )
}
