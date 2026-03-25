import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Hotel, Map, Ticket, Tag, Edit3, Check, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTripStore } from '@/store/tripStore';
import { FlightsTab } from './tabs/FlightsTab.jsx';
import { StayTab } from './tabs/StayTab.jsx';
import { ExploreTab } from './tabs/ExploreTab.jsx';
import { EventsTab } from './tabs/EventsTab.jsx';
import { DealsTab } from './tabs/DealsTab.jsx';

const TRAVEL_TYPE_ICONS = {
  explorer: '🧭',
  partier: '🎉',
  relaxer: '🏖️',
  foodie: '🍽️',
  culture: '🏛️',
};

function LocationEditor({ day, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(day.location || '');

  const handleSave = () => {
    onSave(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-8 text-lg font-bold border-forge-300"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') setEditing(false);
          }}
          autoFocus
        />
        <button onClick={handleSave} className="text-green-500 hover:text-green-600">
          <Check className="h-5 w-5" />
        </button>
        <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-2 group"
      title="Click to edit location"
    >
      <h2 className="text-2xl font-bold text-foreground">
        {day.location || <span className="text-muted-foreground">Add location</span>}
      </h2>
      <Edit3 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

export function DayCard({ day, trip }) {
  const { updateTripDay } = useTripStore();

  const handleLocationSave = (newLocation) => {
    updateTripDay(day.index, { location: newLocation });
  };

  return (
    <motion.div
      id={`day-${day.index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: day.index * 0.05 }}
      className="scroll-mt-4"
    >
      <Card className="overflow-hidden">
        {/* Day header */}
        <div className="bg-gradient-to-r from-forge-50 to-orange-50 dark:from-forge-950/20 dark:to-orange-950/20 px-6 py-4 border-b">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="forge" className="text-xs font-bold">Day {day.dayNumber}</Badge>
                <span className="text-sm text-muted-foreground">{day.label}</span>
              </div>
              <LocationEditor day={day} onSave={handleLocationSave} />
            </div>

            {/* Travel type badges */}
            {(day.travelTypes || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {day.travelTypes.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-forge-100 text-forge-700 dark:bg-forge-900/30 dark:text-forge-300"
                  >
                    {TRAVEL_TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="explore" className="w-full">
          <div className="px-4 border-b overflow-x-auto">
            <TabsList className="w-full justify-start gap-0 h-auto bg-transparent rounded-none p-0">
              {[
                { value: 'flights', icon: '✈️', label: 'Getting There' },
                { value: 'stay', icon: '🏨', label: 'Stay' },
                { value: 'explore', icon: '🗺️', label: 'Explore' },
                { value: 'events', icon: '🎟️', label: 'Events' },
                { value: 'deals', icon: '💰', label: 'Deals' },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    'rounded-none border-b-2 border-transparent data-[state=active]:border-forge-500 data-[state=active]:bg-transparent data-[state=active]:text-forge-600 data-[state=active]:shadow-none',
                    'px-3 py-3 text-xs font-medium gap-1.5 flex-shrink-0'
                  )}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-4">
            <TabsContent value="flights">
              <FlightsTab day={day} trip={trip} />
            </TabsContent>
            <TabsContent value="stay">
              <StayTab day={day} trip={trip} />
            </TabsContent>
            <TabsContent value="explore">
              <ExploreTab day={day} trip={trip} />
            </TabsContent>
            <TabsContent value="events">
              <EventsTab day={day} />
            </TabsContent>
            <TabsContent value="deals">
              <DealsTab day={day} trip={trip} />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </motion.div>
  );
}
