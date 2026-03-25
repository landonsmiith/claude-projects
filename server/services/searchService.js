import fetch from 'node-fetch';

const BRAVE_API_KEY = process.env.BRAVE_SEARCH_API_KEY;
const SERP_API_KEY = process.env.SERP_API_KEY;

/**
 * Search for events in a location on a specific date
 */
export async function searchEvents({ location, date }) {
  const query = `${location} events ${date} tickets things to do`;

  if (BRAVE_API_KEY) {
    return searchWithBrave(query);
  }
  if (SERP_API_KEY) {
    return searchWithSerp(query);
  }

  return getMockEvents(location, date);
}

async function searchWithBrave(query) {
  try {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': BRAVE_API_KEY,
      },
    });
    const data = await res.json();

    return (data.web?.results || []).slice(0, 5).map(r => ({
      title: r.title,
      description: r.description,
      url: r.url,
      source: 'brave',
    }));
  } catch (err) {
    console.error('Brave search error:', err.message);
    return [];
  }
}

async function searchWithSerp(query) {
  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${SERP_API_KEY}&num=10`;
    const res = await fetch(url);
    const data = await res.json();

    return (data.organic_results || []).slice(0, 5).map(r => ({
      title: r.title,
      description: r.snippet,
      url: r.link,
      source: 'serp',
    }));
  } catch (err) {
    console.error('SerpAPI error:', err.message);
    return [];
  }
}

function getMockEvents(location, date) {
  return [
    {
      title: `Local Food Market — ${location}`,
      description: 'Weekly artisan food market with local vendors and live music.',
      url: `https://www.google.com/search?q=${encodeURIComponent(location + ' food market ' + date)}`,
      source: 'mock',
    },
    {
      title: `Walking Tour — ${location} Old Town`,
      description: 'Guided walking tour of historic landmarks with expert local guide.',
      url: `https://www.getyourguide.com/s/?q=${encodeURIComponent(location + ' walking tour')}`,
      source: 'mock',
    },
    {
      title: `Live Music Night — ${location}`,
      description: 'Evening concert featuring local and regional artists.',
      url: `https://www.google.com/search?q=${encodeURIComponent(location + ' live music ' + date)}`,
      source: 'mock',
    },
  ];
}
