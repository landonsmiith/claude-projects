import { useQuery } from '@tanstack/react-query';
import { Cloud, Sun, CloudRain, Snowflake, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTripStore } from '@/store/tripStore';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const TRAVEL_TYPE_ICONS = {
  explorer: '🧭',
  partier: '🎉',
  relaxer: '🏖️',
  foodie: '🍽️',
  culture: '🏛️',
};

function WeatherIcon({ icon, className }) {
  if (!icon) return <Sun className={cn('h-4 w-4 text-yellow-500', className)} />;
  if (icon.startsWith('01') || icon.startsWith('02')) return <Sun className={cn('h-4 w-4 text-yellow-500', className)} />;
  if (icon.startsWith('09') || icon.startsWith('10')) return <CloudRain className={cn('h-4 w-4 text-blue-400', className)} />;
  if (icon.startsWith('13')) return <Snowflake className={cn('h-4 w-4 text-blue-200', className)} />;
  return <Cloud className={cn('h-4 w-4 text-gray-400', className)} />;
}

function DayWeather({ location, date }) {
  const { data, isLoading } = useQuery({
    queryKey: ['weather', location, date],
    queryFn: () => api.getWeather({ location, date }),
    enabled: !!location && !!date,
    staleTime: 1000 * 60 * 30, // 30 min
  });

  if (isLoading) return <Skeleton className="h-4 w-16" />;
  if (!data) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <WeatherIcon icon={data.icon} />
      <span>{data.temp}°C</span>
    </div>
  );
}

export function Sidebar({ onDayClick }) {
  const { currentTrip, activeDayIndex, setActiveDayIndex, savedActivities } = useTripStore();
  const days = currentTrip?.days || [];
  const bookedFlights = currentTrip?.bookedFlights || {};
  const bookedHotels = currentTrip?.bookedHotels || {};

  const scrollToDay = (idx) => {
    setActiveDayIndex(idx);
    const el = document.getElementById(`day-${idx}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    onDayClick?.();
  };

  if (days.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        No days planned yet.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-1">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
        Trip Timeline
      </div>

      {days.map((day, i) => {
        const isActive = i === activeDayIndex;
        const flightBooked = bookedFlights[i]?.isBooked;
        const hotelBooked = bookedHotels[i]?.isBooked;
        const activitiesCount = (savedActivities[i] || []).length;

        return (
          <button
            key={day.date}
            onClick={() => scrollToDay(i)}
            className={cn(
              'w-full text-left px-3 py-2.5 rounded-lg transition-all group',
              isActive
                ? 'bg-forge-100 dark:bg-forge-950/30 text-forge-700 dark:text-forge-300'
                : 'hover:bg-muted text-foreground'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    'text-xs font-bold',
                    isActive ? 'text-forge-600' : 'text-muted-foreground'
                  )}>
                    Day {day.dayNumber}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">{day.label}</span>
                </div>
                <div className="text-sm font-medium truncate mt-0.5">
                  {day.location || <span className="text-muted-foreground italic">No location set</span>}
                </div>
              </div>

              {/* Weather */}
              {day.location && (
                <DayWeather location={day.location} date={day.date} />
              )}
            </div>

            {/* Travel type badges */}
            {(day.travelTypes || []).length > 0 && (
              <div className="flex gap-1 mt-1">
                {day.travelTypes.map((t) => (
                  <span key={t} className="text-xs" title={t}>
                    {TRAVEL_TYPE_ICONS[t]}
                  </span>
                ))}
              </div>
            )}

            {/* Progress indicators */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className={cn(
                'flex items-center gap-0.5 text-xs',
                flightBooked ? 'text-green-500' : 'text-muted-foreground'
              )} title={flightBooked ? 'Flight booked' : 'Flight needed'}>
                ✈️
                {flightBooked ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
              </span>
              <span className={cn(
                'flex items-center gap-0.5 text-xs',
                hotelBooked ? 'text-green-500' : 'text-muted-foreground'
              )} title={hotelBooked ? 'Hotel booked' : 'Hotel needed'}>
                🏨
                {hotelBooked ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
              </span>
              {activitiesCount > 0 && (
                <span className="text-xs text-forge-500 ml-auto">
                  {activitiesCount} saved
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
