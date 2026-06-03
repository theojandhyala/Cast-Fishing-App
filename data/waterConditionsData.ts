export interface RegionConditions {
  region: string;
  waterTemp: number; // Celsius
  tempTrend: 'rising' | 'falling' | 'stable';
  clarity: 'clear' | 'coloured' | 'murky';
  algaeAlert: boolean;
  algaeNote?: string;
  rivers: RiverLevel[];
  history: ConditionHistory[];
  idealFor: string[];
  poorFor: string[];
  advice: string;
}

export interface RiverLevel {
  name: string;
  level: 'low' | 'normal' | 'rising' | 'high' | 'flood';
  change: string;
}

export interface ConditionHistory {
  date: string;
  temp: number;
  clarity: 'clear' | 'coloured' | 'murky';
}

export const WATER_CONDITIONS: RegionConditions[] = [
  {
    region: 'Southern England',
    waterTemp: 17.4,
    tempTrend: 'rising',
    clarity: 'clear',
    algaeAlert: false,
    rivers: [
      { name: 'River Thames', level: 'normal', change: '-0.1m in 24h' },
      { name: 'River Kennet', level: 'low', change: '-0.3m in 24h' },
      { name: 'River Test', level: 'normal', change: 'Stable' },
      { name: 'River Itchen', level: 'normal', change: 'Stable' },
    ],
    history: [
      { date: '28 May', temp: 15.2, clarity: 'clear' },
      { date: '29 May', temp: 15.8, clarity: 'clear' },
      { date: '30 May', temp: 16.1, clarity: 'clear' },
      { date: '31 May', temp: 16.5, clarity: 'clear' },
      { date: '1 Jun', temp: 16.9, clarity: 'clear' },
      { date: '2 Jun', temp: 17.1, clarity: 'clear' },
      { date: '3 Jun', temp: 17.4, clarity: 'clear' },
    ],
    idealFor: ['Carp', 'Tench', 'Brown Trout', 'Sea Trout'],
    poorFor: ['Cod', 'Pike'],
    advice: 'Excellent conditions for carp and tench. Rising water temperature has fish active and feeding confidently. Good time for surface fishing and zig rigs.',
  },
  {
    region: 'Midlands',
    waterTemp: 15.8,
    tempTrend: 'stable',
    clarity: 'coloured',
    algaeAlert: false,
    rivers: [
      { name: 'River Severn', level: 'rising', change: '+0.4m in 24h' },
      { name: 'River Trent', level: 'normal', change: 'Stable' },
      { name: 'River Avon', level: 'normal', change: 'Stable' },
      { name: 'Grand Union Canal', level: 'normal', change: 'Stable' },
    ],
    history: [
      { date: '28 May', temp: 15.5, clarity: 'clear' },
      { date: '29 May', temp: 15.6, clarity: 'clear' },
      { date: '30 May', temp: 15.7, clarity: 'coloured' },
      { date: '31 May', temp: 15.8, clarity: 'coloured' },
      { date: '1 Jun', temp: 15.9, clarity: 'coloured' },
      { date: '2 Jun', temp: 15.8, clarity: 'coloured' },
      { date: '3 Jun', temp: 15.8, clarity: 'coloured' },
    ],
    idealFor: ['Barbel', 'Chub', 'Bream', 'Perch'],
    poorFor: ['Grayling', 'Trout'],
    advice: 'River Severn is rising following recent rainfall — this can trigger excellent barbel fishing. Coloured water means fish are less wary. Use larger baits for scent trail.',
  },
  {
    region: 'Northern England',
    waterTemp: 13.2,
    tempTrend: 'rising',
    clarity: 'clear',
    algaeAlert: false,
    rivers: [
      { name: 'River Ribble', level: 'normal', change: 'Stable' },
      { name: 'River Lune', level: 'low', change: '-0.2m in 24h' },
      { name: 'River Eden', level: 'normal', change: '+0.1m in 24h' },
      { name: 'River Tees', level: 'normal', change: 'Stable' },
    ],
    history: [
      { date: '28 May', temp: 11.9, clarity: 'clear' },
      { date: '29 May', temp: 12.1, clarity: 'clear' },
      { date: '30 May', temp: 12.4, clarity: 'clear' },
      { date: '31 May', temp: 12.7, clarity: 'clear' },
      { date: '1 Jun', temp: 12.9, clarity: 'clear' },
      { date: '2 Jun', temp: 13.1, clarity: 'clear' },
      { date: '3 Jun', temp: 13.2, clarity: 'clear' },
    ],
    idealFor: ['Grayling', 'Brown Trout', 'Barbel', 'Chub'],
    poorFor: ['Carp', 'Tench'],
    advice: 'Good clear conditions for fly fishing on Northern rivers. Trout are active in the morning and evening sessions. Water temperature rising steadily which will improve feeding activity.',
  },
  {
    region: 'Scotland',
    waterTemp: 10.1,
    tempTrend: 'rising',
    clarity: 'clear',
    algaeAlert: false,
    rivers: [
      { name: 'River Tay', level: 'normal', change: 'Stable' },
      { name: 'River Spey', level: 'normal', change: 'Stable' },
      { name: 'River Dee', level: 'low', change: '-0.3m in 24h' },
      { name: 'River Tweed', level: 'normal', change: '+0.1m in 24h' },
    ],
    history: [
      { date: '28 May', temp: 9.2, clarity: 'clear' },
      { date: '29 May', temp: 9.5, clarity: 'clear' },
      { date: '30 May', temp: 9.7, clarity: 'clear' },
      { date: '31 May', temp: 9.9, clarity: 'clear' },
      { date: '1 Jun', temp: 10.0, clarity: 'clear' },
      { date: '2 Jun', temp: 10.0, clarity: 'clear' },
      { date: '3 Jun', temp: 10.1, clarity: 'clear' },
    ],
    idealFor: ['Atlantic Salmon', 'Sea Trout', 'Brown Trout', 'Arctic Char'],
    poorFor: ['Carp', 'Bream'],
    advice: 'Good salmon conditions on the Tay and Spey. Spring run fish still moving through. Fly fishing with a floating line and small flies recommended. River levels are ideal.',
  },
  {
    region: 'Wales',
    waterTemp: 14.3,
    tempTrend: 'stable',
    clarity: 'coloured',
    algaeAlert: true,
    algaeNote: 'Blue-green algae advisory on Lake Vyrnwy — do not handle water or fish from affected areas.',
    rivers: [
      { name: 'River Wye', level: 'high', change: '+0.6m in 24h' },
      { name: 'River Usk', level: 'rising', change: '+0.3m in 24h' },
      { name: 'River Dee (Wales)', level: 'normal', change: 'Stable' },
      { name: 'River Conwy', level: 'normal', change: '+0.1m in 24h' },
    ],
    history: [
      { date: '28 May', temp: 14.0, clarity: 'clear' },
      { date: '29 May', temp: 14.1, clarity: 'clear' },
      { date: '30 May', temp: 14.2, clarity: 'coloured' },
      { date: '31 May', temp: 14.3, clarity: 'murky' },
      { date: '1 Jun', temp: 14.4, clarity: 'murky' },
      { date: '2 Jun', temp: 14.3, clarity: 'coloured' },
      { date: '3 Jun', temp: 14.3, clarity: 'coloured' },
    ],
    idealFor: ['Sea Trout', 'Salmon', 'Chub'],
    poorFor: ['Grayling', 'Trout (visibility too low)'],
    advice: 'River Wye is running high and coloured after heavy rain. Sea trout moving in good numbers — night fishing with a tube fly or spinner can be productive. Avoid Lake Vyrnwy due to algae.',
  },
];

export const SPECIES_IDEAL_CONDITIONS: Record<string, { temp: string; clarity: string; advice: string }> = {
  Carp: { temp: '16-22°C', clarity: 'Clear to slightly coloured', advice: 'Fish confidently in warm, clear conditions. Surface feeding likely above 20°C.' },
  Pike: { temp: '8-14°C', clarity: 'Slightly coloured', advice: 'Most active in cooler months. Coloured water can improve feeding aggression.' },
  'Brown Trout': { temp: '10-16°C', clarity: 'Clear', advice: 'Prefer cold, clear, well-oxygenated water. Hatches more likely in 12-15°C range.' },
  Barbel: { temp: '14-20°C', clarity: 'Coloured to slightly murky', advice: 'Feed actively in warm, coloured water. Often triggered by rising rivers after rain.' },
  'Atlantic Salmon': { temp: '8-15°C', clarity: 'Clear to lightly coloured', advice: 'Fish best when rivers are falling after a spate. Medium water height ideal.' },
  Bream: { temp: '14-20°C', clarity: 'Clear to slightly coloured', advice: 'Feed in shoals on warm summer nights. Look for bubbling activity at dawn.' },
  Tench: { temp: '16-22°C', clarity: 'Clear', advice: 'Dawn fishing in warm conditions with weed beds. Look for bubbling in margins.' },
  Perch: { temp: '12-18°C', clarity: 'Clear', advice: 'Active all year but best in clear water. Hunt in shoals around structure.' },
};
