import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Map, Navigation, HelpCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const TRAVEL_TYPES = [
  { id: 'explorer', emoji: '🧭', label: 'Explorer' },
  { id: 'partier', emoji: '🎉', label: 'Partier' },
  { id: 'relaxer', emoji: '🏖️', label: 'Relaxer' },
  { id: 'foodie', emoji: '🍽️', label: 'Foodie' },
  { id: 'culture', emoji: '🏛️', label: 'Culture' },
];

const LOCATION_TIERS = [
  { value: 'country', icon: Globe, label: 'Country', hint: 'e.g. Greece' },
  { value: 'region', icon: Map, label: 'Region', hint: 'e.g. Greek Islands' },
  { value: 'city', icon: Navigation, label: 'City', hint: 'e.g. Santorini' },
];

function DayRow({ day, onUpdate, tripContext }) {
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const toggleTravelType = (typeId) => {
    const current = day.travelTypes || [];
    const updated = current.includes(typeId)
      ? current.filter((t) => t !== typeId)
      : [...current, typeId];
    onUpdate({ travelTypes: updated });
  };

  const handleHelpMeChoose = async () => {
    if (!day.location) return;
    setLoadingSuggestions(true);
    setSuggestionsOpen(true);
    try {
      const res = await api.getSubRegions({ country: day.location, tripContext });
      setSuggestions(res.suggestions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-forge-400 rounded-l-lg" />
      <CardContent className="pt-4 pl-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Day label */}
          <div className="flex-shrink-0">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Day {day.dayNumber}
            </div>
            <div className="text-sm font-medium text-foreground">{day.label}</div>
          </div>

          <div className="flex-1 space-y-3">
            {/* Location tier toggle */}
            <div className="flex gap-1">
              {LOCATION_TIERS.map((tier) => {
                const Icon = tier.icon;
                return (
                  <button
                    key={tier.value}
                    onClick={() => onUpdate({ locationTier: tier.value })}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                      day.locationTier === tier.value
                        ? 'bg-forge-100 text-forge-700 dark:bg-forge-900/30 dark:text-forge-300'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                    title={`Enter ${tier.label} — ${tier.hint}`}
                  >
                    <Icon className="h-3 w-3" />
                    {tier.label}
                  </button>
                );
              })}
            </div>

            {/* Location input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={
                    day.locationTier === 'country'
                      ? 'e.g. Greece'
                      : day.locationTier === 'region'
                      ? 'e.g. Greek Islands'
                      : 'e.g. Santorini'
                  }
                  value={day.location || ''}
                  onChange={(e) => onUpdate({ location: e.target.value })}
                  className="pl-9"
                />
              </div>
              {day.locationTier === 'country' && day.location && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleHelpMeChoose}
                  className="flex-shrink-0 text-xs"
                >
                  <HelpCircle className="h-3.5 w-3.5 mr-1" />
                  Help me choose
                </Button>
              )}
            </div>

            {/* AI Suggestions */}
            {suggestionsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border rounded-lg p-3 bg-forge-50 dark:bg-forge-950/20"
              >
                <div className="text-xs font-semibold text-forge-700 dark:text-forge-300 mb-2 flex items-center gap-1">
                  <span>✨</span> AI Suggestions for {day.location}
                </div>
                {loadingSuggestions ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Asking Claude...
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {suggestions.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => {
                          onUpdate({ location: s.name, locationTier: 'city' });
                          setSuggestionsOpen(false);
                        }}
                        className="text-left p-2 rounded border bg-white dark:bg-gray-800 hover:border-forge-300 transition-colors"
                      >
                        <div className="font-medium text-sm">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.vibe}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(s.best_for || []).slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs bg-forge-100 text-forge-600 px-1.5 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setSuggestionsOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground mt-2"
                >
                  Close
                </button>
              </motion.div>
            )}

            {/* Travel types */}
            <div className="flex flex-wrap gap-1.5">
              {TRAVEL_TYPES.map((type) => {
                const isSelected = (day.travelTypes || []).includes(type.id);
                return (
                  <button
                    key={type.id}
                    onClick={() => toggleTravelType(type.id)}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                      isSelected
                        ? 'bg-forge-500 text-white border-forge-500'
                        : 'bg-background border-border text-foreground hover:border-forge-300'
                    )}
                  >
                    <span>{type.emoji}</span>
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Step2DayPlanner({ data, onUpdateDay, onBack, onNext }) {
  const tripContext = {
    origin: data.originCity,
    travelers: data.travelers,
    budgetTier: data.budgetTier,
    departure: data.departureDate,
    return: data.returnDate,
  };

  const validate = () => {
    return data.days.some((d) => d.location);
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">Day-by-day planner</h1>
        <p className="text-muted-foreground mt-1">
          Fill in where you'll be each day. You can be vague — we'll help refine it.
        </p>
      </div>

      {data.days.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Go back and set your travel dates first.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.days.map((day) => (
            <DayRow
              key={day.date}
              day={day}
              onUpdate={(updates) => onUpdateDay(day.index, updates)}
              tripContext={tripContext}
            />
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={handleNext} variant="forge" size="lg">
          Next: What's booked? →
        </Button>
      </div>
    </div>
  );
}
