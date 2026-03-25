/**
 * API client for TripForge backend
 */

const BASE_URL = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Recommendations
  getActivities: (body) => request('/recommendations/activities', { method: 'POST', body }),
  getSubRegions: (body) => request('/recommendations/sub-regions', { method: 'POST', body }),
  getFestivals: (body) => request('/recommendations/festivals', { method: 'POST', body }),

  // Geo
  resolveGeo: (body) => request('/geo/resolve', { method: 'POST', body }),
  getDistance: (body) => request('/geo/distance', { method: 'POST', body }),

  // Weather
  getWeather: (body) => request('/weather', { method: 'POST', body }),

  // Search
  searchEvents: (body) => request('/search/events', { method: 'POST', body }),

  // Trips
  getTrip: (id) => request(`/trips/${id}`),
  createTrip: (body) => request('/trips', { method: 'POST', body }),
  updateTrip: (id, body) => request(`/trips/${id}`, { method: 'PUT', body }),
  deleteTrip: (id) => request(`/trips/${id}`, { method: 'DELETE' }),
  shareTrip: (id) => request(`/trips/${id}/share`, { method: 'POST' }),

  // Research
  deepResearch: (body) => request('/research/deep', { method: 'POST', body }),

  // Geo autocomplete
  geoAutocomplete: (q) => request(`/geo/autocomplete?q=${encodeURIComponent(q)}`),

  // Health
  health: () => request('/health'),
};
