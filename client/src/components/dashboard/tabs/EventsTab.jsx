import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Calendar, Loader2, RefreshCw, Bookmark, BookmarkCheck, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { useTripStore } from '@/store/tripStore';
import { toast } from 'sonner';

/**
 * Return the hostname of a URL, stripping www.
 */
function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Deduplicate events: keep at most one event per domain.
 */
function deduplicateEvents(events) {
  const seen = new Set();
  return events.filter((ev) => {
    if (!ev.url) return true;
    const domain = getDomain(ev.url);
    if (seen.has(domain)) return false;
    seen.add(domain);
    return true;
  });
}

/**
 * Return 2-3 curated "best sources" links for a given location.
 * These are authoritative, well-known event listing sites.
 */
function getCuratedSources(location) {
  const city = location?.split(',')[0]?.trim() || location;
  const q = encodeURIComponent(city);
  return [
    {
      name: 'Eventbrite',
      description: 'Largest events & ticket platform — concerts, classes, workshops & more',
      url: `https://www.eventbrite.com/d/${encodeURIComponent(city.toLowerCase().replace(/\s+/g, '-'))}/events/`,
      icon: '🎟️',
    },
    {
      name: 'Meetup',
      description: 'Local community events, groups & social gatherings',
      url: `https://www.meetup.com/find/?location=${q}&source=EVENTS`,
      icon: '🤝',
    },
    {
      name: 'Google Events',
      description: 'Google\'s curated local events listing — updated daily',
      url: `https://www.google.com/search?q=events+in+${q}&ibp=htl;events`,
      icon: '📅',
    },
  ];
}

function EventCard({ event, dayIndex }) {
  const { savedEvents, saveEvent, removeEvent } = useTripStore();
  const isSaved = (savedEvents[dayIndex] || []).some((e) => e.title === event.title);

  const handleToggleSave = () => {
    if (isSaved) {
      removeEvent(dayIndex, event.title);
      toast('Removed from itinerary');
    } else {
      saveEvent(dayIndex, event);
      toast.success('Added to itinerary bag!');
    }
  };

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4 flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">
          {event.source === 'mock' ? '🎭' : '🎟️'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm line-clamp-1">{event.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{event.description}</p>
          {event.url && (
            <p className="text-xs text-muted-foreground mt-1 opacity-60">
              {getDomain(event.url)}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <Button asChild size="sm" variant="outline" className="gap-1 text-xs h-7">
            <a href={event.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
              View
            </a>
          </Button>
          <Button
            size="sm"
            variant={isSaved ? 'secondary' : 'ghost'}
            className="gap-1 text-xs h-7"
            onClick={handleToggleSave}
            title={isSaved ? 'Remove from itinerary' : 'Save to itinerary'}
          >
            {isSaved ? (
              <BookmarkCheck className="h-3 w-3 text-forge-500" />
            ) : (
              <Bookmark className="h-3 w-3" />
            )}
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FestivalBanner({ festival }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3 flex items-start gap-2">
      <span className="text-xl">🎪</span>
      <div>
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{festival.name}</p>
        <p className="text-xs text-amber-700 dark:text-amber-400">{festival.description}</p>
        <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
          {festival.dates} · {festival.type} · Crowd: {festival.crowd_level}
        </p>
      </div>
    </div>
  );
}

function CuratedSourceCard({ source }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 hover:border-forge-300 transition-all group"
    >
      <span className="text-2xl flex-shrink-0">{source.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm">{source.name}</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-xs text-muted-foreground">{source.description}</p>
      </div>
    </a>
  );
}

export function EventsTab({ day }) {
  const { data: eventsData, isLoading: eventsLoading, refetch } = useQuery({
    queryKey: ['events', day.location, day.date],
    queryFn: () => api.searchEvents({ location: day.location, date: day.date }),
    enabled: !!day.location,
    staleTime: 1000 * 60 * 15,
  });

  const { data: festivalsData, isLoading: festivalsLoading } = useQuery({
    queryKey: ['festivals', day.location, day.date],
    queryFn: () => api.getFestivals({ location: day.location, date: day.date }),
    enabled: !!day.location,
    staleTime: 1000 * 60 * 60,
  });

  if (!day.location) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p>Add a location to see local events.</p>
      </div>
    );
  }

  const rawEvents = eventsData?.results || [];
  const deduped = deduplicateEvents(rawEvents);
  const curatedSources = getCuratedSources(day.location);

  return (
    <div className="space-y-5">
      {/* Festivals banner */}
      {festivalsLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        (festivalsData?.festivals || []).map((f) => (
          <FestivalBanner key={f.name} festival={f} />
        ))
      )}

      {/* Curated sources — always shown first */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-4 w-4 text-forge-500" />
          <h3 className="text-sm font-semibold">Best sources for events in {day.location}</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          These sites have the most comprehensive, up-to-date event listings — bookmark them for your trip.
        </p>
        <div className="space-y-2">
          {curatedSources.map((src) => (
            <CuratedSourceCard key={src.name} source={src} />
          ))}
        </div>
      </div>

      {/* Live events */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Live search results</h3>
          <Button variant="ghost" size="sm" onClick={refetch} className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {eventsLoading ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {deduped.map((event, i) => (
              <EventCard key={i} event={event} dayIndex={day.index ?? day.dayNumber - 1} />
            ))}
            {deduped.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No live results found. Use the sources above for the most up-to-date listings.
              </div>
            )}
            {rawEvents.length > deduped.length && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                {rawEvents.length - deduped.length} duplicate source{rawEvents.length - deduped.length > 1 ? 's' : ''} hidden
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
