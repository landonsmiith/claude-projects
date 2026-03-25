/**
 * TripForge Link Engine
 * Centralised utility for building direct booking links.
 */

export function buildBookingLink({ location, checkin, checkout, adults = 2 }) {
  const url = new URL('https://www.booking.com/search.html');
  url.searchParams.set('ss', location);
  if (checkin) url.searchParams.set('checkin', checkin);
  if (checkout) url.searchParams.set('checkout', checkout);
  url.searchParams.set('group_adults', adults);
  return url.toString();
}

export function buildSkyscannerLink({ origin, dest, date, adults = 1 }) {
  const dateStr = date ? date.replace(/-/g, '') : '';
  return `https://www.skyscanner.com/transport/flights/${encodeURIComponent(origin)}/${encodeURIComponent(dest)}/${dateStr}/`;
}

export function buildGYGLink({ location, date, query }) {
  const url = new URL('https://www.getyourguide.com/s/');
  url.searchParams.set('q', query || location);
  if (date) url.searchParams.set('date_from', date);
  return url.toString();
}

export function buildViatorLink({ location, query }) {
  const url = new URL('https://www.viator.com/search/');
  url.searchParams.set('text', query || location);
  return url.toString();
}

export function buildHostelworldLink({ location, checkin, checkout, guests = 1 }) {
  const url = new URL('https://www.hostelworld.com/search');
  url.searchParams.set('search', location);
  if (checkin) url.searchParams.set('dateFrom', checkin);
  if (checkout) url.searchParams.set('dateTo', checkout);
  url.searchParams.set('guests', guests);
  return url.toString();
}

export function buildAirbnbLink({ location, checkin, checkout, adults = 2 }) {
  const base = `https://www.airbnb.com/s/${encodeURIComponent(location)}/homes`;
  const url = new URL(base);
  if (checkin) url.searchParams.set('checkin', checkin);
  if (checkout) url.searchParams.set('checkout', checkout);
  url.searchParams.set('adults', adults);
  return url.toString();
}

export function buildTrainlineLink({ origin, dest, date }) {
  const url = new URL('https://www.trainline.com/search');
  url.searchParams.set('origin', origin);
  url.searchParams.set('destination', dest);
  if (date) url.searchParams.set('outwardDate', date);
  return url.toString();
}

export function buildFlixbusLink({ origin, dest }) {
  return `https://www.flixbus.com/bus-routes?departureCity=${encodeURIComponent(origin)}&arrivalCity=${encodeURIComponent(dest)}`;
}

export function buildWorldNomadsLink() {
  return 'https://www.worldnomads.com/travel-insurance/';
}

export function buildAiraloLink() {
  return 'https://www.airalo.com/';
}

export function buildRentalcarsLink({ location }) {
  const url = new URL('https://www.rentalcars.com/');
  url.searchParams.set('location', location);
  return url.toString();
}
