import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

function EventCard({ event }) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4 flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">
          {event.source === 'mock' ? '🎭' : '🎟️'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm line-clamp-1">{event.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{event.description}</p>
        </div>
        <Button asChild size="sm" variant="outline" className="flex-shrink-0 gap-1 text-xs h-7">
          <a href={event.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3" />
            View
          </a>
        </Button>
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

  return (
    <div className="space-y-4">
      {/* Festivals banner */}
      {festivalsLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        (festivalsData?.festivals || []).map((f) => (
          <FestivalBanner key={f.name} festival={f} />
        ))
      )}

      {/* Events */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Events in {day.location}</h3>
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
          {(eventsData?.results || []).map((event, i) => (
            <EventCard key={i} event={event} />
          ))}
          {(!eventsData?.results || eventsData.results.length === 0) && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No events found for {day.location} on {day.label}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
