export const tips = [
  {
    id: '1',
    tip: 'Always wet your knots before tightening — friction from dry line reduces knot strength by up to 30%.',
    category: 'Technique',
  },
  {
    id: '2',
    tip: 'Barometric pressure dropping usually signals feeding activity for carp and bream. Get your baits in early!',
    category: 'Conditions',
  },
  {
    id: '3',
    tip: 'Match the colour of your hookbait to your groundbait for a natural presentation that tricks wary fish.',
    category: 'Bait',
  },
  {
    id: '4',
    tip: 'The first and last hours of daylight are typically the most productive times on any water. Plan your session around them.',
    category: 'Timing',
  },
  {
    id: '5',
    tip: 'Use a lighter, longer hooklink in clear water conditions. Fish are more likely to pick up bait when they cannot feel resistance.',
    category: 'Rig',
  },
  {
    id: '6',
    tip: 'After catching a fish, rest your swim for 15–20 minutes before casting again. Splashing and noise spooks other fish.',
    category: 'Technique',
  },
  {
    id: '7',
    tip: 'A south-west wind in summer often brings the best conditions for river barbel. Fish rises after overnight rain.',
    category: 'Conditions',
  },
  {
    id: '8',
    tip: 'Keep your hooks sharp — drag the point across your thumbnail. If it slides, it needs replacing or sharpening.',
    category: 'Gear',
  },
  {
    id: '9',
    tip: 'Hemp seed is a fantastic groundbait additive for roach, chub, and barbel. Introduce it little and often.',
    category: 'Bait',
  },
  {
    id: '10',
    tip: 'When sea bass fishing, focus on the white water behind waves — bass hunt disorientated baitfish in the surf.',
    category: 'Location',
  },
  {
    id: '11',
    tip: 'Polarised sunglasses are an essential piece of kit — they allow you to see fish in the water and plan your approach.',
    category: 'Gear',
  },
  {
    id: '12',
    tip: 'Pike are cold-blooded — they feed best when water temperatures are between 8–12°C. Target them in autumn and winter.',
    category: 'Species',
  },
  {
    id: '13',
    tip: 'Use PVA bags filled with pellets and groundbait around your hookbait to create a small bait pile that attracts fish.',
    category: 'Rig',
  },
  {
    id: '14',
    tip: 'A full moon can disrupt night fishing — fish feed throughout the night and may not be hungry at first light.',
    category: 'Conditions',
  },
  {
    id: '15',
    tip: 'Always keep a landing net ready before your bite alarm goes off. A lost fish at the net is heartbreaking.',
    category: 'Technique',
  },
  {
    id: '16',
    tip: 'Perch love structure. Fish drop shots vertically alongside bridge supports, pontoons, and submerged trees.',
    category: 'Location',
  },
  {
    id: '17',
    tip: 'In coloured or flood water, use brighter and larger baits to help fish locate your hookbait.',
    category: 'Bait',
  },
  {
    id: '18',
    tip: 'Tench produce distinctive tiny bubbles when feeding. If you see these fizzing up, cast gently to the area immediately.',
    category: 'Species',
  },
  {
    id: '19',
    tip: 'Always carry a hook disgorger or forceps. Deep-hooked fish need proper unhooking tools to avoid injury.',
    category: 'Gear',
  },
  {
    id: '20',
    tip: 'Low pressure after a storm can switch feeding on across all species. Be on the water within 24 hours of heavy rain.',
    category: 'Conditions',
  },
];

export function getTipOfDay(): typeof tips[0] {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return tips[dayOfYear % tips.length];
}
