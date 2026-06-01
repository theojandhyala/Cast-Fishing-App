export const regulations = {
  licenceInfo: {
    title: 'EA Rod Licence',
    description: 'Anyone aged 13 or over must have a valid Environment Agency rod licence to fish for salmon, trout, freshwater fish, smelt or eel in England and Wales.',
    cost: {
      annual: { adult: '£35.00', concession: '£23.33', junior: 'Free (under 16)' },
      day: { adult: '£6.00', concession: '£4.00' },
    },
    applyUrl: 'https://www.gov.uk/get-a-fishing-licence',
    note: 'You also need permission from the landowner or a club membership to fish most waters.',
  },
  closedSeasons: [
    {
      species: 'Coarse Fish (Rivers)',
      closedPeriod: '15 March – 15 June',
      note: 'Applies to rivers, streams, drains and some canals. Still waters may differ.',
    },
    {
      species: 'Salmon & Sea Trout',
      closedPeriod: 'Varies by river',
      note: 'Each river has its own season set by the EA. Check before fishing.',
    },
    {
      species: 'Rainbow Trout',
      closedPeriod: 'No closed season on still waters',
      note: 'Managed fisheries may impose their own seasons.',
    },
  ],
  sizeLimits: [
    { species: 'Sea Bass', minimumCm: 42, note: 'Minimum size strictly enforced. Maximum 2 bass per day.' },
    { species: 'Atlantic Salmon', minimumCm: 45, note: 'Catch and release strongly encouraged. Check river-specific rules.' },
    { species: 'Barbel', minimumCm: 30, note: 'Always return barbel carefully — handle minimally and revive fully.' },
    { species: 'Tench', minimumCm: 25, note: 'No official minimum but always use good conservation practice.' },
    { species: 'Common Carp', minimumCm: 38, note: 'Most carp fisheries require unhooking mats and weighing slings.' },
    { species: 'Pike', minimumCm: 45, note: 'Always use wire traces and have forceps for unhooking.' },
  ],
  catchAndRelease: {
    recommended: ['Salmon', 'Sea Bass', 'Barbel', 'Pike', 'Large Carp'],
    note: 'Catch and release is best practice for most species. Wet your hands before handling, minimise air time, and revive fish fully before release.',
  },
};
