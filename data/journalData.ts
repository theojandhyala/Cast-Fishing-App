export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  body: string;
  mood: string;
  spot?: string;
  species?: string[];
  tags?: string[];
}

export const SAMPLE_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    date: '2026-05-28',
    title: 'Dawn session at Redmire',
    body: 'Arrived at 4:30am just as the mist was lifting off the water. Set up two rods on the shallows near the reed beds — one with a bottom bait and one with a pop-up. First take came at 7:15am, a beautiful common of around 18lb. The scales went to 17lb 14oz. Spent the rest of the morning watching the water. Absolute magic.',
    mood: '😄',
    spot: 'Redmire Pool',
    species: ['Common Carp'],
    tags: ['dawn session', 'carp', 'pop-up', 'personal'],
  },
  {
    id: '2',
    date: '2026-05-14',
    title: 'River pike — cold morning',
    body: 'Temperature was only 4°C when I arrived at the river. Fished three deadbait rods on the inside of the big bend where I\'ve had success before. Two runs before midday — first was a dropped run, second I connected with a feisty fish of around 14lb. Really had to work for it. The cold snap definitely had them feeding in the deep slack water.',
    mood: '🙂',
    spot: 'River Severn',
    species: ['Pike'],
    tags: ['pike', 'deadbait', 'cold', 'river'],
  },
  {
    id: '3',
    date: '2026-04-30',
    title: 'Blank but beautiful',
    body: 'Not a single run today but honestly one of my favourite sessions this year. The sunset was incredible — reds and oranges across the whole sky. Had a swan and three cygnets swim between my rods at dusk. Saw a kingfisher on the far bank twice. Sometimes it really is just about being out there. Will be back next week with a different approach.',
    mood: '😌',
    spot: 'Linford Lakes',
    species: [],
    tags: ['blank', 'nature', 'peaceful', 'evening'],
  },
  {
    id: '4',
    date: '2026-04-17',
    title: 'PB Tench - 6lb 3oz!',
    body: 'Finally broke my tench PB that has stood since 2021! Fishing the gravel bar with sweetcorn and a method feeder. The bite came late morning — long twitches on the float before it slid away. Absolutely massive female fish, deep green flanks and bright red eye. Weighed her at 6lb 3oz, a full pound over my previous best. Kept her in the net for photos then watched her swim off strongly.',
    mood: '🤩',
    spot: 'Farlows Lake',
    species: ['Tench'],
    tags: ['PB', 'tench', 'method feeder', 'sweetcorn'],
  },
  {
    id: '5',
    date: '2026-04-05',
    title: 'Club match - 3rd place',
    body: 'Fished the Sunday match on Peg 14 by the aerator. Struggled with bream early but switched to maggot feeder at 12m and they came thick and fast. Final weight was 28lb 6oz — enough for third place and a £15 prize. Should have come second but missed a few bites in the last hour. Next match is the 19th, will fish the same method but with groundbait as well.',
    mood: '😄',
    spot: 'Holme Pierrepont',
    species: ['Bream', 'Roach', 'Perch'],
    tags: ['match', 'club', 'competition', 'feeder'],
  },
];
