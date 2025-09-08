import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ConfigPanel } from '@components/ConfigPanel'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface ChatResponse {
  message: string
}

// 🔹 Función para llamar al servidor
async function sendMessage(message: string, settings: any): Promise<ChatResponse> {
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
    temperature: "0.8",
    topK: "",
    topP: "",
    reasoningEffort: "medium",
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
      {/* Header */}
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

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ... mismo código que ya tenías para mostrar mensajes ... */}
      </div>

      {/* Input */}
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
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            📤
          </button>
        </form>
      </div>
    </div>
  )
}
