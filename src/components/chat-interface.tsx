"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Image as ImageIcon, Loader2, Brain } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  userId: string
}

export function ChatInterface({ userId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversation history on mount
  useEffect(() => {
    const loadConversationHistory = async () => {
      try {
        setIsLoadingHistory(true)
        const response = await fetch(`/api/user/${userId}/conversations?session_id=default`)
        
        if (response.ok) {
          const data = await response.json()
          
          // Add welcome message if no previous messages
          if (!data.messages || data.messages.length === 0) {
            setMessages([{
              id: "welcome",
              role: "assistant",
              content: "Hej! Jeg er din AI-psykolog. Jeg er her for at lytte og hjælpe dig med at udforske dine tanker og følelser. Hvad har du på hjerte i dag?",
              timestamp: new Date()
            }])
          } else {
            // Convert backend messages to frontend format
            const convertedMessages: Message[] = data.messages.map((msg: any) => ({
              id: msg.id,
              role: msg.role as "user" | "assistant",
              content: msg.content,
              timestamp: new Date(msg.timestamp)
            }))
            setMessages(convertedMessages)
          }
        }
      } catch (error) {
        console.error("Error loading conversation history:", error)
        // Show welcome message on error
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: "Hej! Jeg er din AI-psykolog. Jeg er her for at lytte og hjælpe dig med at udforske dine tanker og følelser. Hvad har du på hjerte i dag?",
          timestamp: new Date()
        }])
      } finally {
        setIsLoadingHistory(false)
      }
    }

    if (userId) {
      loadConversationHistory()
    }
  }, [userId])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Check for /dagbog command
      if (inputValue.trim().toLowerCase() === "/dagbog") {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Jeg har oprettet en ny dagbogsindgang for dig. Gå til Dagbog-fanen for at begynde at skrive. Hvad vil du gerne udforske i din dagbog i dag?",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        setIsLoading(false)
        return
      }

      const response = await fetch("http://localhost:8000/api/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          message: inputValue,
          session_id: "default"
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Undskyld, jeg havde problemer med at behandle din besked. Prøv venligst igen.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mr-3">
            <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">AI Psykolog</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Online og klar til at hjælpe</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Indlæser samtalehistorik...</span>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {message.timestamp.toLocaleTimeString("da-DK", { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Skriver...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Skriv din besked... (prøv /dagbog for at oprette en dagbogsindgang)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              disabled={isLoading}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Tryk Enter for at sende, Shift+Enter for ny linje
        </p>
      </div>
    </div>
  )
}