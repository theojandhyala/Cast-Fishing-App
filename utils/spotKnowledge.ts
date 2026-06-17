import { WorldSpot } from '../data/worldSpots';

// ── Species knowledge ────────────────────────────────────────────────────────

const SPECIES_TACTICS: Record<string, string> = {
  'carp':             'Carp are best targeted with boilies, pellets or corn on a hair rig. Fish near reed beds and margins at dawn and dusk when they feed most actively. A pre-baited swim over several visits dramatically increases catches.',
  'pike':             'Pike are ambush predators — fish with dead or live bait near underwater features such as sunken trees, weed edges and drop-offs. Deadbait sardine or mackerel excels in cold water; lures work well on mild days when fish are active.',
  'perch':            'Perch hunt in shoals and respond well to small soft-plastic lures, drop-shot rigs and live maggots. Target them around jetties, overhanging trees and any sub-surface structure where small fry gather.',
  'tench':            'Tench feed close to the bottom in weedy margins. Use sweetcorn, red maggot or small boilies on a swimfeeder rig. Dawn and the first two hours of light are prime; they often show by rolling on the surface.',
  'bream':            'Bream shoal over flat, silty areas. A feeder loaded with groundbait and a short tail tipped with corn or worm is the classic approach. Night sessions can produce outstanding catches on lakes.',
  'roach':            'Roach respond to fine presentation — light float tackle with maggots or caster is ideal. Groundbaiting little and often keeps them interested. In rivers, trot a float through deeper glides.',
  'chub':             'Chub are opportunistic and bold. Freelined bread crust or a large lobworm dropped under overhanging trees produces fish. In fast water, a rolling link-ledger with meat or cheese paste excels.',
  'barbel':           'Barbel live in fast, well-oxygenated water. Pellet waggler, feeder fishing with hemp and pellets, or a large boilie on a running lead are proven methods. After dark in summer produces the biggest fish.',
  'dace':             'Dace are fast, shoaling fish. A maggot or caster trotted under a fine float in steady glides is the classic approach. Lightweight tackle and sensitive bites make them a joy for float anglers.',
  'grayling':         'Grayling thrive in cold, clean rivers. Nymphing with small beaded flies or trotting a float with maggots through fast, gravelly runs is most effective. They fight hard in winter and provide outstanding sport when trout are out of season.',
  'brown trout':      'Wild Brown Trout demand stealthy, upstream approach. Dry fly during evening hatches, nymphing mid-water, or small spinners in turbulent water all work. Study the hatch carefully — presenting the right fly size matters enormously.',
  'rainbow trout':    'Rainbows in stillwaters take buzzers, dry flies and lures. Boat fishing gives access to cooler, deeper water in summer. In rivers they take nymphs and streamers readily and fight spectacularly.',
  'salmon':           'Salmon fishing requires patience and timing — fish are most catchable in fresh runs after rain. Fly fishing with Stoat\'s Tail, cascade or Ally\'s Shrimp patterns at the right height and colour is the art form. Pools below waterfalls and rocky ledges concentrate fish.',
  'sea bass':         'Bass are structure-loving predators. Work surface lures around rocky headlands at dusk and dawn, or fish live sand eels and peeler crab in surf and estuaries. Spring bass move inshore to feed on gobies in warm water.',
  'cod':              'Cod feed on the seabed in cold water. A pennel rig baited with fresh black lugworm or cocktail of crab and squid cast uptide on clean ground produces the best results. October to February is peak season in UK waters.',
  'mackerel':         'Mackerel hunt in fast-moving surface shoals. A set of silver feathers retrieved rapidly through the water column will take them in numbers. Fresh mackerel caught this way make outstanding bait for larger predators.',
  'sea bream':        'Sea Bream are hard-fighting inshore species. Target rocky ground with small pieces of squid or ragworm on a running paternoster. Light shore spinning with small metal lures or soft plastics also produces excellent sport.',
  'tigerfish':        'Tigerfish are the African freshwater equivalent of Piranha — explosive surface takes and powerful runs. Fish with wire trace to guard against their razor teeth. Live bait and surface poppers at dawn draw savage strikes.',
  'nile perch':       'Nile Perch grow to over 100kg and fight like a truck. Deep water trolling with large diving plugs or deadbait on the bottom near rocky drop-offs. Boat fishing is essential on large African lakes.',
  'barramundi':       'Barramundi (Barra) are ambush predators in tropical estuaries and rivers. Surface lures fished along mangrove edges at high tide, or suspending lures in tidal rips, produce savage strikes. A moonlit high tide is classic Barra territory.',
  'yellowfin tuna':   'Yellowfin Tuna are pelagic speed machines. Live bait, high-speed trolling or vertical jigging over seamounts and current edges are the key techniques. Watch for surface birds and working bait fish to locate the schools.',
  'giant trevally':   'Giant Trevally (GT) are the apex predator of tropical flats and reefs. Surface poppers at dawn in channels between islands draw explosive strikes. Leaders and hooks must be heavy — a GT will destroy light tackle without hesitation.',
  'mahseer':          'Mahseer are the tigers of Indian rivers. Ragi paste rolled into balls and cast upstream into fast pools is the traditional method. Lures and spinners also work in fast water. Respect their size and fight — a 20kg+ Mahseer on light tackle is a life experience.',
  'taimen':           'Taimen are the world\'s largest salmonid, found in remote Siberian and Mongolian rivers. Large surface flies (deer hair mice patterns) presented at dusk in slow pools trigger violent surface strikes. Extreme remote conditions make logistics a key challenge.',
  'sailfish':         'Sailfish are the ultimate sport fish. Trolling rigged ballyhoo or live bait near current edges and colour-change lines in blue water. When a sail lights up and tail-walks across the surface, nothing else compares.',
  'dorado':           'Dorado (Mahi-Mahi) are among the most spectacular fish on light tackle. Trolling or casting near floating weed lines and debris in blue water. Their iridescent colours and aerial acrobatics make them unforgettable.',
  'wahoo':            'Wahoo are extreme speed — top speeds exceed 80km/h. High-speed trolling with konaheads or large skirted lures near offshore structure. Wire leaders essential due to razor-sharp teeth. Dawn is peak feeding time.',
  'bonefish':         'Bonefish are the ultimate flats challenge — wary, fast and difficult to catch on fly. Casting small shrimp and crab patterns ahead of tailing fish in knee-deep water requires precision and stealth. A running bonefish is pure chaos.',
  'permit':           'Permit are widely considered the hardest fish to catch on fly. Sight-fishing to permit tailing on clear tropical flats with perfectly presented crab flies. Expect many refusals for every take — catching one is a true achievement.',
  'snook':            'Snook are structure-oriented ambush predators in tropical estuaries. Work surface lures along mangrove shorelines at dawn, or present live bait under bridges and dock lights at night for the biggest fish.',
  'tarpon':           'Tarpon are legendary for their explosive jumps and sheer power. Fly fishing to rolling fish in channels, or live bait under bridges and in passes during tidal movements. Strike gently — tarpon have hard mouths requiring a "strip strike" not a rod lift.',
  'pike perch':       'Zander (Pike Perch) prefer deep, slightly turbid water. Drop-shot with small shad lures, or vertical jigging over hard bottom in deeper rivers and reservoirs. Twilight and overcast days produce best sport.',
  'snapper':          'Snapper feed near reef structure in tropical and subtropical seas. Jigs and live bait fished close to the bottom over reef edges and pinnacles are most effective. Night fishing from rocks and jetties with cut bait also works well.',
  'grouper':          'Grouper are powerful, ambush feeders that live in caves and crevices on rocky reef. Heavy tackle and direct pressure essential to stop them reaching their holes. Large live baits or whole squid on heavy bottom rigs.',
  'walleye':          'Walleye are most active at dawn, dusk and after dark, avoiding bright light. Jigging with soft plastics near rocky points and weed edges, or slow trolling with deep-diving crankbaits. Sensitive, light-line presentations in clear water.',
  'bass (largemouth)': 'Largemouth Bass are the quintessential American sport fish. Texas-rigged soft plastics near vegetation, topwater lures at dawn and dusk, and crankbaits over gravel bars all produce. Warm water and structure are key.',
  'striped bass':     'Striped Bass (Stripers) move in huge schools along the coast. Surf casting with metal jigs and live eels at night produces big fish. During spring runs, fly fishing in tidal rivers is exceptional.',
};

// ── Season knowledge ─────────────────────────────────────────────────────────

const SEASON_ADVICE: Record<string, string> = {
  Spring:  'Spring brings rising water temperatures and pre-spawn feeding activity — fish are hungry and aggressive. Shallower areas warm first; concentrate here early in the season.',
  Summer:  'Summer offers the longest days and warm water. Dawn and dusk sessions avoid the heat and coincide with peak feeding activity. Surface presentations often produce spectacular takes.',
  Autumn:  'Autumn is prime time as fish feed hard before winter. Cooling water triggers big fish to pack on weight. Colours in the surrounding landscape add to the experience.',
  Winter:  'Winter demands patience but rewards with the chance of specimen fish. Cold water slows metabolism — fish slowly with small baits and be prepared to wait. Dawn can produce surprisingly well on mild days.',
};

// ── Water type knowledge ─────────────────────────────────────────────────────

const TYPE_KNOWLEDGE: Record<string, string> = {
  river:     'River fishing rewards anglers who read the water. Look for pace changes, eddies behind boulders, deeper pools below rapids, and undercut banks — these are the prime lies. Fish tend to position themselves where food is delivered by the current with minimum energy expenditure.',
  lake:      'Lake fishing requires location skills. Identify underwater features using a plumb line or fish finder — bars, plateaus, drop-offs and weed beds concentrate fish. Wind direction matters enormously; food collects on the windward bank, drawing feeding fish.',
  sea:       'Sea fishing is governed by tides. The last two hours of the flood and first two of the ebb are traditionally the most productive. Study local tide tables, target ground that changes character between tides, and always prioritise safety on exposed coastlines.',
  reservoir: 'Reservoir fishing combines stillwater and river techniques. Fish are distributed according to food, temperature and oxygen levels — a depth-finding sonar is invaluable. Stocked fish often patrol regular circuits; learning the beat is half the battle.',
  ocean:     'Offshore fishing demands sea-reading skills — look for colour changes in the water, floating debris, bird activity and temperature breaks on your chart plotter. These features concentrate baitfish and the larger predators that follow them.',
  estuary:   'Estuaries are transition zones between fresh and saltwater — species from both environments use them. Target the moving tide; slack water is generally unproductive. Channel edges, sand banks and river mouths are key areas.',
};

// ── Difficulty knowledge ─────────────────────────────────────────────────────

const DIFFICULTY_CONTEXT: Record<string, string> = {
  beginner:     'This is an accessible spot for anglers of all abilities. The fish here are feeding reliably and the water conditions are generally forgiving. Focus on the basics — good bait presentation, some groundbait to concentrate fish, and patience.',
  intermediate: 'This spot rewards anglers who understand fish behaviour and can adapt their tactics. Reading the water, matching bait to conditions, and understanding the seasonal patterns here will significantly improve your results.',
  expert:       'This is a demanding, specialist venue. Expect pressured fish, technical presentation requirements and conditions that can change rapidly. Research local knowledge, invest time in reconnaissance, and be prepared to blank in pursuit of something exceptional.',
};

// ── Permit / regulations ─────────────────────────────────────────────────────

const PERMIT_ADVICE: Record<string, string> = {
  UK:         'A valid Rod Licence from the Environment Agency is required for all freshwater fishing in England and Wales. A separate licence is needed for Scotland (via local estates or FishPal). Always carry proof of your licence.',
  Ireland:    'Coarse fishing in the Republic of Ireland is largely free. Game fishing (trout and salmon) requires a state licence from Inland Fisheries Ireland plus a beat permit from the riparian owner.',
  France:     'An AAPPMA (local fishing association) day or season ticket is required, plus the national annual licence. Regulations vary by département — check local rules for species-specific limits.',
  Germany:    'A Fischereischein (state fishing licence, typically annual) is required alongside permission from the water owner. German regulations are strict — study them carefully for the species and location.',
  USA:        'A state fishing licence is required for all freshwater fishing. Licences are sold at sporting goods shops, online via state wildlife agency websites, and Walmart. Season dates and size limits vary by state and species — always check current regulations.',
  Canada:     'A provincial or territorial fishing licence is required. Non-resident licences are available. Conservation limits apply — check the Sport Fish Regulation booklet for the province you are fishing.',
  Australia:  'A Recreational Fishing Licence is required in NSW, Victoria and Tasmania. QLD, WA, SA and NT do not currently require a general licence but have specific regulations — check your state\'s fisheries authority before fishing.',
  'New Zealand': 'A freshwater fishing licence is required, purchased from Fish & Game New Zealand offices and some sports shops. Licences are region-specific — ensure yours covers the water you intend to fish.',
  default:    'Check local regulations before fishing. Permits, size limits and closed seasons vary significantly between regions and species. Ignoring these rules can result in significant fines and damage to fish populations.',
};

// ── Build rich knowledge for any spot ───────────────────────────────────────

export interface SpotKnowledge {
  extendedDescription: string;
  tactics: string;
  waterReading: string;
  seasonalAdvice: string;
  regulatoryNote: string;
  difficultyNote: string;
  quickFacts: { icon: string; label: string; value: string }[];
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getPrimarySpeciesTactics(species: string[]): string {
  for (const sp of species) {
    const lower = sp.toLowerCase();
    for (const [key, tactic] of Object.entries(SPECIES_TACTICS)) {
      if (lower.includes(key)) return tactic;
    }
  }
  return 'Match your bait presentation to the prevailing conditions. Light lines and natural baits generally outperform heavier rigs in clear water. Study the swim for signs of fish activity before casting.';
}

function getSeasonAdvice(seasons: string[]): string {
  const parts = seasons.map(s => {
    const advice = SEASON_ADVICE[s];
    return advice ? `${s}: ${advice}` : null;
  }).filter(Boolean);
  return parts.length ? parts.join(' ') : 'This location fishes well year-round. Adapt your tactics to water temperature and conditions.';
}

function getPermitNote(spot: WorldSpot): string {
  if (!spot.permitRequired) {
    return 'No permit is required to fish this location, though local bylaws may still apply. Always leave the bank cleaner than you found it.';
  }
  const note = PERMIT_ADVICE[spot.country] || PERMIT_ADVICE['default'];
  return `A permit is required to fish here. ${note}`;
}

export function getSpotKnowledge(spot: WorldSpot): SpotKnowledge {
  const primaryTactics = getPrimarySpeciesTactics(spot.species);
  const waterNote = TYPE_KNOWLEDGE[spot.type] || TYPE_KNOWLEDGE.river;
  const seasonNote = getSeasonAdvice(spot.bestSeason);
  const permitNote = getPermitNote(spot);
  const difficultyNote = DIFFICULTY_CONTEXT[spot.difficulty] || DIFFICULTY_CONTEXT.intermediate;

  const extendedDescription = spot.description.endsWith('.')
    ? spot.description
    : spot.description + '.';

  const quickFacts: { icon: string; label: string; value: string }[] = [
    { icon: 'fish', label: 'Target species', value: spot.species.slice(0, 3).join(', ') },
    { icon: 'hook', label: 'Best bait', value: spot.bestBait.slice(0, 2).join(', ') },
    { icon: 'calendar', label: 'Prime season', value: spot.bestSeason.join(', ') },
    { icon: 'signal', label: 'Difficulty', value: capitalise(spot.difficulty) },
    { icon: 'star', label: 'Rating', value: `${spot.rating} / 5.0` },
    { icon: 'map-marker', label: 'Water type', value: capitalise(spot.type) },
  ];

  return {
    extendedDescription,
    tactics: primaryTactics,
    waterReading: waterNote,
    seasonalAdvice: seasonNote,
    regulatoryNote: permitNote,
    difficultyNote,
    quickFacts,
  };
}

// Short blurb for map cards / list previews
export function getSpotBlurb(spot: WorldSpot): string {
  const speciesStr = spot.species.slice(0, 2).join(' & ');
  const seasonStr = spot.bestSeason[0] || 'year-round';
  const typeStr = capitalise(spot.type);
  return `${typeStr} · ${speciesStr} · Best in ${seasonStr}`;
}
