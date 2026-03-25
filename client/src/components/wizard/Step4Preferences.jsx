import { useState } from 'react';
import { Heart, Utensils, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const INTERESTS = [
  { id: 'hiking', emoji: '🥾', label: 'Hiking' },
  { id: 'nightlife', emoji: '🌙', label: 'Nightlife' },
  { id: 'museums', emoji: '🏛️', label: 'Museums' },
  { id: 'beaches', emoji: '🏖️', label: 'Beaches' },
  { id: 'wine', emoji: '🍷', label: 'Wine & Spirits' },
  { id: 'adventure', emoji: '🪂', label: 'Adventure Sports' },
  { id: 'photography', emoji: '📷', label: 'Photography' },
  { id: 'architecture', emoji: '🏗️', label: 'Architecture' },
  { id: 'shopping', emoji: '🛍️', label: 'Shopping' },
  { id: 'wellness', emoji: '🧘', label: 'Spa & Wellness' },
  { id: 'cooking', emoji: '👨‍🍳', label: 'Cooking Classes' },
  { id: 'wildlife', emoji: '🦁', label: 'Wildlife' },
  { id: 'cycling', emoji: '🚴', label: 'Cycling' },
  { id: 'diving', emoji: '🤿', label: 'Diving & Snorkeling' },
  { id: 'concerts', emoji: '🎸', label: 'Concerts & Shows' },
  { id: 'street-food', emoji: '🌮', label: 'Street Food' },
];

const DIETARY = [
  { id: 'vegetarian', label: '🥗 Vegetarian' },
  { id: 'vegan', label: '🌱 Vegan' },
  { id: 'gluten-free', label: '🌾 Gluten-free' },
  { id: 'halal', label: '☪️ Halal' },
  { id: 'kosher', label: '✡️ Kosher' },
  { id: 'nut-allergy', label: '🥜 Nut allergy' },
  { id: 'dairy-free', label: '🥛 Dairy-free' },
  { id: 'seafood-allergy', label: '🦐 No seafood' },
];

export function Step4Preferences({ data, onChange, onBack, onComplete }) {
  const interests = data.interests || [];
  const dietary = data.dietaryRestrictions || [];

  const toggleInterest = (id) => {
    const updated = interests.includes(id)
      ? interests.filter((i) => i !== id)
      : [...interests, id];
    onChange({ interests: updated });
  };

  const toggleDietary = (id) => {
    const updated = dietary.includes(id)
      ? dietary.filter((d) => d !== id)
      : [...dietary, id];
    onChange({ dietaryRestrictions: updated });
  };

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">Your preferences</h1>
        <p className="text-muted-foreground mt-1">
          Help us personalise your recommendations.
        </p>
      </div>

      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-forge-500" />
            What are you into?
          </CardTitle>
          <CardDescription>Pick everything that sounds good</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => {
              const isSelected = interests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all',
                    isSelected
                      ? 'bg-forge-500 text-white border-forge-500 shadow-sm'
                      : 'bg-background border-border hover:border-forge-300 hover:bg-forge-50 dark:hover:bg-forge-950/20'
                  )}
                >
                  <span>{interest.emoji}</span>
                  {interest.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dietary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Utensils className="h-5 w-5 text-forge-500" />
            Dietary restrictions
          </CardTitle>
          <CardDescription>We'll filter restaurant recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {DIETARY.map((d) => {
              const isSelected = dietary.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => toggleDietary(d.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm border transition-all',
                    isSelected
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-background border-border hover:border-green-300'
                  )}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mobility & Other */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-forge-500" />
            Accessibility & mobility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="mobility">Any mobility considerations?</Label>
            <Input
              id="mobility"
              placeholder="e.g. wheelchair accessible venues required, no steep hikes"
              value={data.mobilityConsiderations || ''}
              onChange={(e) => onChange({ mobilityConsiderations: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onComplete} variant="forge" size="lg" className="gap-2">
          🚀 Build my trip board!
        </Button>
      </div>
    </div>
  );
}
