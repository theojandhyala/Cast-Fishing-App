export const FEEDING_WINDOWS = {
  // Simplified solunar-style feeding windows by month
  // major = ~2-hour peak windows, minor = ~1-hour secondary windows
  january:  { major: ['07:30-09:30', '19:45-21:45'], minor: ['13:30-14:30', '01:30-02:30'] },
  february: { major: ['07:00-09:00', '19:15-21:15'], minor: ['13:00-14:00', '01:00-02:00'] },
  march:    { major: ['06:30-08:30', '18:45-20:45'], minor: ['12:30-13:30', '00:30-01:30'] },
  april:    { major: ['05:45-07:45', '18:00-20:00'], minor: ['11:45-12:45', '23:45-00:45'] },
  may:      { major: ['05:00-07:00', '17:15-19:15'], minor: ['11:00-12:00', '23:00-00:00'] },
  june:     { major: ['04:30-06:30', '16:45-18:45'], minor: ['10:30-11:30', '22:30-23:30'] },
  july:     { major: ['04:45-06:45', '17:00-19:00'], minor: ['10:45-11:45', '22:45-23:45'] },
  august:   { major: ['05:15-07:15', '17:30-19:30'], minor: ['11:15-12:15', '23:15-00:15'] },
  september:{ major: ['06:00-08:00', '18:15-20:15'], minor: ['12:00-13:00', '00:00-01:00'] },
  october:  { major: ['06:45-08:45', '19:00-21:00'], minor: ['12:45-13:45', '00:45-01:45'] },
  november: { major: ['07:15-09:15', '19:30-21:30'], minor: ['13:15-14:15', '01:15-02:15'] },
  december: { major: ['07:45-09:45', '20:00-22:00'], minor: ['13:45-14:45', '01:45-02:45'] },
};

// Activity level (0-10) for each species at each hour (0 = midnight, 23 = 11pm)
export const SPECIES_ACTIVITY_BY_HOUR: Record<string, number[]> = {
  carp:    [2, 1, 1, 1, 2, 4, 8, 9, 7, 5, 4, 3, 3, 4, 4, 4, 5, 6, 8, 9, 8, 6, 4, 3],
  pike:    [3, 2, 2, 2, 3, 5, 7, 8, 6, 5, 4, 4, 4, 5, 5, 5, 6, 7, 9, 8, 7, 5, 4, 3],
  perch:   [2, 1, 1, 1, 2, 4, 7, 9, 8, 6, 5, 4, 4, 5, 5, 6, 7, 8, 9, 7, 5, 4, 3, 2],
  tench:   [6, 4, 3, 2, 3, 7, 10, 9, 7, 4, 3, 2, 2, 3, 3, 4, 5, 7, 9, 8, 6, 5, 5, 6],
  bream:   [7, 6, 5, 4, 4, 6, 8, 7, 5, 4, 3, 3, 3, 4, 4, 4, 5, 6, 8, 9, 8, 7, 7, 7],
  roach:   [2, 1, 1, 1, 2, 4, 7, 8, 7, 6, 5, 5, 5, 6, 6, 6, 7, 7, 8, 7, 6, 4, 3, 2],
  barbel:  [1, 1, 1, 1, 1, 2, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 6, 7, 9, 10, 9, 7, 4, 2],
  chub:    [2, 2, 2, 2, 3, 5, 7, 8, 7, 6, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 7, 5, 4, 3],
  salmon:  [2, 2, 1, 1, 2, 5, 8, 9, 7, 6, 5, 4, 4, 5, 6, 6, 7, 8, 9, 8, 6, 5, 3, 2],
  seabass: [4, 5, 6, 5, 4, 4, 5, 5, 5, 4, 4, 4, 4, 4, 5, 5, 6, 7, 8, 9, 9, 8, 7, 5],
};

// Activity score per month (1-10), Jan through Dec
export const MONTHLY_ACTIVITY: Record<string, number[]> = {
  carp:    [2, 2, 3, 5, 7, 9, 10, 10, 8, 6, 4, 2],
  pike:    [8, 7, 6, 5, 4, 3, 3, 3, 5, 7, 9, 10],
  perch:   [7, 7, 7, 6, 5, 5, 5, 5, 6, 8, 9, 8],
  tench:   [1, 1, 2, 4, 8, 10, 10, 9, 7, 4, 2, 1],
  bream:   [3, 3, 4, 5, 6, 8, 10, 9, 7, 5, 3, 3],
  roach:   [7, 7, 8, 7, 6, 5, 4, 5, 6, 8, 9, 8],
  barbel:  [3, 3, 4, 5, 6, 7, 9, 10, 9, 7, 4, 3],
  chub:    [8, 8, 7, 6, 5, 5, 5, 5, 6, 7, 8, 9],
  salmon:  [6, 7, 7, 6, 5, 4, 4, 5, 7, 8, 7, 6],
  seabass: [2, 2, 3, 4, 6, 8, 10, 10, 9, 7, 4, 2],
};

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Returns the approximate moon phase name for a given date.
 * Based on a simple lunation cycle calculation.
 */
export function getMoonPhase(date: Date): { name: string; emoji: string; tip: string } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Simplified moon age calculation
  let c = 0, e = 0, jd = 0;
  if (month < 3) {
    const y = year - 1;
    const m = month + 12;
    c = Math.floor(y / 100);
    e = 2 - c + Math.floor(c / 4);
    jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + e - 1524.5;
  } else {
    c = Math.floor(year / 100);
    e = 2 - c + Math.floor(c / 4);
    jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + e - 1524.5;
  }

  const daysSinceNew = (jd - 2451549.5) % 29.53058867;
  const age = daysSinceNew < 0 ? daysSinceNew + 29.53058867 : daysSinceNew;

  if (age < 1.85)   return { name: 'New Moon',        emoji: '🌑', tip: 'New moon: excellent feeding activity. Fish confidently.' };
  if (age < 7.38)   return { name: 'Waxing Crescent', emoji: '🌒', tip: 'Building moon energy. Feeding improving each night.' };
  if (age < 9.22)   return { name: 'First Quarter',   emoji: '🌓', tip: 'Good feeding activity, especially at dawn and dusk.' };
  if (age < 14.77)  return { name: 'Waxing Gibbous',  emoji: '🌔', tip: 'Approaching peak. Nocturnal species very active.' };
  if (age < 16.61)  return { name: 'Full Moon',       emoji: '🌕', tip: 'Full moon: peak feeding activity. Night fishing exceptional.' };
  if (age < 22.15)  return { name: 'Waning Gibbous',  emoji: '🌖', tip: 'Still excellent. Activity remains elevated.' };
  if (age < 23.99)  return { name: 'Last Quarter',    emoji: '🌗', tip: 'Moderate activity. Dawn sessions most productive.' };
  if (age < 29.5)   return { name: 'Waning Crescent', emoji: '🌘', tip: 'Quiet phase. Focus on heavily baited swims.' };
  return { name: 'New Moon', emoji: '🌑', tip: 'New moon: excellent feeding activity. Fish confidently.' };
}

/**
 * Returns species activity level for the current hour
 */
export function getSpeciesActivityNow(speciesId: string): number {
  const hour = new Date().getHours();
  const activity = SPECIES_ACTIVITY_BY_HOUR[speciesId];
  return activity ? activity[hour] : 5;
}

/**
 * Returns a label for the current time period
 */
export function getTimePeriodLabel(): { label: string; emoji: string; description: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9)   return { label: 'Dawn',    emoji: '🌅', description: 'Dawn feeding period' };
  if (hour >= 9 && hour < 15)  return { label: 'Midday',  emoji: '☀️',  description: 'Midday period' };
  if (hour >= 15 && hour < 20) return { label: 'Dusk',    emoji: '🌇', description: 'Evening feeding period' };
  return { label: 'Night', emoji: '🌙', description: 'Nocturnal period' };
}
