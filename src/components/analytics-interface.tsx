"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Heart, Brain, Calendar, Award } from "lucide-react"

interface AnalyticsInterfaceProps {
  userId: string
}

interface UserInsights {
  emotional_patterns: string[]
  conversation_themes: string[]
  progress_indicators: string[]
  recommendations: string[]
}

export function AnalyticsInterface({ userId }: AnalyticsInterfaceProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")
  const [insights, setInsights] = useState<UserInsights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`/api/user/${userId}/insights`)
        if (response.ok) {
          const data = await response.json()
          setInsights(data)
        }
      } catch (error) {
        console.error('Failed to fetch insights:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchInsights()
    }
  }, [userId])

  // Generate emotion data based on conversation themes
  const emotionData = insights?.conversation_themes.length ? [
    { emotion: "Positiv", count: insights.conversation_themes.filter(theme => 
      theme.toLowerCase().includes('glad') || theme.toLowerCase().includes('godt')).length, color: "bg-green-500" },
    { emotion: "Neutral", count: Math.max(1, Math.floor(insights.conversation_themes.length / 3)), color: "bg-yellow-500" },
    { emotion: "Udfordrende", count: insights.conversation_themes.filter(theme => 
      theme.toLowerCase().includes('trist') || theme.toLowerCase().includes('stress')).length, color: "bg-red-500" },
  ] : []

  // Default weekly mood pattern when no data available
  const weeklyMood = [
    { day: "Man", mood: 5 },
    { day: "Tir", mood: 5 },
    { day: "Ons", mood: 5 },
    { day: "Tor", mood: 5 },
    { day: "Fre", mood: 5 },
    { day: "Lør", mood: 5 },
    { day: "Søn", mood: 5 },
  ]

  // Dynamic achievements based on actual usage
  const achievements = [
    { id: 1, title: "Første samtale", description: "Gennemførte din første AI-samtale", 
      earned: insights?.conversation_themes.length > 0, icon: "🎯" },
    { id: 2, title: "Aktiv bruger", description: "Har haft flere samtaler", 
      earned: insights?.conversation_themes.length > 2, icon: "📝" },
    { id: 3, title: "Selvrefleksion", description: "Udforskede dine følelser", 
      earned: insights?.emotional_patterns.length > 0, icon: "🔥" },
    { id: 4, title: "Fremskridt", description: "Viser tegn på positiv udvikling", 
      earned: insights?.progress_indicators.length > 0, icon: "❤️" },
    { id: 5, title: "Dedikeret", description: "Regelmæssig brug af platformen", 
      earned: insights?.conversation_themes.length > 5, icon: "🏆" },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Indlæser dine indsigter...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dine indsigter
        </h2>
        <div className="flex space-x-2">
          {[
            { value: "week" as const, label: "Uge" },
            { value: "month" as const, label: "Måned" },
            { value: "year" as const, label: "År" }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTimeRange(value)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                timeRange === value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Samtaler"
          value={insights?.conversation_themes.length.toString() || "0"}
          change={insights?.conversation_themes.length > 0 ? "Aktiv bruger" : "Ingen samtaler endnu"}
          icon={<Brain className="w-6 h-6 text-blue-600" />}
          trend={insights?.conversation_themes.length > 0 ? "up" : "neutral"}
        />
        <MetricCard
          title="Indsigter"
          value={insights?.emotional_patterns.length.toString() || "0"}
          change={insights?.emotional_patterns.length > 0 ? "Følelsesmønstre identificeret" : "Ingen mønstre endnu"}
          icon={<Calendar className="w-6 h-6 text-green-600" />}
          trend={insights?.emotional_patterns.length > 0 ? "up" : "neutral"}
        />
        <MetricCard
          title="Fremskridt"
          value={insights?.progress_indicators.length.toString() || "0"}
          change={insights?.progress_indicators.length > 0 ? "Positive tegn" : "Fortsæt din rejse"}
          icon={<Heart className="w-6 h-6 text-red-600" />}
          trend={insights?.progress_indicators.length > 0 ? "up" : "neutral"}
        />
        <MetricCard
          title="Anbefalinger"
          value={insights?.recommendations.length.toString() || "0"}
          change={insights?.recommendations.length > 0 ? "Personlige forslag" : "Kom i gang"}
          icon={<Award className="w-6 h-6 text-purple-600" />}
          trend={insights?.recommendations.length > 0 ? "up" : "neutral"}
        />
      </div>

      {/* Emotion Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Følelsesfordeling
        </h3>
        <div className="space-y-3">
          {emotionData.map((emotion) => (
            <div key={emotion.emotion} className="flex items-center">
              <span className="w-20 text-sm text-gray-700 dark:text-gray-300">
                {emotion.emotion}
              </span>
              <div className="flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${emotion.color}`}
                  style={{ width: `${(emotion.count / 15) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {emotion.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Mood Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ugentlig humør (1-10 skala)
        </h3>
        <div className="flex items-end space-x-2 h-32">
          {weeklyMood.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t-md transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${(day.mood / 10) * 100}%` }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {day.day}
              </span>
              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                {day.mood}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Præstationer
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border transition-all ${
                achievement.earned
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                  : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 opacity-60"
              }`}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{achievement.icon}</span>
                <h4 className={`font-medium ${
                  achievement.earned 
                    ? "text-green-800 dark:text-green-300" 
                    : "text-gray-600 dark:text-gray-400"
                }`}>
                  {achievement.title}
                </h4>
              </div>
              <p className={`text-sm ${
                achievement.earned 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-gray-500 dark:text-gray-500"
              }`}>
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Personlige indsigter
        </h3>
        <div className="space-y-3">
          {insights?.conversation_themes.length > 0 ? (
            insights.conversation_themes.slice(0, 3).map((theme, index) => (
              <div key={index} className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {theme}
                </p>
              </div>
            ))
          ) : (
            <div className="flex items-start space-x-3">
              <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Start en samtale for at få personlige indsigter baseret på dine oplevelser.
              </p>
            </div>
          )}
          
          {insights?.recommendations.length > 0 && (
            insights.recommendations.slice(0, 2).map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Heart className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {recommendation}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  trend 
}: {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  trend: "up" | "down" | "neutral"
}) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600 dark:text-green-400"
      case "down":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      <div className={`text-sm ${getTrendColor()}`}>
        {change}
      </div>
    </div>
  )
}