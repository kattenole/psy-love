"use client"

import { ChatInterface } from "@/components/chat-interface"

export default function TestChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Test Chat Interface</h1>
        <div className="max-w-4xl mx-auto">
          <ChatInterface userId="test_user_demo" />
        </div>
      </div>
    </div>
  )
}