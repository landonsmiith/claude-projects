import { ExternalLink, CheckCircle2, Hotel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { buildBookingLink, buildHostelworldLink, buildAirbnbLink } from '@/lib/affiliates';
import { useTripStore } from '@/store/tripStore';

const PROVIDERS = [
  {
    id: 'booking',
    name: 'Booking.com',
    description: 'Hotels, apartments & more',
    icon: '🏨',
  },
  {
    id: 'hostelworld',
    name: 'Hostelworld',
    description: 'Hostels & budget stays',
    icon: '🛏️',
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    description: 'Homes, apartments & unique stays',
    icon: '🏠',
  },
];

function ProviderCard({ provider, day, trip }) {
  const location = day.location || '';
  const nextDate = new Date(day.date);
  nextDate.setDate(nextDate.getDate() + 1);
  const checkout = nextDate.toISOString().split('T')[0];

  let bookLink = '#';
  if (provider.id === 'booking') {
    bookLink = buildBookingLink({ location, checkin: day.date, checkout, adults: trip?.travelers || 2 });
  } else if (provider.id === 'hostelworld') {
    bookLink = buildHostelworldLink({ location, checkin: day.date, checkout });
  } else if (provider.id === 'airbnb') {
    bookLink = buildAirbnbLink({ location, checkin: day.date, checkout, adults: trip?.travelers || 2 });
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl">{provider.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">{provider.name}</h3>
            <p className="text-xs text-muted-foreground">
              Search live availability in {location} for {day.label}
            </p>
          </div>
        </div>
        <Button asChild size="sm" variant="forge" className="w-full gap-1.5">
          <a href={bookLink} target="_blank" rel="noopener noreferrer">
            Search {provider.name}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

export function StayTab({ day, trip }) {
  const { currentTrip } = useTripStore();
  const bookedStay = (currentTrip?.hotelStays || []).find(
    (stay) => stay.isBooked && stay.checkin <= day.date && stay.checkout >= day.date
  );

  if (bookedStay) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <p className="font-semibold text-lg">Hotel already booked!</p>
        <div className="mt-3 text-sm text-muted-foreground space-y-1">
          {bookedStay.name && <p>🏨 {bookedStay.name}</p>}
          {bookedStay.confirmation && <p>📋 Confirmation: {bookedStay.confirmation}</p>}
        </div>
      </div>
    );
  }

  if (!day.location) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Hotel className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p>Add a location above to see accommodation options.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Showing options in <span className="font-medium text-foreground">{day.location}</span> for {day.label}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PROVIDERS.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} day={day} trip={trip} />
        ))}
      </div>
    </div>
  );
}
