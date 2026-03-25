import { ExternalLink, Shield, Car, Wifi, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  buildWorldNomadsLink,
  buildRentalcarsLink,
  buildAiraloLink,
} from '@/lib/affiliates';

function DealCard({ icon: Icon, title, description, cta, href, color }) {
  return (
    <Card className={`border-l-4 ${color} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="flex-shrink-0 p-2 rounded-lg bg-muted">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <Button asChild size="sm" variant="outline" className="flex-shrink-0 gap-1 text-xs">
          <a href={href} target="_blank" rel="noopener noreferrer">
            {cta}
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

export function DealsTab({ day, trip }) {
  const location = day.location || '';
  const geoContext = trip?.geoContexts?.[day.index];
  const countryCode = geoContext?.countryCode || 'US';

  const deals = [
    {
      icon: Shield,
      title: 'Travel Insurance',
      description: 'Protect your trip with World Nomads. Medical, cancellation & adventure sports covered.',
      cta: 'Get quote',
      href: buildWorldNomadsLink({ nationality: countryCode }),
      color: 'border-blue-400',
    },
    {
      icon: Wifi,
      title: `eSIM for ${geoContext?.country || 'your destination'}`,
      description: 'Stay connected without roaming charges. Instant digital SIM via Airalo.',
      cta: 'Get eSIM',
      href: buildAiraloLink({ countryCode }),
      color: 'border-green-400',
    },
    {
      icon: Car,
      title: 'Rent a Car',
      description: `Compare rental cars in ${location}. All major providers, lowest prices guaranteed.`,
      cta: 'Compare',
      href: buildRentalcarsLink({ location, pickupDate: day.date }),
      color: 'border-yellow-400',
    },
    {
      icon: CreditCard,
      title: 'Travel Credit Cards',
      description: 'No foreign transaction fees, travel rewards & lounge access. Compare top cards.',
      cta: 'Compare cards',
      href: `https://www.nerdwallet.com/best/credit-cards/travel`,
      color: 'border-purple-400',
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Curated deals for your stay in <span className="font-medium text-foreground">{location || 'this destination'}</span>
      </p>
      {deals.map((deal) => (
        <DealCard key={deal.title} {...deal} />
      ))}
      <p className="text-xs text-muted-foreground pt-2">
        💡 Some links may include affiliate codes — this helps keep TripForge free to use.
      </p>
    </div>
  );
}
