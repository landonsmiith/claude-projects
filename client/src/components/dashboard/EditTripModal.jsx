import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { CalendarIcon, PlaneTakeoff, Users } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocationAutocomplete } from '@/components/wizard/LocationAutocomplete.jsx';
import { useTripStore } from '@/store/tripStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import 'react-day-picker/dist/style.css';

const BUDGET_TIERS = [
  { value: 'budget', label: '🎒 Budget' },
  { value: 'mid-range', label: '✈️ Mid-range' },
  { value: 'luxury', label: '💎 Luxury' },
];

export function EditTripModal({ open, onOpenChange }) {
  const { currentTrip, updateCurrentTripBasics } = useTripStore();

  const [originCity, setOriginCity] = useState(currentTrip?.originCity || '');
  const [returnCity, setReturnCity] = useState(currentTrip?.returnCity || '');
  const [travelers, setTravelers] = useState(currentTrip?.travelers || 2);
  const [budgetTier, setBudgetTier] = useState(currentTrip?.budgetTier || 'mid-range');
  const [dateRange, setDateRange] = useState(
    currentTrip?.departureDate && currentTrip?.returnDate
      ? { from: new Date(currentTrip.departureDate), to: new Date(currentTrip.returnDate) }
      : undefined
  );

  const handleSave = () => {
    if (!originCity) {
      toast.error('Please enter an origin city');
      return;
    }
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select departure and return dates');
      return;
    }

    updateCurrentTripBasics({
      originCity,
      returnCity,
      travelers,
      budgetTier,
      departureDate: format(dateRange.from, 'yyyy-MM-dd'),
      returnDate: format(dateRange.to, 'yyyy-MM-dd'),
    });

    toast.success('Trip updated!', { description: 'Your itinerary dates have been refreshed.' });
    onOpenChange(false);
  };

  if (!currentTrip) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlaneTakeoff className="h-5 w-5 text-forge-500" />
            Edit Trip Details
          </DialogTitle>
          <DialogDescription>
            Update your trip dates, origin, or preferences. Day plans will be preserved where dates overlap.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Origin & Return */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Origin city</Label>
              <LocationAutocomplete
                value={originCity}
                onChange={setOriginCity}
                placeholder="e.g. London"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Return to</Label>
              <LocationAutocomplete
                value={returnCity}
                onChange={setReturnCity}
                placeholder="Same as origin"
              />
            </div>
          </div>

          {/* Date range */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              Travel dates
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange?.to ? (
                      <>{format(dateRange.from, 'MMM d, yyyy')} → {format(dateRange.to, 'MMM d, yyyy')}</>
                    ) : (
                      format(dateRange.from, 'MMM d, yyyy')
                    )
                  ) : (
                    'Pick new dates'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="p-3"
                />
              </PopoverContent>
            </Popover>
            {dateRange?.from && dateRange?.to && (
              <p className="text-xs text-muted-foreground">
                {Math.round((dateRange.to - dateRange.from) / 86400000) + 1} days
              </p>
            )}
          </div>

          {/* Travelers & Budget */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                Travelers
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                >
                  −
                </Button>
                <span className="text-xl font-semibold w-8 text-center">{travelers}</span>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => setTravelers((t) => t + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Budget tier</Label>
              <Select value={budgetTier} onValueChange={setBudgetTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_TIERS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="forge" onClick={handleSave}>
              Save changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
