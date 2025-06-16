"use client"

import { useState, useEffect } from "react"
import { Calendar, Save, Sparkles, Heart, Smile, Frown, Meh } from "lucide-react"

interface JournalEntry {
  id: string
  date: string
  content: string
  emotions: string[]
  mood: "happy" | "neutral" | "sad"
}

interface JournalInterfaceProps {
  userId: string
}

export function JournalInterface({ userId }: JournalInterfaceProps) {
  const [currentEntry, setCurrentEntry] = useState("")
  const [selectedMood, setSelectedMood] = useState<"happy" | "neutral" | "sad" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [entries, setEntries] = useState<JournalEntry[]>([])

  // Fetch journal entries (placeholder for now since we don't have a backend endpoint yet)
  useEffect(() => {
    // In a real implementation, we would fetch entries from the backend
    // For now, we'll keep the entries empty until we implement the backend endpoint
  }, [userId])

  const handleSaveEntry = async () => {
    if (!currentEntry.trim() || !selectedMood) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          content: currentEntry,
          date: new Date().toISOString().split('T')[0],
          emotions: [] // Will be analyzed by AI
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save journal entry")
      }

      setCurrentEntry("")
      setSelectedMood(null)
      // In a real app, we would refresh the entries list
    } catch (error) {
      console.error("Error saving journal entry:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMoodIcon = (mood: "happy" | "neutral" | "sad") => {
    switch (mood) {
      case "happy":
        return <Smile className="w-5 h-5 text-green-500" />
      case "neutral":
        return <Meh className="w-5 h-5 text-yellow-500" />
      case "sad":
        return <Frown className="w-5 h-5 text-red-500" />
    }
  }

  const getMoodColor = (mood: "happy" | "neutral" | "sad") => {
    switch (mood) {
      case "happy":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
      case "neutral":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
      case "sad":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
    }
  }

  return (
    <div className="space-y-6">
      {/* New Entry */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Ny dagbogsindgang
          </h2>
          <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString("da-DK", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hvordan har din dag været?
            </label>
            <textarea
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              placeholder="Skriv om dine tanker, følelser og oplevelser i dag..."
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vælg din overordnede stemning
            </label>
            <div className="flex space-x-4">
              {[
                { mood: "happy" as const, label: "Glad", icon: Smile, color: "text-green-500" },
                { mood: "neutral" as const, label: "Neutral", icon: Meh, color: "text-yellow-500" },
                { mood: "sad" as const, label: "Trist", icon: Frown, color: "text-red-500" }
              ].map(({ mood, label, icon: Icon, color }) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    selectedMood === mood
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveEntry}
              disabled={!currentEntry.trim() || !selectedMood || isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? "Gemmer..." : "Gem indgang"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Previous Entries */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tidligere indgange
        </h3>

        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`p-4 rounded-lg border ${getMoodColor(entry.mood)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getMoodIcon(entry.mood)}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(entry.date).toLocaleDateString("da-DK", {
                      weekday: "long",
                      month: "long", 
                      day: "numeric"
                    })}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {entry.content}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {entry.emotions.map((emotion, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                  >
                    {emotion}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
        <div className="flex items-center mb-4">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Indsigter
          </h3>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Mønster opdaget:</strong> Du har haft en positiv udvikling de sidste par dage. 
            Dine indgange viser øget optimisme og sociale forbindelser.
          </p>
          
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Anbefaling:</strong> Fortsæt med at prioritere sociale interaktioner, 
            da de ser ud til at have en positiv indvirkning på dit humør.
          </p>
        </div>
      </div>
    </div>
  )
}