import { format, eachDayOfInterval, differenceInDays, parseISO, isValid } from 'date-fns';

export function generateDays(departureDate, returnDate) {
  if (!departureDate || !returnDate) return [];

  const start = typeof departureDate === 'string' ? parseISO(departureDate) : departureDate;
  const end = typeof returnDate === 'string' ? parseISO(returnDate) : returnDate;

  if (!isValid(start) || !isValid(end) || end < start) return [];

  return eachDayOfInterval({ start, end }).map((date, index) => ({
    index,
    date: format(date, 'yyyy-MM-dd'),
    label: format(date, 'EEE, MMM d'),
    dayNumber: index + 1,
  }));
}

export function formatDate(date, fmt = 'MMM d, yyyy') {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, fmt) : '';
}

export function tripDuration(departureDate, returnDate) {
  if (!departureDate || !returnDate) return 0;
  const start = typeof departureDate === 'string' ? parseISO(departureDate) : departureDate;
  const end = typeof returnDate === 'string' ? parseISO(returnDate) : returnDate;
  return differenceInDays(end, start) + 1;
}
