import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, X, Send, MapPin } from "lucide-react"
import { sendChatMessage } from "@/lib/api"
import { cn } from "@/lib/utils"

const INITIAL_MESSAGE = {
  id: 1,
  role: "assistant",
  content: "¡Hola! Soy tu asistente de Plannery. Dime tu presupuesto, lo que quieres hacer y te ayudo a organizar tu salida perfecta 🗺️"
}

function ChatMessage({ message }) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center
                        justify-center text-xs mr-2 shrink-0 mt-1">
          📍
        </div>
      )}
      <div className={cn(
        "max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
        isUser
          ? "bg-slate-800 text-white rounded-tr-sm"
          : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm"
      )}>
        <div dangerouslySetInnerHTML={{ __html: message.content }} />
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs shrink-0">
        📍
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm
                      px-4 py-3 shadow-sm flex gap-1 items-center">
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  )
}

export default function ChatPanel({ user, plans, open, onClose }) {
  const storageKey = `chat_${user.uid}`

  // Carga mensajes desde localStorage o usa el mensaje inicial
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : [INITIAL_MESSAGE]
    } catch {
      return [INITIAL_MESSAGE]
    }
  })

  const [input, setInput]   = useState("")
  const [typing, setTyping] = useState(false)
  const bottomRef           = useRef(null)
  const inputRef            = useRef(null)
  const hasPlans            = plans.length > 0

  // Persiste mensajes en localStorage cada vez que cambian
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch {
      // localStorage lleno — no es crítico
    }
  }, [messages, storageKey])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typing])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  async function handleSend() {
    const text = input.trim()
    if (!text || typing) return

    const userMessage = { id: Date.now(), role: "user", content: text }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setTyping(true)

    try {
      const data = await sendChatMessage({ userId: user.uid, message: text, plans })
      setMessages(prev => [...prev, {
        id:      Date.now() + 1,
        role:    "assistant",
        content: data.respuesta ?? "No pude generar una respuesta.",
      }])
    } catch {
      setMessages(prev => [...prev, {
        id:      Date.now() + 1,
        role:    "assistant",
        content: "Ocurrió un error al contactar al asistente. Intenta de nuevo.",
      }])
    } finally {
      setTyping(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!open) return null

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 h-[480px]
                    bg-slate-50 rounded-2xl shadow-2xl border border-slate-200
                    flex flex-col overflow-hidden">

      {/* Header */}
      <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
            📍
          </div>
          <div>
            <p className="text-sm font-semibold">Plannery IA</p>
            <p className="text-xs text-slate-300">
              {hasPlans
                ? `${plans.length} lugar${plans.length > 1 ? "es" : ""} en tu plan`
                : "Sin lugares guardados"}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mensajes con scroll */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-3">
        <div className="flex flex-col gap-3">
          {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
          {typing && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-slate-200 bg-white flex gap-2 shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={"Escribe un mensaje..." }
          disabled={typing}
          rows={1}
          className="flex-1 resize-none border border-slate-200 rounded-xl
                     px-3 py-2 text-sm outline-none focus:ring-2
                     focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Button size="icon" onClick={handleSend}
          disabled={!input.trim() || typing}
          className="shrink-0 rounded-xl cursor-pointer">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}