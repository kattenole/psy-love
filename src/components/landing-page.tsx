"use client"

import { signIn } from "next-auth/react"
import { Brain, Heart, MessageCircle, Shield, Sparkles, Users } from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Brain className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              🧠 AI Psykolog Team
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Din AI-drevne team til psykologisk støtte er her for at hjælpe. 
              Del dine tanker, følelser og nuværende situation. 
              Vi giver mangesidet analyse til støtte for dit mentale velbefindende.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => signIn("google")}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Kom i gang gratis
              </button>
              
              <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-semibold text-lg transition-colors">
                Lær mere
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Hvorfor vælge AI Psykolog Team?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Avanceret AI-teknologi kombineret med evidensbaserede terapeutiske tilgange
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8" />}
              title="Adaptiv Samtaleflow"
              description="LangGraph orkestrerer psykologiske samtaler baseret på din tilstand og behov"
            />
            
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="Kontekstuel Hukommelse"
              description="Graphiti Knowledge Graph husker tidligere sessioner, mønstre og fremskridt"
            />
            
            <FeatureCard
              icon={<Heart className="w-8 h-8" />}
              title="Følelsesmæssig Rejse"
              description="Neo4j gemmer din følelsesmæssige rejse over tid med forbindelser mellem triggere og reaktioner"
            />
            
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Privatliv & Sikkerhed"
              description="End-to-end kryptering og GDPR-compliance for danske brugere"
            />
            
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Multimodal Forståelse"
              description="Analyserer uploadede billeder sammen med tekst for dybere indsigt"
            />
            
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="Personlige Indsigter"
              description="AI-genererede anbefalinger og terapeutiske øvelser tilpasset dig"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Klar til at begynde din rejse?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Tilmeld dig i dag og få adgang til personlig AI-psykologisk støtte
          </p>
          <button
            onClick={() => signIn("google")}
            className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-semibold text-lg transition-colors"
          >
            Start din gratis session
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Brain className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-gray-400 mb-2">
            Made with ❤️ by Better Human AI
          </p>
          <p className="text-gray-500 text-sm">
            Share your journey with #BetterHumanAI
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <div className="text-blue-600 dark:text-blue-400 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  )
}