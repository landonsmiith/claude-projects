import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { CalendarIcon, PlaneTakeoff, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { LocationAutocomplete } from './LocationAutocomplete.jsx';
import 'react-day-picker/dist/style.css';

const BUDGET_TIERS = [
  { value: 'budget', label: '🎒 Budget — hostels, street food, buses', description: 'Under $100/day' },
  { value: 'mid-range', label: '✈️ Mid-range — hotels, restaurants, flights', description: '$100–300/day' },
  { value: 'luxury', label: '💎 Luxury — resorts, fine dining, business class', description: '$300+/day' },
];

export function Step1Basics({ data, onChange, onNext }) {
  const [dateRange, setDateRange] = useState(
    data.departureDate && data.returnDate
      ? { from: new Date(data.departureDate), to: new Date(data.returnDate) }
      : undefined
  );
  const [errors, setErrors] = useState({});

  const handleDateSelect = (range) => {
    setDateRange(range);
    if (range?.from) {
      onChange({
        departureDate: format(range.from, 'yyyy-MM-dd'),
        returnDate: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
      });
    }
  };

  const validate = () => {
    const e = {};
    if (!data.originCity) e.originCity = 'Origin city is required';
    if (!data.departureDate) e.departureDate = 'Select departure date';
    if (!data.returnDate) e.returnDate = 'Select return date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Plan your trip</h1>
        <p className="text-muted-foreground mt-1">Let's start with the basics — where are you going?</p>
      </div>

      {/* Origin & Destination */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PlaneTakeoff className="h-5 w-5 text-forge-500" />
            Where are you flying from?
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Origin city / airport</Label>
            <LocationAutocomplete
              value={data.originCity}
              onChange={(v) => onChange({ originCity: v })}
              placeholder="e.g. London, New York"
              inputClassName={cn(errors.originCity && 'border-destructive')}
            />
            {errors.originCity && (
              <p className="text-xs text-destructive">{errors.originCity}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Return to (default: same)</Label>
            <LocationAutocomplete
              value={data.returnCity}
              onChange={(v) => onChange({ returnCity: v })}
              placeholder="Leave blank for same as origin"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="h-5 w-5 text-forge-500" />
            When are you going?
          </CardTitle>
          <CardDescription>Select your departure and return dates</CardDescription>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dateRange && 'text-muted-foreground',
                  errors.departureDate && 'border-destructive'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange?.to ? (
                    <>
                      {format(dateRange.from, 'MMM d, yyyy')} →{' '}
                      {format(dateRange.to, 'MMM d, yyyy')}
                    </>
                  ) : (
                    format(dateRange.from, 'MMM d, yyyy')
                  )
                ) : (
                  'Pick departure → return dates'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DayPicker
                mode="range"
                selected={dateRange}
                onSelect={handleDateSelect}
                disabled={{ before: new Date() }}
                numberOfMonths={2}
                className="p-3"
              />
            </PopoverContent>
          </Popover>
          {errors.departureDate && (
            <p className="text-xs text-destructive mt-1">{errors.departureDate}</p>
          )}
          {data.departureDate && data.returnDate && (
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round((new Date(data.returnDate) - new Date(data.departureDate)) / 86400000) + 1} days
            </p>
          )}
        </CardContent>
      </Card>

      {/* Travelers & Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-forge-500" />
            Who's going?
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Number of travelers</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onChange({ travelers: Math.max(1, data.travelers - 1) })}
              >
                −
              </Button>
              <span className="text-xl font-semibold w-8 text-center">{data.travelers}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onChange({ travelers: data.travelers + 1 })}
              >
                +
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Budget tier</Label>
            <Select
              value={data.budgetTier}
              onValueChange={(v) => onChange({ budgetTier: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_TIERS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div>
                      <div className="font-medium">{t.label}</div>
                      <div className="text-xs text-muted-foreground">{t.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleNext} size="lg" variant="forge">
          Next: Plan your days →
        </Button>
      </div>
    </div>
  );
}
