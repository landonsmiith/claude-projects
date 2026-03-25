import { ExternalLink, CheckCircle2, Star, Hotel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buildBookingLink, buildHostelworldLink, buildAirbnbLink } from '@/lib/affiliates';
import { useTripStore } from '@/store/tripStore';

const MOCK_STAYS = [
  {
    name: 'Hotel Central Plaza',
    type: 'Hotel',
    stars: 4,
    pricePerNight: 89,
    currency: '€',
    distanceCenter: '0.3km from center',
    rating: 8.7,
    image: null,
    provider: 'booking',
  },
  {
    name: 'Old Town Boutique Hotel',
    type: 'Boutique',
    stars: 3,
    pricePerNight: 62,
    currency: '€',
    distanceCenter: '0.8km from center',
    rating: 8.2,
    image: null,
    provider: 'booking',
  },
  {
    name: 'The Social Hostel',
    type: 'Hostel',
    stars: null,
    pricePerNight: 22,
    currency: '€',
    distanceCenter: '1.2km from center',
    rating: 9.1,
    image: null,
    provider: 'hostelworld',
  },
  {
    name: 'Cosy Apartment with View',
    type: 'Airbnb',
    stars: null,
    pricePerNight: 75,
    currency: '€',
    distanceCenter: '0.6km from center',
    rating: 4.9,
    image: null,
    provider: 'airbnb',
  },
];

function StayCard({ stay, day, trip }) {
  let bookLink = '#';
  const location = day.location || '';
  const nextDate = new Date(day.date);
  nextDate.setDate(nextDate.getDate() + 1);
  const checkout = nextDate.toISOString().split('T')[0];

  if (stay.provider === 'booking') {
    bookLink = buildBookingLink({
      location,
      checkin: day.date,
      checkout,
      adults: trip?.travelers || 2,
    });
  } else if (stay.provider === 'hostelworld') {
    bookLink = buildHostelworldLink({ location, checkin: day.date, dropoff: checkout });
  } else if (stay.provider === 'airbnb') {
    bookLink = buildAirbnbLink({ location, checkin: day.date, checkout, adults: trip?.travelers || 2 });
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Unsplash placeholder */}
        <div className="w-full h-32 bg-gradient-to-br from-forge-100 to-orange-100 dark:from-forge-900/20 dark:to-orange-900/20 rounded-md mb-3 flex items-center justify-center">
          <Hotel className="h-8 w-8 text-forge-300" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-sm">{stay.name}</h3>
              <p className="text-xs text-muted-foreground">{stay.distanceCenter}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-bold">
                {stay.currency}{stay.pricePerNight}
                <span className="text-xs font-normal text-muted-foreground">/night</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">{stay.type}</Badge>
            {stay.stars && (
              <span className="flex items-center gap-0.5 text-xs">
                {Array(stay.stars).fill('⭐').join('')}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs ml-auto">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{stay.rating}</span>
            </span>
          </div>

          <Button asChild size="sm" variant="forge" className="w-full gap-1.5 mt-2">
            <a href={bookLink} target="_blank" rel="noopener noreferrer">
              Book on {stay.type === 'Hostel' ? 'Hostelworld' : stay.type === 'Airbnb' ? 'Airbnb' : 'Booking.com'}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function StayTab({ day, trip }) {
  const { currentTrip } = useTripStore();
  const bookedHotel = currentTrip?.bookedHotels?.[day.index];

  if (bookedHotel?.isBooked) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <p className="font-semibold text-lg">Hotel already booked!</p>
        <div className="mt-3 text-sm text-muted-foreground space-y-1">
          {bookedHotel.name && <p>🏨 {bookedHotel.name}</p>}
          {bookedHotel.confirmation && <p>📋 Confirmation: {bookedHotel.confirmation}</p>}
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

      <div className="grid gap-3 sm:grid-cols-2">
        {MOCK_STAYS.map((stay) => (
          <StayCard key={stay.name} stay={stay} day={day} trip={trip} />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        * Mock listings shown. Live prices load when you click Book.
      </p>
    </div>
  );
}
