import { useEffect } from 'react';
import { useTripStore } from '@/store/tripStore';
import { DashboardLayout } from './DashboardLayout.jsx';
import { DayCard } from './DayCard.jsx';
import { motion } from 'framer-motion';

export function TripBoard() {
  const { currentTrip, setActiveDayIndex } = useTripStore();

  // Track active day on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const idx = parseInt(id.replace('day-', ''), 10);
            if (!isNaN(idx)) setActiveDayIndex(idx);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-60px 0px -40% 0px' }
    );

    const cards = document.querySelectorAll('[id^="day-"]');
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [currentTrip?.days?.length]);

  if (!currentTrip) {
    return null;
  }

  const days = currentTrip.days || [];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Trip summary */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-forge-500 to-orange-500 rounded-xl p-5 text-white"
        >
          <h1 className="text-2xl font-bold">
            {currentTrip.originCity
              ? `${currentTrip.originCity} → ${currentTrip.days?.find(d => d.location)?.location || 'Adventure'}`
              : 'Your Trip'}
          </h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-white/80">
            <span>📅 {days.length} days</span>
            <span>👥 {currentTrip.travelers} traveler{currentTrip.travelers !== 1 ? 's' : ''}</span>
            <span>💰 {currentTrip.budgetTier}</span>
            {currentTrip.departureDate && (
              <span>
                🗓️ {new Date(currentTrip.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {currentTrip.returnDate && ` – ${new Date(currentTrip.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              </span>
            )}
          </div>
        </motion.div>

        {/* Day cards */}
        {days.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-5xl mb-4">🗺️</p>
            <p className="text-xl font-semibold">No days in your trip yet</p>
            <p className="mt-1">Go back to the wizard and set your travel dates.</p>
          </div>
        ) : (
          days.map((day) => (
            <DayCard key={day.date} day={day} trip={currentTrip} />
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
