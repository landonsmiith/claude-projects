import { X, Download, Plane, Hotel, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTripStore } from '@/store/tripStore';

export function PackPanel() {
  const { currentTrip, savedActivities, togglePackPanel } = useTripStore();
  const days = currentTrip?.days || [];
  const bookedFlights = currentTrip?.bookedFlights || {};
  const bookedHotels = currentTrip?.bookedHotels || {};

  const handleExport = () => {
    // PDF export - placeholder
    alert('PDF export coming soon! (react-pdf integration)');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="font-semibold flex items-center gap-2">🎒 Pack my bag</h2>
          <p className="text-xs text-muted-foreground">Your complete itinerary</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExport} className="gap-1">
            <Download className="h-3.5 w-3.5" />
            PDF
          </Button>
          <Button size="icon" variant="ghost" onClick={togglePackPanel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {days.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No trip data yet. Complete the wizard first!
          </p>
        ) : (
          days.map((day, i) => {
            const flight = bookedFlights[i];
            const hotel = bookedHotels[i];
            const activities = savedActivities[i] || [];

            return (
              <div key={day.date}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-forge-600 bg-forge-100 px-2 py-0.5 rounded-full">
                    Day {day.dayNumber}
                  </span>
                  <span className="text-sm font-semibold">{day.location || 'TBD'}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{day.label}</span>
                </div>

                {flight?.isBooked && (
                  <div className="flex items-start gap-2 py-1.5 text-xs">
                    <Plane className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{flight.airline || 'Flight'}</span>
                      {flight.flightNumber && <span className="text-muted-foreground"> {flight.flightNumber}</span>}
                      {flight.time && <span className="text-muted-foreground"> at {flight.time}</span>}
                    </div>
                  </div>
                )}

                {hotel?.isBooked && (
                  <div className="flex items-start gap-2 py-1.5 text-xs">
                    <Hotel className="h-3.5 w-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{hotel.name || 'Hotel'}</span>
                      {hotel.confirmation && (
                        <span className="text-muted-foreground"> #{hotel.confirmation}</span>
                      )}
                    </div>
                  </div>
                )}

                {activities.map((act) => (
                  <div key={act.name} className="flex items-start gap-2 py-1.5 text-xs">
                    <Star className="h-3.5 w-3.5 text-forge-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{act.name}</span>
                      <span className="text-muted-foreground ml-1">
                        {act.duration} · {act.best_time_of_day}
                      </span>
                    </div>
                  </div>
                ))}

                {!flight?.isBooked && !hotel?.isBooked && activities.length === 0 && (
                  <p className="text-xs text-muted-foreground italic pl-5">Nothing planned yet</p>
                )}

                <Separator className="mt-3" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
