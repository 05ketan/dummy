import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, MapPin, Calendar, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Welcome to <span className="text-blue-600">Planora</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Smart group coordination made simple. Plan outings with friends using AI-powered
            recommendations that find the perfect spot for everyone.
          </p>
          <div className="flex gap-4 justify-center mb-16">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Group Coordination</h3>
              <p className="text-slate-600 text-sm">
                Create groups and manage outings with friends effortlessly
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
              <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Smart Suggestions</h3>
              <p className="text-slate-600 text-sm">
                AI finds the best location based on everyone&apos;s preferences
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Location-Aware</h3>
              <p className="text-slate-600 text-sm">
                Calculates optimal meeting points for your entire group
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Real-time Polling</h3>
              <p className="text-slate-600 text-sm">
                Vote with emoji reactions and see results instantly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
