import { useEffect } from 'react';
import { Plane, Hotel, CheckCircle2, Circle, PlusCircle, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

function emptyLeg() {
  return {
    id: crypto.randomUUID(),
    origin: '',
    dest: '',
    date: '',
    airline: '',
    flightNumber: '',
    isBooked: false,
  };
}

function emptyStay() {
  return {
    id: crypto.randomUUID(),
    name: '',
    location: '',
    checkin: '',
    checkout: '',
    confirmation: '',
    isBooked: false,
  };
}

function LegCard({ leg, onChange, onRemove }) {
  return (
    <Card className={cn('transition-all', leg.isBooked && 'opacity-75')}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Already booked</span>
            <Switch
              checked={leg.isBooked}
              onCheckedChange={(v) => onChange({ isBooked: v })}
            />
            {leg.isBooked ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <button
            onClick={onRemove}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">From</Label>
            <Input
              placeholder="e.g. London"
              value={leg.origin}
              onChange={(e) => onChange({ origin: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To</Label>
            <Input
              placeholder="e.g. Barcelona"
              value={leg.dest}
              onChange={(e) => onChange({ dest: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Date</Label>
            <Input
              type="date"
              value={leg.date}
              onChange={(e) => onChange({ date: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Airline (optional)</Label>
            <Input
              placeholder="e.g. Ryanair"
              value={leg.airline}
              onChange={(e) => onChange({ airline: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Flight number (optional)</Label>
            <Input
              placeholder="e.g. FR1234"
              value={leg.flightNumber}
              onChange={(e) => onChange({ flightNumber: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StayCard({ stay, onChange, onRemove }) {
  const nights =
    stay.checkin && stay.checkout
      ? Math.round((new Date(stay.checkout) - new Date(stay.checkin)) / (1000 * 60 * 60 * 24))
      : null;

  return (
    <Card className={cn('transition-all', stay.isBooked && 'opacity-75')}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Already booked</span>
            <Switch
              checked={stay.isBooked}
              onCheckedChange={(v) => onChange({ isBooked: v })}
            />
            {stay.isBooked ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <button
            onClick={onRemove}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">City / Location</Label>
            <Input
              placeholder="e.g. Barcelona"
              value={stay.location}
              onChange={(e) => onChange({ location: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Property name (optional)</Label>
            <Input
              placeholder="e.g. Hotel Acropolis"
              value={stay.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Check-in</Label>
            <Input
              type="date"
              value={stay.checkin}
              onChange={(e) => onChange({ checkin: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">
              Check-out
              {nights !== null && nights > 0 && (
                <span className="ml-2 font-normal text-muted-foreground">
                  ({nights} night{nights !== 1 ? 's' : ''})
                </span>
              )}
            </Label>
            <Input
              type="date"
              value={stay.checkout}
              onChange={(e) => onChange({ checkout: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Confirmation # (optional)</Label>
            <Input
              placeholder="Optional"
              value={stay.confirmation}
              onChange={(e) => onChange({ confirmation: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Step3Booked({ data, onUpdateFlightLegs, onUpdateHotelStays, onBack, onNext }) {
  const flightLegs = data.flightLegs || [];
  const hotelStays = data.hotelStays || [];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (flightLegs.length === 0) onUpdateFlightLegs([emptyLeg()]);
    if (hotelStays.length === 0) onUpdateHotelStays([emptyStay()]);
  }, []);

  const updateLeg = (id, updates) =>
    onUpdateFlightLegs(flightLegs.map((l) => (l.id === id ? { ...l, ...updates } : l)));

  const removeLeg = (id) =>
    onUpdateFlightLegs(flightLegs.filter((l) => l.id !== id));

  const addLeg = () =>
    onUpdateFlightLegs([...flightLegs, emptyLeg()]);

  const updateStay = (id, updates) =>
    onUpdateHotelStays(hotelStays.map((s) => (s.id === id ? { ...s, ...updates } : s)));

  const removeStay = (id) =>
    onUpdateHotelStays(hotelStays.filter((s) => s.id !== id));

  const addStay = () =>
    onUpdateHotelStays([...hotelStays, emptyStay()]);

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">What's already booked?</h1>
        <p className="text-muted-foreground mt-1">
          Toggle on anything you've already confirmed. We'll only surface recommendations for gaps.
        </p>
      </div>

      <div className="space-y-6">
        {/* Flights section */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Plane className="h-5 w-5 text-blue-500" />
            Flights & transfers
          </h2>
          <div className="space-y-2">
            {flightLegs.map((leg) => (
              <LegCard
                key={leg.id}
                leg={leg}
                onChange={(updates) => updateLeg(leg.id, updates)}
                onRemove={() => removeLeg(leg.id)}
              />
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addLeg} className="mt-2 gap-1.5">
            <PlusCircle className="h-4 w-4" />
            Add flight leg
          </Button>
        </div>

        {/* Hotels section */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Hotel className="h-5 w-5 text-purple-500" />
            Hotels & accommodation
          </h2>
          <div className="space-y-2">
            {hotelStays.map((stay) => (
              <StayCard
                key={stay.id}
                stay={stay}
                onChange={(updates) => updateStay(stay.id, updates)}
                onRemove={() => removeStay(stay.id)}
              />
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addStay} className="mt-2 gap-1.5">
            <PlusCircle className="h-4 w-4" />
            Add hotel stay
          </Button>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} variant="forge" size="lg">
          Next: Preferences →
        </Button>
      </div>
    </div>
  );
}
