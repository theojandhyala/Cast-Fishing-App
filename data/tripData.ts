export interface Trip {
  id: string;
  title: string;
  date: string; // ISO date string
  location: string;
  latitude?: number;
  longitude?: number;
  targetSpecies: string[];
  fishingScore: number;
  notes: string;
  checklist: Array<{ id: string; label: string; checked: boolean; icon: string }>;
  catchIds: string[];
  status: 'upcoming' | 'completed' | 'cancelled';
}

export const SAMPLE_TRIPS: Trip[] = [
  {
    id: 'trip1',
    title: 'Grafham Water Session',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Grafham Water',
    latitude: 52.2792,
    longitude: -0.3016,
    targetSpecies: ['Carp', 'Tench'],
    fishingScore: 82,
    notes: 'Going for the big mirror in the north bay. Bring the 3.5lb rods.',
    checklist: [
      { id: 'rod', label: 'Rod(s)', checked: true, icon: 'fishing' },
      { id: 'reel', label: 'Reel(s)', checked: true, icon: 'cog' },
      { id: 'bait', label: 'Boilies & Corn', checked: false, icon: 'bug' },
      { id: 'licence', label: 'Rod Licence', checked: true, icon: 'file-document-outline' },
      { id: 'landing-net', label: 'Landing Net', checked: false, icon: 'spider-web' },
    ],
    catchIds: [],
    status: 'upcoming',
  },
  {
    id: 'trip2',
    title: 'River Thames Barbel Hunt',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'River Thames, Pangbourne',
    latitude: 51.4827,
    longitude: -1.1219,
    targetSpecies: ['Barbel', 'Chub'],
    fishingScore: 74,
    notes: 'Targeted the fast run below the weir. Luncheon meat and pellets.',
    checklist: [
      { id: 'rod', label: 'Rod(s)', checked: true, icon: 'fishing' },
      { id: 'reel', label: 'Reel(s)', checked: true, icon: 'cog' },
      { id: 'bait', label: 'Luncheon Meat', checked: true, icon: 'bug' },
      { id: 'licence', label: 'Rod Licence', checked: true, icon: 'file-document-outline' },
    ],
    catchIds: ['sample2'],
    status: 'completed',
  },
  {
    id: 'trip3',
    title: 'Canal Perch Lure Session',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Grand Union Canal',
    targetSpecies: ['Perch', 'Pike'],
    fishingScore: 68,
    notes: '3 hours light lure fishing. Drop-shot rigs worked brilliantly.',
    checklist: [
      { id: 'rod', label: 'Light Spinning Rod', checked: true, icon: 'fishing' },
      { id: 'lures', label: 'Soft Plastics', checked: true, icon: 'creation' },
      { id: 'licence', label: 'Rod Licence', checked: true, icon: 'file-document-outline' },
    ],
    catchIds: ['sample3'],
    status: 'completed',
  },
  {
    id: 'trip4',
    title: 'Weekend Carp Session',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Linear Fisheries, Oxford',
    targetSpecies: ['Carp'],
    fishingScore: 88,
    notes: '48-hour session. Need to pre-bait Friday evening.',
    checklist: [
      { id: 'rod', label: 'Rods x3', checked: false, icon: 'fishing' },
      { id: 'bait', label: '5kg Boilies', checked: false, icon: 'bug' },
      { id: 'bivvy', label: 'Bivvy & Bedchair', checked: false, icon: 'tent' },
      { id: 'licence', label: 'Rod Licence', checked: true, icon: 'file-document-outline' },
    ],
    catchIds: [],
    status: 'upcoming',
  },
];
