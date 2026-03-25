import { Plane, Hotel, CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

function FlightCard({ day, nextDay, booked, onUpdate }) {
  const isBooked = booked?.isBooked || false;

  return (
    <Card className={cn('transition-all', isBooked && 'opacity-75')}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-blue-500" />
            <span>
              {day.location || `Day ${day.dayNumber}`}
              {nextDay && ` → ${nextDay.location || `Day ${nextDay.dayNumber}`}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Already booked</span>
            <Switch
              checked={isBooked}
              onCheckedChange={(v) => onUpdate({ isBooked: v })}
            />
            {isBooked ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CardTitle>
        <p className="text-xs text-muted-foreground">{day.label}</p>
      </CardHeader>
      {isBooked && (
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">Airline</Label>
            <Input
              placeholder="e.g. Ryanair"
              value={booked?.airline || ''}
              onChange={(e) => onUpdate({ airline: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Flight number</Label>
            <Input
              placeholder="e.g. FR1234"
              value={booked?.flightNumber || ''}
              onChange={(e) => onUpdate({ flightNumber: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Departure time</Label>
            <Input
              type="time"
              value={booked?.time || ''}
              onChange={(e) => onUpdate({ time: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function HotelCard({ day, booked, onUpdate }) {
  const isBooked = booked?.isBooked || false;

  return (
    <Card className={cn('transition-all', isBooked && 'opacity-75')}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hotel className="h-4 w-4 text-purple-500" />
            <span>Staying in {day.location || `Day ${day.dayNumber}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Already booked</span>
            <Switch
              checked={isBooked}
              onCheckedChange={(v) => onUpdate({ isBooked: v })}
            />
            {isBooked ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CardTitle>
        <p className="text-xs text-muted-foreground">{day.label}</p>
      </CardHeader>
      {isBooked && (
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">Property name</Label>
            <Input
              placeholder="e.g. Hotel Acropolis"
              value={booked?.name || ''}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Check-in date</Label>
            <Input
              type="date"
              value={booked?.checkin || day.date}
              onChange={(e) => onUpdate({ checkin: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Confirmation #</Label>
            <Input
              placeholder="Optional"
              value={booked?.confirmation || ''}
              onChange={(e) => onUpdate({ confirmation: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function Step3Booked({ data, onUpdateFlight, onUpdateHotel, onBack, onNext }) {
  const days = data.days || [];

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">What's already booked?</h1>
        <p className="text-muted-foreground mt-1">
          Toggle on anything you've already confirmed. We'll only surface recommendations for gaps.
        </p>
      </div>

      {days.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No days planned yet — go back to Step 1.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Flights section */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Plane className="h-5 w-5 text-blue-500" />
              Flights & transfers
            </h2>
            <div className="space-y-2">
              {days.map((day, i) => (
                <FlightCard
                  key={`flight-${day.index}`}
                  day={day}
                  nextDay={days[i + 1]}
                  booked={data.bookedFlights[day.index]}
                  onUpdate={(updates) => onUpdateFlight(day.index, updates)}
                />
              ))}
            </div>
          </div>

          {/* Hotels section */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Hotel className="h-5 w-5 text-purple-500" />
              Hotels & accommodation
            </h2>
            <div className="space-y-2">
              {days.map((day) => (
                <HotelCard
                  key={`hotel-${day.index}`}
                  day={day}
                  booked={data.bookedHotels[day.index]}
                  onUpdate={(updates) => onUpdateHotel(day.index, updates)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} variant="forge" size="lg">
          Next: Preferences →
        </Button>
      </div>
    </div>
  );
}
