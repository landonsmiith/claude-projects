/**
 * TripForge Affiliate Link Engine
 * Centralised utility for building affiliate deep-links.
 * Affiliate mode is controlled by VITE_AFFILIATE_MODE env var.
 */

const AFFILIATE_IDS = {
  booking: import.meta.env.VITE_BOOKING_AFFILIATE_ID || '',
  skyscanner: import.meta.env.VITE_SKYSCANNER_AFFILIATE_ID || '',
  getyourguide: import.meta.env.VITE_GYG_PARTNER_ID || '',
  viator: import.meta.env.VITE_VIATOR_AFFILIATE_ID || '',
  airalo: import.meta.env.VITE_AIRALO_AFFILIATE_ID || '',
};

const AFFILIATE_MODE = import.meta.env.VITE_AFFILIATE_MODE !== 'false';

function appendAffiliate(url, params) {
  if (!AFFILIATE_MODE) return url;
  const u = new URL(url);
  Object.entries(params).forEach(([k, v]) => {
    if (v) u.searchParams.set(k, v);
  });
  return u.toString();
}

/**
 * Booking.com search link
 */
export function buildBookingLink({ location, checkin, checkout, adults = 2 }) {
  const base = `https://www.booking.com/search.html`;
  const url = new URL(base);
  url.searchParams.set('ss', location);
  if (checkin) url.searchParams.set('checkin', checkin);
  if (checkout) url.searchParams.set('checkout', checkout);
  url.searchParams.set('group_adults', adults);
  if (AFFILIATE_MODE && AFFILIATE_IDS.booking) {
    url.searchParams.set('aid', AFFILIATE_IDS.booking);
  }
  return url.toString();
}

/**
 * Skyscanner flight search link
 */
export function buildSkyscannerLink({ origin, dest, date, adults = 1 }) {
  const dateStr = date ? date.replace(/-/g, '') : '';
  const base = `https://www.skyscanner.net/transport/flights/${origin}/${dest}/${dateStr}/`;
  const url = new URL(base);
  url.searchParams.set('adults', adults);
  if (AFFILIATE_MODE && AFFILIATE_IDS.skyscanner) {
    url.searchParams.set('affiliateId', AFFILIATE_IDS.skyscanner);
  }
  return url.toString();
}

/**
 * GetYourGuide activity search link
 */
export function buildGYGLink({ location, date, query }) {
  const url = new URL('https://www.getyourguide.com/s/');
  url.searchParams.set('q', query || location);
  if (date) url.searchParams.set('date_from', date);
  if (AFFILIATE_MODE && AFFILIATE_IDS.getyourguide) {
    url.searchParams.set('partner_id', AFFILIATE_IDS.getyourguide);
  }
  return url.toString();
}

/**
 * Viator activity search link
 */
export function buildViatorLink({ location, query }) {
  const url = new URL('https://www.viator.com/search/');
  url.searchParams.set('text', query || location);
  if (AFFILIATE_MODE && AFFILIATE_IDS.viator) {
    url.searchParams.set('pid', AFFILIATE_IDS.viator);
    url.searchParams.set('mcid', '42383');
    url.searchParams.set('medium', 'api');
  }
  return url.toString();
}

/**
 * Hostelworld search link
 */
export function buildHostelworldLink({ location, checkin, checkout, guests = 1 }) {
  const url = new URL('https://www.hostelworld.com/search');
  url.searchParams.set('search', location);
  if (checkin) url.searchParams.set('dateFrom', checkin);
  if (checkout) url.searchParams.set('dateTo', checkout);
  url.searchParams.set('guests', guests);
  return url.toString();
}

/**
 * Airbnb search link
 */
export function buildAirbnbLink({ location, checkin, checkout, adults = 2 }) {
  const url = new URL('https://www.airbnb.com/s/');
  url.pathname = `/s/${encodeURIComponent(location)}/homes`;
  if (checkin) url.searchParams.set('checkin', checkin);
  if (checkout) url.searchParams.set('checkout', checkout);
  url.searchParams.set('adults', adults);
  // Airbnb affiliate via Impact
  if (AFFILIATE_MODE && AFFILIATE_IDS.booking) {
    // placeholder — Airbnb affiliate via own program
  }
  return url.toString();
}

/**
 * Trainline link
 */
export function buildTrainlineLink({ origin, dest, date }) {
  const url = new URL('https://www.trainline.com/search');
  url.searchParams.set('origin', origin);
  url.searchParams.set('destination', dest);
  if (date) url.searchParams.set('outwardDate', date);
  return url.toString();
}

/**
 * FlixBus link
 */
export function buildFlixbusLink({ origin, dest }) {
  return `https://www.flixbus.com/bus-routes?departureCity=${encodeURIComponent(origin)}&arrivalCity=${encodeURIComponent(dest)}`;
}

/**
 * World Nomads travel insurance
 */
export function buildWorldNomadsLink({ nationality = 'US' }) {
  return `https://www.worldnomads.com/travel-insurance/?utm_source=tripforge&nationality=${nationality}`;
}

/**
 * Airalo eSIM link
 */
export function buildAiraloLink({ countryCode }) {
  const url = new URL(`https://www.airalo.com/${countryCode?.toLowerCase() || 'global'}`);
  if (AFFILIATE_MODE && AFFILIATE_IDS.airalo) {
    url.searchParams.set('partner', AFFILIATE_IDS.airalo);
  }
  return url.toString();
}

/**
 * Rentalcars.com link
 */
export function buildRentalcarsLink({ location, pickupDate, dropoffDate }) {
  const url = new URL('https://www.rentalcars.com/');
  url.searchParams.set('searchtype', 'location');
  url.searchParams.set('location', location);
  if (pickupDate) url.searchParams.set('puDay', new Date(pickupDate).getDate());
  return url.toString();
}

export { AFFILIATE_MODE };
