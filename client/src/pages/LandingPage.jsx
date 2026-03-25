import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Zap, Link, Download, ArrowRight, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTripStore } from '@/store/tripStore';

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI-Powered Recommendations',
    desc: 'Claude AI suggests the best activities based on your travel style, interests, and geographic context.',
  },
  {
    icon: '🌍',
    title: 'Day-by-Day Planner',
    desc: 'Plan every day of your trip with location-specific suggestions for flights, hotels, and activities.',
  },
  {
    icon: '💰',
    title: 'Affiliate Deal Engine',
    desc: 'All booking links include your affiliate IDs. Earn commission every time friends use your shared trip.',
  },
  {
    icon: '📤',
    title: 'Share & Collaborate',
    desc: 'Generate a shareable read-only URL. Viewers can fork a copy to plan their own version.',
  },
  {
    icon: '📄',
    title: 'PDF Export',
    desc: 'Export your complete itinerary as a clean PDF to save offline or send to travel companions.',
  },
  {
    icon: '🗺️',
    title: 'Geographic Intelligence',
    desc: 'Climate zones, coastal detection, and elevation data ensure recommendations make sense.',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { currentTrip, resetWizard, isDarkMode, toggleDarkMode } = useTripStore();

  const handleStart = () => {
    resetWizard();
    navigate('/wizard');
  };

  const handleContinue = () => {
    navigate('/board');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forge-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Nav */}
      <nav className="border-b bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span>🌍</span>
            <span className="text-forge-600 dark:text-forge-400">TripForge</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {currentTrip && (
              <Button variant="outline" size="sm" onClick={handleContinue}>
                Continue my trip →
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forge-100 text-forge-700 dark:bg-forge-950/30 dark:text-forge-300 text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Powered by Claude AI
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold text-foreground leading-tight">
            Plan trips
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-forge-500 to-orange-500"> smarter</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            TripForge is an AI-powered trip planner that builds day-by-day itineraries with intelligent
            activity recommendations, smart booking links, and affiliate deals — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Button onClick={handleStart} size="lg" variant="forge" className="gap-2 text-base px-8">
              Plan my trip
              <ArrowRight className="h-5 w-5" />
            </Button>
            {currentTrip && (
              <Button onClick={handleContinue} size="lg" variant="outline" className="text-base px-8">
                Continue planning →
              </Button>
            )}
          </div>
        </motion.div>

        {/* Preview card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-16 rounded-2xl border bg-card shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-forge-500 to-orange-500 p-5 text-white text-left">
            <p className="text-sm font-medium opacity-80">Sample Trip</p>
            <h2 className="text-2xl font-bold mt-1">London → Greece Adventure</h2>
            <div className="flex gap-4 mt-2 text-sm opacity-80">
              <span>📅 10 days</span>
              <span>👥 2 travelers</span>
              <span>💰 Mid-range</span>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 border-b">
            {['✈️ Getting There', '🏨 Stay', '🗺️ Explore', '🎟️ Events', '💰 Deals'].map((tab) => (
              <div key={tab} className="p-3 text-xs text-center border-r last:border-0 font-medium text-muted-foreground first:text-forge-600 dark:first:text-forge-400">
                {tab}
              </div>
            ))}
          </div>
          <div className="p-5 grid gap-3 sm:grid-cols-2 text-left">
            {[
              { name: 'Sunset Sailing in Santorini', cat: 'Outdoor', price: '$$', time: '⛵' },
              { name: 'Oia Village Walking Tour', cat: 'Culture', price: '$', time: '🏛️' },
              { name: 'Wine Tasting in Akrotiri', cat: 'Food & Drink', price: '$$', time: '🍷' },
              { name: 'Fira to Oia Hike', cat: 'Adventure', price: 'Free', time: '🥾' },
            ].map((act) => (
              <div key={act.name} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <span className="text-2xl">{act.time}</span>
                <div>
                  <p className="font-medium text-sm">{act.name}</p>
                  <p className="text-xs text-muted-foreground">{act.cat} · {act.price}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to plan a trip</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-forge-500 to-orange-500 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold">Ready to forge your next adventure?</h2>
          <p className="mt-3 text-lg text-white/80">Takes 3 minutes to set up your trip board.</p>
          <Button
            onClick={handleStart}
            size="lg"
            className="mt-6 bg-white text-forge-600 hover:bg-white/90 text-base px-10 gap-2"
          >
            Start planning
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>🌍 TripForge — Built with Claude AI, React & Vite</p>
      </footer>
    </div>
  );
}
