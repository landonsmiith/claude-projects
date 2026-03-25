import fetch from 'node-fetch';

const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;

/**
 * Resolve geographic context from a location name
 */
export async function resolveGeoContext(locationName) {
  if (!OPENCAGE_API_KEY) {
    return getFallbackGeoContext(locationName);
  }

  try {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(locationName)}&key=${OPENCAGE_API_KEY}&limit=1&no_annotations=0`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return getFallbackGeoContext(locationName);
    }

    const result = data.results[0];
    const components = result.components;
    const annotations = result.annotations || {};
    const geometry = result.geometry;

    const elevation = annotations.DMS ? null : null; // OpenCage doesn't provide elevation directly
    const coastal = detectCoastal(components, locationName);
    const climateZone = inferClimateZone(geometry.lat, geometry.lng, components);
    const population = estimatePopulation(components);

    return {
      lat: geometry.lat,
      lng: geometry.lng,
      country: components.country || '',
      countryCode: components.country_code?.toUpperCase() || '',
      region: components.state || components.county || '',
      city: components.city || components.town || components.village || locationName,
      coastal,
      elevation: elevation || 0,
      climateZone,
      population,
      timezone: annotations.timezone?.name || 'UTC',
    };
  } catch (err) {
    console.error('Geo resolution error:', err.message);
    return getFallbackGeoContext(locationName);
  }
}

function detectCoastal(components, locationName) {
  const coastalKeywords = ['beach', 'bay', 'coast', 'island', 'sea', 'ocean', 'port', 'harbor', 'cove', 'gulf'];
  const name = locationName.toLowerCase();
  return coastalKeywords.some(kw => name.includes(kw));
}

function inferClimateZone(lat, lng, components) {
  const absLat = Math.abs(lat);
  const country = (components.country_code || '').toLowerCase();

  // Arctic/Subarctic
  if (absLat > 66) return 'arctic';
  if (absLat > 55) return 'subarctic';

  // Tropical band
  if (absLat < 23.5) {
    // Southeast Asia, Caribbean, Central America, Africa tropics
    const tropicalCountries = ['th', 'id', 'ph', 'my', 'vn', 'sg', 'mx', 'br', 'co', 've', 'ke', 'tz', 'gh', 'ng'];
    if (tropicalCountries.includes(country)) return 'tropical';
    return 'subtropical';
  }

  // Mediterranean band (20-45 degrees)
  if (absLat < 45) {
    const medCountries = ['es', 'it', 'gr', 'hr', 'me', 'al', 'tr', 'tn', 'ma', 'dz', 'il', 'lb', 'cy'];
    if (medCountries.includes(country)) return 'mediterranean';

    // Middle East / desert
    const desertCountries = ['sa', 'ae', 'om', 'qa', 'kw', 'bh', 'jo', 'eg', 'ly'];
    if (desertCountries.includes(country)) return 'desert';
  }

  // Temperate default
  return 'temperate';
}

function estimatePopulation(components) {
  // Rough estimates based on city type in OpenCage
  if (components.city) return 500000; // assume medium city
  if (components.town) return 50000;
  if (components.village) return 5000;
  return 100000;
}

function getFallbackGeoContext(locationName) {
  return {
    lat: 0,
    lng: 0,
    country: '',
    countryCode: '',
    region: '',
    city: locationName,
    coastal: false,
    elevation: 0,
    climateZone: 'temperate',
    population: 100000,
    timezone: 'UTC',
  };
}

/**
 * Haversine distance between two lat/lng points in km
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Determine best travel mode based on distance
 */
export function recommendTravelMode(distanceKm) {
  if (distanceKm < 50) return 'ground'; // bus/taxi
  if (distanceKm < 300) return 'ground'; // train preferred
  if (distanceKm < 800) return 'either'; // train or flight
  return 'flight';
}
