"use client"

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import { 
  Brain, 
  MessageCircle, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  Send,
  Image as ImageIcon,
  Calendar,
  Heart,
  Sparkles
} from "lucide-react"
import { ChatInterface } from "./chat-interface"
import { JournalInterface } from "./journal-interface"
import { AnalyticsInterface } from "./analytics-interface"

interface User {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface DashboardProps {
  user: User
}

type ActiveTab = "chat" | "journal" | "analytics" | "settings"

export function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat")
  const [stats, setStats] = useState({
    conversations: 0,
    journalEntries: 0,
    streak: 0,
    loading: true
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = user.id || user.email || 'anonymous'
        const response = await fetch(`/api/user/${userId}/insights`)
        if (response.ok) {
          const data = await response.json()
          setStats({
            conversations: data.conversation_themes?.length || 0,
            journalEntries: 0, // We'll implement this when we add journal tracking
            streak: Math.min(data.conversation_themes?.length || 0, 7), // Simple streak calculation
            loading: false
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [user])

  const tabs = [
    { id: "chat" as const, label: "Samtale", icon: MessageCircle },
    { id: "journal" as const, label: "Dagbog", icon: BookOpen },
    { id: "analytics" as const, label: "Indsigter", icon: BarChart3 },
    { id: "settings" as const, label: "Indstillinger", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Psykolog Team
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user.image && (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user.name}
                </span>
              </div>
              
              <button
                onClick={() => signOut()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Hurtig oversigt
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Samtaler</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats.loading ? "..." : stats.conversations}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Dagbogsindlæg</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats.loading ? "..." : stats.journalEntries}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Streak</span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {stats.loading ? "..." : `${stats.streak} dage`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "chat" && <ChatInterface userId={user.id || ""} />}
            {activeTab === "journal" && <JournalInterface userId={user.id || ""} />}
            {activeTab === "analytics" && <AnalyticsInterface userId={user.id || ""} />}
            {activeTab === "settings" && <SettingsInterface user={user} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsInterface({ user }: { user: User }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Indstillinger
      </h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Profil information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Navn
              </label>
              <input
                type="text"
                defaultValue={user.name || ""}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue={user.email || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Præferencer
          </h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Modtag daglige påmindelser
              </span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Aktiver mørk tilstand
              </span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Del anonyme data til forbedring
              </span>
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Gem ændringer
          </button>
        </div>
      </div>
    </div>
  )
}