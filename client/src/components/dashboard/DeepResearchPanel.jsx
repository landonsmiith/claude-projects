import { useState } from 'react';
import { Loader2, Sparkles, Plus, Send, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTripStore } from '@/store/tripStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const RESEARCH_CATEGORIES = [
  { value: 'events', label: '🎭 Events & Entertainment', hint: 'concerts, shows, festivals, nightlife' },
  { value: 'dining', label: '🍽️ Dining & Food', hint: 'restaurants, street food, markets, food tours' },
  { value: 'culture', label: '🏛️ Culture & History', hint: 'museums, landmarks, architecture, art' },
  { value: 'nightlife', label: '🌙 Nightlife & Bars', hint: 'bars, clubs, rooftop venues, cocktail spots' },
  { value: 'outdoors', label: '🥾 Outdoors & Nature', hint: 'hikes, parks, beaches, day trips' },
  { value: 'shopping', label: '🛍️ Shopping & Markets', hint: 'local shops, souvenirs, fashion, markets' },
  { value: 'wellness', label: '🧘 Wellness & Relaxation', hint: 'spas, yoga, beaches, thermal baths' },
  { value: 'transport', label: '🚌 Getting Around', hint: 'transit tips, car rental, best routes' },
  { value: 'custom', label: '✏️ Custom question', hint: 'ask anything about your destination' },
];

// Simple markdown renderer (handles ##, **, *, -, bullet points)
function MarkdownContent({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <h3 key={i} className="font-semibold text-base mt-3 mb-1 text-foreground">{line.slice(3)}</h3>;
        }
        if (line.startsWith('### ')) {
          return <h4 key={i} className="font-semibold mt-2 text-foreground">{line.slice(4)}</h4>;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          const content = line.slice(2);
          return (
            <div key={i} className="flex gap-2">
              <span className="text-forge-500 mt-0.5 flex-shrink-0">•</span>
              <span className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
            </div>
          );
        }
        if (/^\d+\. /.test(line)) {
          const num = line.match(/^(\d+)\. /)[1];
          const content = line.replace(/^\d+\. /, '');
          return (
            <div key={i} className="flex gap-2">
              <span className="text-forge-500 font-medium flex-shrink-0">{num}.</span>
              <span className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        );
      })}
    </div>
  );
}

function formatInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1 rounded text-xs font-mono">$1</code>');
}

export function DeepResearchPanel({ open, onOpenChange }) {
  const { currentTrip, savedActivities, saveActivity } = useTripStore();
  const days = currentTrip?.days || [];

  const [category, setCategory] = useState('events');
  const [dayIndex, setDayIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const selectedDay = days[dayIndex];
  const categoryMeta = RESEARCH_CATEGORIES.find((c) => c.value === category);

  const getDefaultQuery = () => {
    if (!selectedDay?.location) return '';
    const hints = {
      events: `What are the best events happening in ${selectedDay.location} in ${selectedDay.label}? Include any hidden gems or local favourites.`,
      dining: `What are the best restaurants and food experiences in ${selectedDay.location}? Mix of local spots and special occasion places.`,
      culture: `What are the must-see cultural and historical sites in ${selectedDay.location}? Include any lesser-known gems.`,
      nightlife: `What's the nightlife like in ${selectedDay.location}? Best bars, clubs, and evening entertainment.`,
      outdoors: `What are the best outdoor activities and day trips from ${selectedDay.location}?`,
      shopping: `Where should I shop in ${selectedDay.location}? Local markets, boutiques, and unique finds.`,
      wellness: `Best wellness and relaxation options in ${selectedDay.location} — spas, parks, calm spots.`,
      transport: `How do I get around ${selectedDay.location} efficiently? Transit tips, apps to use, what to avoid.`,
      custom: '',
    };
    return hints[category] || '';
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    setQuery(''); // reset so user can see the hint
    setResult(null);
  };

  const handleSubmit = async () => {
    const finalQuery = query.trim() || getDefaultQuery();
    if (!finalQuery) {
      toast.error('Please enter a question or select a day first');
      return;
    }
    if (!selectedDay?.location) {
      toast.error('This day has no location set yet');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await api.deepResearch({
        query: finalQuery,
        location: selectedDay.location,
        date: selectedDay.date,
        tripContext: {
          travelers: currentTrip?.travelers,
          budgetTier: currentTrip?.budgetTier,
          travelTypes: selectedDay?.travelTypes,
          interests: currentTrip?.interests,
        },
      });
      setResult({ query: finalQuery, answer: res.answer, location: selectedDay.location, dayIndex });
      setHistory((prev) => [{ query: finalQuery, answer: res.answer, location: selectedDay.location }, ...prev.slice(0, 4)]);
    } catch (err) {
      toast.error('Research failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToItinerary = () => {
    if (!result) return;
    saveActivity(result.dayIndex, {
      name: `Research: ${categoryMeta?.label || category}`,
      description: result.query,
      category: 'Research',
      price_range: 'Free',
      duration: 'Reference',
      best_time_of_day: 'Any',
      highlights: [result.answer.slice(0, 120) + '…'],
      researchAnswer: result.answer,
    });
    toast.success('Added to your itinerary bag!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-forge-500" />
            Deep Research
            {selectedDay?.location && (
              <span className="text-sm font-normal text-muted-foreground">
                — {selectedDay.location}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col overflow-hidden flex-1">
          {/* Controls */}
          <div className="px-6 py-4 space-y-3 flex-shrink-0 border-b bg-muted/30">
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Day selector */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Day</Label>
                <Select
                  value={String(dayIndex)}
                  onValueChange={(v) => { setDayIndex(Number(v)); setResult(null); }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((d, i) => (
                      <SelectItem key={i} value={String(i)} disabled={!d.location && !d.isTravelDay}>
                        <span className="font-medium">Day {d.dayNumber}</span>
                        <span className="text-muted-foreground ml-1.5">
                          {d.isTravelDay ? '✈️ Transit' : d.location || 'No location'}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category selector */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESEARCH_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Query input */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Your question</Label>
              <div className="flex gap-2">
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={categoryMeta?.hint ? `e.g. ${categoryMeta.hint}` : 'Ask anything about your destination…'}
                  className="min-h-[60px] resize-none text-sm flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.metaKey) handleSubmit();
                  }}
                />
              </div>
              {!query && category !== 'custom' && selectedDay?.location && (
                <button
                  type="button"
                  className="text-xs text-forge-500 hover:text-forge-600 underline"
                  onClick={() => setQuery(getDefaultQuery())}
                >
                  Use suggested question →
                </button>
              )}
            </div>

            <Button
              variant="forge"
              size="sm"
              onClick={handleSubmit}
              disabled={loading || (!selectedDay?.location)}
              className="w-full gap-2"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Researching…</>
              ) : (
                <><Send className="h-4 w-4" /> Research this</>
              )}
            </Button>
            {!selectedDay?.location && (
              <p className="text-xs text-destructive text-center">
                Set a location for Day {selectedDay?.dayNumber} first
              </p>
            )}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {result && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs text-muted-foreground italic">
                    "{result.query}"
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddToItinerary}
                    className="flex-shrink-0 gap-1 text-xs h-7"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add to bag
                  </Button>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 border">
                  <MarkdownContent text={result.answer} />
                </div>
              </div>
            )}

            {!result && !loading && history.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Recent searches
                </p>
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setResult({ ...h, dayIndex })}
                    className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-xs font-medium text-foreground truncate">{h.location} — {h.query.slice(0, 60)}{h.query.length > 60 ? '…' : ''}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{h.answer.slice(0, 100)}…</p>
                  </button>
                ))}
              </div>
            )}

            {!result && !loading && history.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a day and category, then ask anything.</p>
                <p className="text-xs mt-1">Claude will give you insider-level travel advice tailored to your trip.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
