import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, ExternalLink, Clock, DollarSign, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTripStore } from '@/store/tripStore';
import { buildGYGLink, buildViatorLink } from '@/lib/affiliates';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const PRICE_COLORS = {
  Free: 'text-green-600',
  '$': 'text-green-500',
  '$$': 'text-yellow-500',
  '$$$': 'text-orange-500',
  '$$$$': 'text-red-500',
};

const TIME_ICONS = {
  Morning: '🌅',
  Afternoon: '☀️',
  Evening: '🌆',
  Night: '🌙',
  Any: '🕐',
};

function ActivityCard({ activity, dayIndex }) {
  const { savedActivities, saveActivity, removeActivity } = useTripStore();
  const isSaved = (savedActivities[dayIndex] || []).some((a) => a.name === activity.name);

  const handleSave = () => {
    if (isSaved) {
      removeActivity(dayIndex, activity.name);
      toast('Activity removed from your bag');
    } else {
      saveActivity(dayIndex, activity);
      toast.success('Activity saved to your bag! 🎒');
    }
  };

  const gygLink = buildGYGLink({
    location: activity.name,
    query: activity.booking_url_search_query,
  });

  const viatorLink = buildViatorLink({
    location: activity.name,
    query: activity.booking_url_search_query,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-sm">{activity.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {activity.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {activity.description}
              </p>
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className={PRICE_COLORS[activity.price_range] || 'text-muted-foreground'}>
                  {activity.price_range}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {activity.duration}
                </span>
                <span className="text-muted-foreground">
                  {TIME_ICONS[activity.best_time_of_day]} {activity.best_time_of_day}
                </span>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="flex-shrink-0 mt-0.5"
              title={isSaved ? 'Remove from bag' : 'Save to bag'}
            >
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5 text-forge-500" />
              ) : (
                <Bookmark className="h-5 w-5 text-muted-foreground hover:text-forge-500 transition-colors" />
              )}
            </button>
          </div>

          {/* Book buttons */}
          <div className="flex gap-2 mt-3">
            <Button asChild size="sm" variant="outline" className="text-xs h-7 gap-1">
              <a href={gygLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                GetYourGuide
              </a>
            </Button>
            <Button asChild size="sm" variant="outline" className="text-xs h-7 gap-1">
              <a href={viatorLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                Viator
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SkeletonActivities() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array(6).fill(0).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-7 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ExploreTab({ day, trip }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['activities', day.location, day.date, day.travelTypes, trip?.interests, trip?.budgetTier],
    queryFn: () => api.getActivities({
      location: day.location,
      date: day.date,
      travelTypes: day.travelTypes,
      interests: trip?.interests,
      budgetTier: trip?.budgetTier,
    }),
    enabled: !!day.location,
    staleTime: 1000 * 60 * 30, // 30 min cache
  });

  if (!day.location) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p className="text-4xl mb-3">📍</p>
        <p className="font-medium">No location set for this day</p>
        <p className="text-sm mt-1">Click the location name above to add one.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Claude is thinking about {day.location}...</span>
        </div>
        <SkeletonActivities />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-3">Could not load recommendations.</p>
        <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    );
  }

  const activities = data?.activities || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium">
            {activities.length} recommendations for {day.location}
          </p>
          {data?.geoContext && (
            <p className="text-xs text-muted-foreground">
              {data.geoContext.coastal ? '🌊 Coastal · ' : ''}
              {data.geoContext.climateZone} climate
              {data.geoContext.elevation > 500 ? ` · ${data.geoContext.elevation}m elevation` : ''}
            </p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={refetch} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {activities.map((activity) => (
          <ActivityCard key={activity.name} activity={activity} dayIndex={day.index} />
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No recommendations found. Try refreshing.</p>
        </div>
      )}
    </div>
  );
}
