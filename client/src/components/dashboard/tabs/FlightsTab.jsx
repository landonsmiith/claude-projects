import { useQuery } from '@tanstack/react-query';
import { ExternalLink, CheckCircle2, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buildSkyscannerLink, buildTrainlineLink, buildFlixbusLink } from '@/lib/affiliates';
import { api } from '@/lib/api';
import { useTripStore } from '@/store/tripStore';

const FLIGHT_OPTIONS = [
  { provider: 'Ryanair', logo: '✈️', type: 'flight' },
  { provider: 'EasyJet', logo: '✈️', type: 'flight' },
  { provider: 'Wizz Air', logo: '✈️', type: 'flight' },
];

const GROUND_OPTIONS = [
  { provider: 'Trainline', logo: '🚂', type: 'train' },
  { provider: 'FlixBus', logo: '🚌', type: 'bus' },
];

function TransportCard({ option, day, nextDay, trip }) {
  const origin = trip?.originCity || day.location || '';
  const dest = nextDay?.location || day.location || '';

  let bookLink = '#';
  if (option.type === 'flight') {
    bookLink = buildSkyscannerLink({ origin, dest, date: day.date, adults: trip?.travelers || 1 });
  } else if (option.type === 'train') {
    bookLink = buildTrainlineLink({ origin, dest, date: day.date });
  } else if (option.type === 'bus') {
    bookLink = buildFlixbusLink({ origin, dest });
  }

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="text-3xl">{option.logo}</div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{option.provider}</div>
          <div className="text-xs text-muted-foreground">
            {origin} → {dest}
          </div>
        </div>
        <Button asChild size="sm" variant="forge" className="gap-1.5">
          <a href={bookLink} target="_blank" rel="noopener noreferrer">
            Search fares <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

export function FlightsTab({ day, trip }) {
  const { currentTrip } = useTripStore();
  const bookedFlight = (currentTrip?.flightLegs || []).find(
    (leg) => leg.isBooked && leg.date === day.date
  );
  const days = currentTrip?.days || [];
  const nextDay = days[day.index + 1];

  const prevLocation = day.index > 0 ? days[day.index - 1]?.location : trip?.originCity;
  const currLocation = day.location;

  const { data: distanceData } = useQuery({
    queryKey: ['distance', prevLocation, currLocation],
    queryFn: () => api.getDistance({ from: prevLocation, to: currLocation }),
    enabled: !!prevLocation && !!currLocation && prevLocation !== currLocation,
    staleTime: 1000 * 60 * 60,
  });

  if (bookedFlight) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <p className="font-semibold text-lg">Flight already booked!</p>
        <div className="mt-3 text-sm text-muted-foreground space-y-1">
          {bookedFlight.airline && <p>✈️ {bookedFlight.airline} {bookedFlight.flightNumber}</p>}
          {bookedFlight.origin && bookedFlight.dest && (
            <p>{bookedFlight.origin} → {bookedFlight.dest}</p>
          )}
        </div>
      </div>
    );
  }

  if (!prevLocation || !currLocation || prevLocation === currLocation) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Plane className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p>Set locations for this day and the previous day to see transport options.</p>
      </div>
    );
  }

  const isGroundFirst = distanceData?.travelMode === 'ground';
  const distanceKm = distanceData?.distanceKm;

  return (
    <div className="space-y-4">
      {distanceData && (
        <div className="flex items-center gap-2 text-sm">
          <Badge variant={isGroundFirst ? 'secondary' : 'outline'}>
            {distanceKm}km
          </Badge>
          <span className="text-muted-foreground">
            {isGroundFirst
              ? '🚆 Ground transport recommended (under 300km)'
              : '✈️ Flight recommended for this distance'}
          </span>
        </div>
      )}

      {isGroundFirst && (
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Ground Transport</h3>
          <div className="space-y-2">
            {GROUND_OPTIONS.map((opt) => (
              <TransportCard key={opt.provider} option={opt} day={day} nextDay={nextDay} trip={trip} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Flights</h3>
        <div className="space-y-2">
          {FLIGHT_OPTIONS.map((opt) => (
            <TransportCard key={opt.provider} option={opt} day={day} nextDay={nextDay} trip={trip} />
          ))}
        </div>
      </div>

      {!isGroundFirst && (
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Ground Alternatives</h3>
          <div className="space-y-2">
            {GROUND_OPTIONS.map((opt) => (
              <TransportCard key={opt.provider} option={opt} day={day} nextDay={nextDay} trip={trip} />
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Click any provider to search live fares
      </p>
    </div>
  );
}
