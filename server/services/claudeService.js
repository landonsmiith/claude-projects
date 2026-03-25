import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Get activity recommendations for a day
 */
export async function getActivityRecommendations({ location, date, travelTypes, interests, budgetTier, geoContext }) {
  const travelTypeLabels = {
    explorer: 'Explorer (loves discovering hidden gems)',
    partier: 'Partier (enjoys nightlife and social scenes)',
    relaxer: 'Relaxer (prefers slow-paced, chill activities)',
    foodie: 'Foodie (obsessed with local cuisine and restaurants)',
    culture: 'Culture (museums, history, art, architecture)',
  };

  const selectedTypes = (travelTypes || []).map(t => travelTypeLabels[t] || t).join(', ');
  const interestsList = (interests || []).join(', ');

  const geoContextStr = geoContext ? `
Geographic context:
- Country: ${geoContext.country || 'Unknown'}
- Region: ${geoContext.region || 'Unknown'}
- Coastal: ${geoContext.coastal ? 'Yes' : 'No'}
- Elevation: ${geoContext.elevation ? geoContext.elevation + 'm' : 'Unknown'}
- Climate zone: ${geoContext.climateZone || 'Unknown'}
- City population: ${geoContext.population ? geoContext.population.toLocaleString() : 'Unknown'}
` : '';

  // Geographic intelligence rules
  const geoRules = [];
  if (geoContext) {
    if (!geoContext.coastal) geoRules.push('Do NOT recommend beach activities - location is not coastal');
    if (geoContext.elevation > 1500) geoRules.push('Prioritize hiking, mountain activities');
    if (['subarctic', 'arctic', 'tundra'].includes(geoContext.climateZone)) {
      geoRules.push('Do NOT recommend beach activities. Prioritize aurora viewing, dog sledding, fjords, cold-weather experiences');
    }
    if (['tropical', 'mediterranean'].includes(geoContext.climateZone) && geoContext.coastal) {
      geoRules.push('Beach and water activities are highly relevant');
    }
    if (geoContext.population > 1000000) {
      geoRules.push('Include nightlife, rooftop bars, metro transit tips, urban experiences');
    }
  }

  const rulesStr = geoRules.length > 0 ? `\nIMPORTANT RULES:\n${geoRules.map(r => `- ${r}`).join('\n')}` : '';

  const prompt = `You are a world-class travel expert helping plan an itinerary.

The traveler is in ${location} on ${date}.
Travel style: ${selectedTypes || 'General traveler'}
Interests: ${interestsList || 'General sightseeing'}
Budget tier: ${budgetTier || 'mid-range'}
${geoContextStr}${rulesStr}

Return 8-12 activity recommendations as a JSON array. Each activity must have:
{
  "name": "Activity name",
  "description": "2-3 sentence description",
  "category": "one of: Outdoor, Culture, Food & Drink, Nightlife, Adventure, Relaxation, Shopping, Day Trip",
  "price_range": "one of: Free, $, $$, $$$, $$$$",
  "booking_url_search_query": "search query to find this on GetYourGuide/Viator e.g. 'Santorini sunset sailing tour'",
  "duration": "e.g. '2-3 hours' or 'Full day'",
  "best_time_of_day": "one of: Morning, Afternoon, Evening, Night, Any",
  "highlights": ["key highlight 1", "key highlight 2"]
}

Respond ONLY with a valid JSON array, no markdown, no explanation.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].text;
  return JSON.parse(text);
}

/**
 * Get sub-region suggestions for a vague location
 */
export async function getSubRegionSuggestions({ country, tripContext }) {
  const prompt = `A traveler is planning a trip to ${country}.
Trip context: ${JSON.stringify(tripContext)}

Suggest 6 specific sub-regions, islands, or cities within ${country} that would be great to visit.
Return as a JSON array:
[{
  "name": "Region/City name",
  "description": "1-2 sentences why it's great",
  "best_for": ["e.g. beaches", "history", "nightlife"],
  "vibe": "one word vibe e.g. 'Romantic', 'Adventurous', 'Laid-back'"
}]

Respond ONLY with valid JSON.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  return JSON.parse(message.content[0].text);
}

/**
 * Cross-reference location + date for major festivals/events
 */
export async function getLocalFestivals({ location, date }) {
  const prompt = `What major festivals, events, or cultural celebrations happen in ${location} around ${date}?

Return as JSON array (empty array if none):
[{
  "name": "Festival/Event name",
  "description": "Brief description",
  "dates": "Date range",
  "type": "e.g. Music, Cultural, Religious, Food, Sports",
  "crowd_level": "one of: Low, Medium, High, Massive"
}]

Respond ONLY with valid JSON.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  return JSON.parse(message.content[0].text);
}
