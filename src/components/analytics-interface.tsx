"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Heart, Brain, Calendar, Award } from "lucide-react"

interface AnalyticsInterfaceProps {
  userId: string
}

export function AnalyticsInterface({ userId }: AnalyticsInterfaceProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")

  // Mock data - in a real app, this would come from the backend
  const emotionData = [
    { emotion: "Glad", count: 12, color: "bg-green-500" },
    { emotion: "Neutral", count: 8, color: "bg-yellow-500" },
    { emotion: "Trist", count: 5, color: "bg-red-500" },
    { emotion: "Stresset", count: 7, color: "bg-orange-500" },
    { emotion: "Rolig", count: 10, color: "bg-blue-500" },
  ]

  const weeklyMood = [
    { day: "Man", mood: 7 },
    { day: "Tir", mood: 6 },
    { day: "Ons", mood: 8 },
    { day: "Tor", mood: 5 },
    { day: "Fre", mood: 9 },
    { day: "Lør", mood: 8 },
    { day: "Søn", mood: 7 },
  ]

  const achievements = [
    { id: 1, title: "Første samtale", description: "Gennemførte din første AI-samtale", earned: true, icon: "🎯" },
    { id: 2, title: "Dagbog begynder", description: "Skrev din første dagbogsindgang", earned: true, icon: "📝" },
    { id: 3, title: "Uge streak", description: "7 dage i træk med aktivitet", earned: true, icon: "🔥" },
    { id: 4, title: "Følelsesmester", description: "Identificerede 10 forskellige følelser", earned: false, icon: "❤️" },
    { id: 5, title: "Måned aktiv", description: "30 dage med regelmæssig brug", earned: false, icon: "🏆" },
  ]

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
          value="12"
          change="+3 fra sidste uge"
          icon={<Brain className="w-6 h-6 text-blue-600" />}
          trend="up"
        />
        <MetricCard
          title="Dagbogsindlæg"
          value="8"
          change="+2 fra sidste uge"
          icon={<Calendar className="w-6 h-6 text-green-600" />}
          trend="up"
        />
        <MetricCard
          title="Gennemsnitlig humør"
          value="7.2"
          change="+0.5 fra sidste uge"
          icon={<Heart className="w-6 h-6 text-red-600" />}
          trend="up"
        />
        <MetricCard
          title="Streak"
          value="5 dage"
          change="Nuværende streak"
          icon={<Award className="w-6 h-6 text-purple-600" />}
          trend="neutral"
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
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Dit humør har været stigende de sidste 2 uger. Fortsæt med de aktiviteter, der gør dig glad!
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <Heart className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Du udtrykker oftere positive følelser i weekenderne. Overvej at integrere mere fritid i hverdagen.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Dine dagbogsindlæg viser øget selvbevidsthed. Dette er et tegn på positiv personlig udvikling.
            </p>
          </div>
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