export interface RegionalSpecies {
  name: string;
  reason: string;
  rarity: 'common' | 'uncommon' | 'rare';
}

export interface RegionalBait {
  name: string;
  tip: string;
}

export interface RegionalFishingData {
  region: string;
  topSpecies: RegionalSpecies[];
  topBaits: RegionalBait[];
  legalNotes: string;
  fishingScore: number;
  scoreReason: string;
  tipOfDay: string;
  waterTemp: string;
  regulations: string;
}

// month = 1-12
type MonthData = {
  topSpecies: RegionalSpecies[];
  topBaits: RegionalBait[];
  fishingScore: number;
  scoreReason: string;
  tipOfDay: string;
  waterTemp: string;
};

const UK_MONTHS: MonthData[] = [
  // Jan
  {
    topSpecies: [
      { name: 'Pike', reason: 'Most active in cold water — metabolically aggressive, hunt near snags', rarity: 'uncommon' },
      { name: 'Perch', reason: 'Pack-hunting under ice edges and in deep holes, respond well to lures', rarity: 'common' },
      { name: 'Grayling', reason: 'Prime season — prefer fast, clear water; feed aggressively in cold', rarity: 'rare' },
      { name: 'Chub', reason: 'Hugging deep bends and willows; cheese paste in mild spells', rarity: 'common' },
      { name: 'Zander', reason: 'Deep lake margins at dusk — slow retrieve with rubber shad', rarity: 'uncommon' },
    ],
    topBaits: [
      { name: 'Deadbait (Smelt/Roach)', tip: 'Pike are hunting frozen prey. Wobbled or static deadbait on a wire trace near weed beds.' },
      { name: 'Rubber Shad Lures', tip: 'Slow, deep retrieve. Cold water = slow metabolism. Pause 3 seconds between pulls.' },
      { name: 'Cheese Paste', tip: 'Chub love strong-smelling baits in winter. Mold around a size 6 hook on a link leger.' },
    ],
    fishingScore: 4,
    scoreReason: 'Cold water slows most species but pike and perch are at peak. Dawn sessions only.',
    tipOfDay: 'In January, focus within 2 hours of first light. Fish metabolism drops sharply — miss that window and you miss the feeding spell.',
    waterTemp: '4–7°C',
  },
  // Feb
  {
    topSpecies: [
      { name: 'Pike', reason: 'Pre-spawn feeding binge — best month of the year for a trophy fish', rarity: 'uncommon' },
      { name: 'Perch', reason: 'Shoal-hunting smaller prey, drop-shotting outperforms all other methods', rarity: 'common' },
      { name: 'Grayling', reason: 'Fly fishing with nymph patterns produces big fish before March spawning', rarity: 'rare' },
      { name: 'Chub', reason: 'Mild days bring them to shallow runs; trotted bread flake deadly', rarity: 'common' },
      { name: 'Barbel', reason: 'Mild spells on larger rivers — hemp and pellet work near crease', rarity: 'uncommon' },
    ],
    topBaits: [
      { name: 'Live/Deadbait', tip: 'February pike are pre-spawn gluttons. Use a large roach or smelt deadbait, static on the bottom near deep holes.' },
      { name: 'Drop-shot Worm', tip: 'Perch cannot resist a wriggling worm near bottom. Slow the retrieve to a crawl.' },
      { name: 'Bread Flake', tip: 'Pinch a 1p coin piece of white bread around a size 10. Trot down a slow swim for chub.' },
    ],
    fishingScore: 4,
    scoreReason: 'Pike hit their peak but most coarse species still sluggish. River levels often high.',
    tipOfDay: 'Check the river gauge before going — February rivers often run 0.5m above normal after rain. Find slow eddies behind large obstacles.',
    waterTemp: '4–8°C',
  },
  // Mar
  {
    topSpecies: [
      { name: 'Trout', reason: 'River season opens 15 March — hungry fish after winter rest', rarity: 'uncommon' },
      { name: 'Perch', reason: 'Spawning complete by mid-March; immediately aggressive again', rarity: 'common' },
      { name: 'Chub', reason: 'Very active in March spates on rising river', rarity: 'common' },
      { name: 'Dace', reason: 'Quick-biting shoal fish excellent sport in clear, fast water', rarity: 'common' },
      { name: 'Barbel', reason: 'Waking from winter torpor — feed heavily in warming shallows', rarity: 'uncommon' },
    ],
    topBaits: [
      { name: 'Worm', tip: 'March rivers run red — a lobworm freelined under a trotting float picks up almost everything.' },
      { name: 'Nymph (Fly)', tip: 'Gold-headed nymph patterns fished slow and deep take the first trout of the season.' },
      { name: 'Hemp & Caster', tip: 'Start loosefeed pre-baiting a swim 30 mins before you cast for bream and roach.' },
    ],
    fishingScore: 5,
    scoreReason: 'Season starts opening up. Trout waters fresh, coarse fish waking up. Best of the cold-water species still good.',
    tipOfDay: 'River trout are lean after winter. They feed close to cover. Cast your nymph upstream and let it drift naturally into the shadow of an overhanging tree.',
    waterTemp: '7–10°C',
  },
  // Apr
  {
    topSpecies: [
      { name: 'Trout', reason: 'Dry-fly season begins as hatches increase with warming water', rarity: 'uncommon' },
      { name: 'Perch', reason: 'Fully recovered from spawn, aggressively striking lures in clear water', rarity: 'common' },
      { name: 'Barbel', reason: 'Pre-spawn feeding heavily in daytime in April sun', rarity: 'uncommon' },
      { name: 'Carp', reason: 'Emerging from winter lethargy, cruise shallow margins from late April', rarity: 'common' },
      { name: 'Tench', reason: 'Season gets going April — red-tipped float at dawn in lily pads', rarity: 'uncommon' },
    ],
    topBaits: [
      { name: 'Surface Lures / Dry Fly', tip: 'Watch for ring rises on still evenings — trout sipping emerging olives. Match the hatch.' },
      { name: 'Maggot', tip: 'April perch and roach love a double maggot on a size 16. Add a tiny controller float for slow sinking.' },
      { name: 'Boilies (12mm)', tip: 'Carp are investigating baits again. A single bright pop-up over scattered bait at dawn.' },
    ],
    fishingScore: 7,
    scoreReason: 'Spring properly here. Water warming fast, fish moving into feeding mode after winter.',
    tipOfDay: 'In April, the first warm afternoon after cold nights brings carp to sun-warmed shallow margins. Sight-fish with polaroids rather than casting blind.',
    waterTemp: '9–13°C',
  },
  // May
  {
    topSpecies: [
      { name: 'Carp', reason: 'Pre-spawn carp in shallow margins through May — surface and zig rigs deadly', rarity: 'common' },
      { name: 'Tench', reason: 'Dawn tench sessions at their absolute prime — bubbling by reed beds', rarity: 'uncommon' },
      { name: 'Bream', reason: 'Rolling on the surface at dusk betrays big May shoals', rarity: 'common' },
      { name: 'Barbel', reason: 'Late May barbel move up to fast gravels before spawning', rarity: 'uncommon' },
      { name: 'Trout', reason: 'Hatches of mayfly — once-a-year feast, fish rise freely all day', rarity: 'uncommon' },
    ],
    topBaits: [
      { name: 'Bread Crust (Surface)', tip: 'Floating crust on a size 4 hook takes big May carp from the surface. Wait for a confident take.' },
      { name: 'Sweetcorn', tip: 'Single grain of corn on a size 10 hook is unbeatable for tench at first light.' },
      { name: 'Mayfly Imitation', tip: 'The Mayfly hatch lasts only 2-3 weeks. Fish a spent spinner in the evening film for wild brownies.' },
    ],
    fishingScore: 8,
    scoreReason: 'Tench and carp prime, mayfly hatch for trout. One of the best months of the year.',
    tipOfDay: 'Be at the water\'s edge at first light in May. Tench bubble like jacuzzis around dawn — get your float over the bubbles before the sun rises too high.',
    waterTemp: '12–16°C',
  },
  // Jun
  {
    topSpecies: [
      { name: 'Carp', reason: 'Coarse season opens 16 June — everyone\'s after carp and they\'re hammering surface baits', rarity: 'common' },
      { name: 'Tench', reason: 'June tench sessions at dawn are legendary — expect big fish', rarity: 'uncommon' },
      { name: 'Barbel', reason: 'Post-spawn barbel are ravenous — hemp and pellet feeders produce multiple runs at dusk', rarity: 'uncommon' },
      { name: 'Bream', reason: 'Night sessions producing huge bags from June onwards', rarity: 'common' },
      { name: 'Chub', reason: 'Free-lined bread on rivers at night, under overhanging trees', rarity: 'common' },
    ],
    topBaits: [
      { name: 'Boilies + PVA bags', tip: 'Coarse season just opened. A 20mm boilie over a PVA mesh bag of pellets and hemp — classic opening night rig.' },
      { name: 'Hemp + Pellet', tip: 'Barbel go crazy for hemp. Loose-feed a river swim for 30 mins, then present pellet on a hair rig.' },
      { name: 'Dog Biscuits (Surface)', tip: 'June carp cruise on the surface. Superglue a dog biscuit to a size 6 and drift it among the free offerings.' },
    ],
    fishingScore: 9,
    scoreReason: 'Coarse season opener. Warm water, active fish, long evenings. Peak UK fishing.',
    tipOfDay: 'The opening night of the coarse season (16 June) is the best night of the year. Set up in daylight, cast out at dusk, and don\'t sleep.',
    waterTemp: '15–19°C',
  },
  // Jul
  {
    topSpecies: [
      { name: 'Carp', reason: 'Surface fishing at its best — zig rigs at varying depths through midday', rarity: 'common' },
      { name: 'Barbel', reason: 'Night sessions on barbel as they avoid daytime heat', rarity: 'uncommon' },
      { name: 'Perch', reason: 'Lure fishing at dawn before heat builds — bass-style approach', rarity: 'common' },
      { name: 'Sea Bass', reason: 'Southern/Western coasts prime — surface poppers at dawn/dusk', rarity: 'uncommon' },
      { name: 'Mackerel', reason: 'Shoals arrive inshore in July — fast, addictive sport from pier or rock', rarity: 'common' },
    ],
    topBaits: [
      { name: 'Zig Rigs (Mid-water)', tip: 'July carp suspend in mid-water in the heat. Zig rigs at varying depths from 2ft to 8ft. Yellow foam or cork ball.' },
      { name: 'Surface Popper', tip: 'Bass and mackerel hit surface lures hard at first light. Walk-the-dog retrieve along rock edges.' },
      { name: 'Pellet Wag', tip: 'Waggler fishing with expander pellets in match fishing style produces bream and carp through the day.' },
    ],
    fishingScore: 9,
    scoreReason: 'Hot and bright but dawn/dusk sessions exceptional. Sea fishing very good too.',
    tipOfDay: 'In July heat, fish the first and last hour of daylight. Most species go deep and inactive through midday. Don\'t bother setting up at noon.',
    waterTemp: '18–22°C',
  },
  // Aug
  {
    topSpecies: [
      { name: 'Carp', reason: 'Spodding boilies at range over silt — night sessions avoiding algae blooms', rarity: 'common' },
      { name: 'Tench', reason: 'Still producing well in early morning before water warms', rarity: 'uncommon' },
      { name: 'Sea Bass', reason: 'Peak of sea bass season along South and West coast', rarity: 'uncommon' },
      { name: 'Mackerel', reason: 'Still abundant from piers and rocks; great on feathers', rarity: 'common' },
      { name: 'Flounder', reason: 'Estuary flounder active on ragworm at low water', rarity: 'common' },
    ],
    topBaits: [
      { name: 'Boilies (Fruity flavours)', tip: 'August carp love fruity or citrus baits. Spod a mix of boilies, maize and pellet to a clear spot at range.' },
      { name: 'Ragworm', tip: 'For estuary flounder, use fresh ragworm on a size 2 baited running leger near the channel edge.' },
      { name: 'Sand Eels (Artificial)', tip: 'Bass love paddle-tail sand eel lures worked through tide race at dawn.' },
    ],
    fishingScore: 8,
    scoreReason: 'Peak sea fishing, good carp sessions at dawn. Freshwater can be challenging mid-day in heat.',
    tipOfDay: 'Algae blooms in August can push fish out of their normal patrol routes. Look for areas with clear water flow — inflow pipes, springs — fish congregate there.',
    waterTemp: '18–23°C',
  },
  // Sep
  {
    topSpecies: [
      { name: 'Carp', reason: 'Feeding heavily to build winter reserves — all-day sessions now work again', rarity: 'common' },
      { name: 'Barbel', reason: 'Best month for barbel — post-summer recovery, pre-spawning feeding frenzy', rarity: 'uncommon' },
      { name: 'Bream', reason: 'Autumn bream move into deep margins feeding heavily before winter', rarity: 'common' },
      { name: 'Pike', reason: 'Season opens Sept on some waters — early pike hungry and willing', rarity: 'uncommon' },
      { name: 'Perch', reason: 'Big perch back on form — 2lb+ fish hitting lures and lobworms', rarity: 'common' },
    ],
    topBaits: [
      { name: 'Meat (Luncheon Meat)', tip: 'September barbel adore 1cm cubes of luncheon meat. Hair rig it like a boilie, fish near a weir or fast run.' },
      { name: 'Boilies + Groundbait', tip: 'Carp are feeding 24hrs now. A solid PVA bag over a baited spot produces all day.' },
      { name: 'Lobworm', tip: 'A big lobworm on a size 4 hook, freelined into a deep pool at dusk, takes the best September perch.' },
    ],
    fishingScore: 8,
    scoreReason: 'Superb all-round month. Fish feeding hard before winter. Weather usually pleasant.',
    tipOfDay: 'September evenings often produce the best fishing of the year. Temperature drops signal fish to feed aggressively. Stay late.',
    waterTemp: '15–18°C',
  },
  // Oct
  {
    topSpecies: [
      { name: 'Barbel', reason: 'October barbel reach peak weight — massive fish possible on night sessions', rarity: 'uncommon' },
      { name: 'Pike', reason: 'Pike seasons open on most waters — hungry post-summer, big deadbaits', rarity: 'uncommon' },
      { name: 'Carp', reason: 'Last month before winter slow-down — all-day feeding on bottom baits', rarity: 'common' },
      { name: 'Perch', reason: 'Best perch fishing of the year — cold nights push them to hunt hard', rarity: 'common' },
      { name: 'Chub', reason: 'Autumn chub taking big baits — slug, cheese or large lobworm', rarity: 'common' },
    ],
    topBaits: [
      { name: 'Deadbait (Mackerel)', tip: 'Half a mackerel on a size 6 treble, bottom fished near reeds, accounts for October pike.' },
      { name: 'Slug (Natural)', tip: 'Chub in autumn take natural slugs freelined under overhanging banks. Walk-along river style.' },
      { name: 'Boilies (Fishmeal)', tip: 'Switch to fishmeal boilies in October as water cools — they digest faster in cold water.' },
    ],
    fishingScore: 7,
    scoreReason: 'Barbel and pike seasons in full swing. Carp slowing but still catchable. Great autumn fishing.',
    tipOfDay: 'A frost the night before makes October barbel come out. The brief temperature rise after first light triggers a 2-hour window of frantic feeding.',
    waterTemp: '11–14°C',
  },
  // Nov
  {
    topSpecies: [
      { name: 'Pike', reason: 'Pre-spawn pike at their most aggressive — trophy fish possible all day', rarity: 'uncommon' },
      { name: 'Perch', reason: 'Pack hunting in November — drop-shot and blade baits deadly', rarity: 'common' },
      { name: 'Grayling', reason: 'Best grayling month — clear cold rivers, responsive to nymph and trotted caster', rarity: 'rare' },
      { name: 'Chub', reason: 'Cold chub prefer large baits — cheese, meat, big lobworm in slow deep bends', rarity: 'common' },
      { name: 'Barbel', reason: 'Mild nights produce late season barbel on rivers that haven\'t flooded', rarity: 'uncommon' },
    ],
    topBaits: [
      { name: 'Big Deadbait', tip: 'November pike need large meals — a whole smelt or half herring on a float, drifted across a reservoir.' },
      { name: 'Caster', tip: 'Trotted caster under a stick float produces grayling in fast gravelly runs.' },
      { name: 'Luncheon Meat', tip: 'Large cubes of meat on a size 2 hook, fished in the crease of a river during mild spells for late barbel.' },
    ],
    fishingScore: 6,
    scoreReason: 'Pike and grayling excel. Other species hit-and-miss. Good for dedicated species hunting.',
    tipOfDay: 'November pike don\'t move far — they ambush from cover. Cast deadbait to within 2 feet of reed beds, fallen trees and lily pad stalks.',
    waterTemp: '7–10°C',
  },
  // Dec
  {
    topSpecies: [
      { name: 'Pike', reason: 'Excellent deadbait fishing in frost — big fish in their winter holding spots', rarity: 'uncommon' },
      { name: 'Grayling', reason: 'December grayling are the prize — fly or stick float in fast rivers', rarity: 'rare' },
      { name: 'Perch', reason: 'Reliable winter species — deep holes, blade lures and drop-shot', rarity: 'common' },
      { name: 'Chub', reason: 'Only species reliably feeding in the coldest spells', rarity: 'common' },
      { name: 'Cod (Sea)', reason: 'December cod fishing off Yorkshire and Kent coast peaks — shore casting with lugworm', rarity: 'uncommon' },
    ],
    topBaits: [
      { name: 'Lugworm', tip: 'Shore cod respond to a big fresh lug worm on a pulley rig. Fish 2-3 hours either side of high water.' },
      { name: 'Deadbait (Smelt)', tip: 'Smelt has the strongest scent of all deadbaits — critical in cold water where pike barely move.' },
      { name: 'Bread Flake (Chub)', tip: 'Pinched bread flake on a size 8, trundled along a slow winter swim, is the most reliable December method.' },
    ],
    fishingScore: 4,
    scoreReason: 'Cold and challenging. Pike, grayling and sea cod are the targets. Dress warm.',
    tipOfDay: 'In December, find the deep water. Every cold-water species holds in the deepest accessible point of a lake or river bend. A depth-finder or lead-dropping exercise is worth the time.',
    waterTemp: '4–7°C',
  },
];

const SCANDINAVIA_MONTHS: MonthData[] = [
  // Jan-Mar (ice fishing)
  ...[0, 1, 2].map((m) => ({
    topSpecies: [
      { name: 'Perch', reason: 'Ice fishing classic — jigging a tiny spoon through the ice produces perch all day', rarity: 'common' as const },
      { name: 'Pike', reason: 'Static deadbait or tip-up rigs under the ice for big predators', rarity: 'uncommon' as const },
      { name: 'Vendace', reason: 'Nordic delicacy, caught through ice with tiny jigs and maggots', rarity: 'uncommon' as const },
      { name: 'Burbot', reason: 'Night fishing through ice — elusive but delicious Scandinavian freshwater cod', rarity: 'rare' as const },
      { name: 'Arctic Char', reason: 'Deep lake ice holes — slow jig 8–15m depth in clear mountain lakes', rarity: 'rare' as const },
    ],
    topBaits: [
      { name: 'Small Jig Spoon', tip: 'A 3–5cm fluttering spoon under the ice triggers perch. Jig aggressively then pause.' },
      { name: 'Live Smelt', tip: 'Set a live smelt under a tip-up at 3–5m depth for pike.' },
      { name: 'Tiny Maggot', tip: 'Vendace and roach respond to tiny maggot rigs with a barely-moving presentation.' },
    ],
    fishingScore: m === 1 ? 7 : 6,
    scoreReason: 'Ice fishing season. Excellent for perch and pike if ice is safe (min 10cm for walking).',
    tipOfDay: 'Always test ice thickness before venturing out. Drill test holes 10m apart as you walk. Green ice is stronger than white ice.',
    waterTemp: '-1–2°C (under ice)',
  })),
  // Apr
  {
    topSpecies: [
      { name: 'Pike', reason: 'Ice-out predators are ravenous — best time for a trophy Scandinavian pike', rarity: 'uncommon' },
      { name: 'Perch', reason: 'Spawning in shallows through April, then aggressively feeding', rarity: 'common' },
      { name: 'Trout', reason: 'River trout season opens — hungry after long winter', rarity: 'uncommon' },
      { name: 'Arctic Char', reason: 'Ice-out char move to surface in newly-open mountain lakes', rarity: 'rare' },
      { name: 'Grayling', reason: 'River grayling responding to first hatches of the year', rarity: 'rare' },
    ],
    topBaits: [
      { name: 'Soft Plastic (Shad)', tip: 'Ice-out pike respond to large rubber shads worked just below the surface in cold clear water.' },
      { name: 'Spinner', tip: 'A gold or silver spinner on ultra-light gear produces perch from shoreline areas.' },
      { name: 'Nymph (Fly)', tip: 'First hatch of the year on Scandinavian rivers. Pheasant tail nymph size 14.' },
    ],
    fishingScore: 7,
    scoreReason: 'Ice-out fishing. Predators aggressive and hungry. Trout rivers opening up.',
    tipOfDay: 'Work lures very slowly in April — water is still 4°C and fish metabolism is low. A bait that looks barely alive is more attractive than a fast retrieve.',
    waterTemp: '2–7°C',
  },
  // May
  {
    topSpecies: [
      { name: 'Pike', reason: 'Post-spawn pike feeding heavily in warmer margins', rarity: 'uncommon' },
      { name: 'Perch', reason: 'Perch chasing fry in the shallows — surface lures effective', rarity: 'common' },
      { name: 'Brown Trout', reason: 'Active in rivers as hatches increase throughout May', rarity: 'uncommon' },
      { name: 'Zander', reason: 'Dawn and dusk zander on jigs in clear Scandinavian lakes', rarity: 'uncommon' },
      { name: 'Salmon (early)', reason: 'First salmon enter rivers from late May — grilse on smaller rivers', rarity: 'rare' },
    ],
    topBaits: [
      { name: 'Surface Plug', tip: 'Pike and perch explode on surface lures in May. Walk-the-dog on open water margins at dawn.' },
      { name: 'Dry Fly (Blue-winged Olive)', tip: 'Trout rise freely in May evenings to olive patterns. Fish upstream with a fine leader.' },
      { name: 'Rubber Worm', tip: 'Drop-shot a 4-inch rubber worm near weed edges for big perch.' },
    ],
    fishingScore: 8,
    scoreReason: 'Water warming fast. Excellent lure fishing. Salmon arriving. Long daylight hours.',
    tipOfDay: 'Scandinavian evenings stay light until midnight in May. Fish until 22:00 — dusk is the prime feeding time for virtually all species.',
    waterTemp: '8–13°C',
  },
  // Jun-Aug (salmon peak)
  ...[5, 6, 7].map((m) => ({
    topSpecies: [
      { name: 'Atlantic Salmon', reason: m === 6 ? 'Peak runs — large fresh fish entering rivers, aggressive to spinners and flies' : 'Good runs continuing — aim for pools below rapids', rarity: 'rare' as const },
      { name: 'Sea Trout', reason: 'Night fishing for sea trout with wet fly on salmon rivers', rarity: 'rare' as const },
      { name: 'Pike', reason: 'Summer pike lure fishing in weed channels and reed beds', rarity: 'uncommon' as const },
      { name: 'Perch', reason: 'Excellent in clear Scandinavian lakes with lure fishing', rarity: 'common' as const },
      { name: 'Zander', reason: 'Night jigging for zander producing well', rarity: 'uncommon' as const },
    ],
    topBaits: [
      { name: 'Salmon Fly (Tube)', tip: 'A black-and-orange tube fly swung across a salmon pool on a sinking line. Classic and deadly.' },
      { name: 'Toby Spinner', tip: 'The Toby spinner is a Scandinavian legend for salmon. Gold in clear water, copper in peaty spate.' },
      { name: 'Jig (Zander)', tip: 'White or chartreuse jighead with paddle-tail at dawn produces summer zander from 5–8m depth.' },
    ],
    fishingScore: m === 6 ? 9 : 8,
    scoreReason: m === 6 ? 'Peak salmon month. Midnight sun. Extraordinary fishing.' : 'Excellent salmon and sea trout. Long days for lure fishing.',
    tipOfDay: m === 6 ? 'Fish salmon pools during the changing light: midnight sun creates a brief dusk-like window around 23:00 when fish move and take flies.' : 'Sea trout run at night — fish from dusk to dawn with a large wet fly cast across and down.',
    waterTemp: '14–19°C',
  })),
  // Sep
  {
    topSpecies: [
      { name: 'Salmon', reason: 'Late-run heavy salmon in larger rivers — coloured fish but still take flies', rarity: 'rare' },
      { name: 'Sea Trout', reason: 'Last chance for sea trout before they drop back to sea', rarity: 'rare' },
      { name: 'Pike', reason: 'September lure fishing before autumn chill — excellent sport', rarity: 'uncommon' },
      { name: 'Perch', reason: 'Very active as water cools — autumn feeding mode begins', rarity: 'common' },
      { name: 'Arctic Char', reason: 'Mountain lake char at their most accessible in September before cooling', rarity: 'rare' },
    ],
    topBaits: [
      { name: 'Waddington Shank (Salmon)', tip: 'Late-season salmon take large dark flies — a black-and-red Waddington on a full sinking line.' },
      { name: 'Large Rubber Shad', tip: 'September pike are building weight for winter. Large 15cm+ shad lures work well.' },
      { name: 'Spinner (Gold)', tip: 'A gold Mepps 3 catches everything in Scandinavian September — trout, perch, pike, char.' },
    ],
    fishingScore: 8,
    scoreReason: 'Late salmon run, pike getting aggressive, everything feeding up for winter. Beautiful season.',
    tipOfDay: 'September Scandinavian forests turn gold. The cooling nights trigger aggressive feeding across all species. Evening sessions until dark are best.',
    waterTemp: '10–15°C',
  },
  // Oct
  {
    topSpecies: [
      { name: 'Pike', reason: 'Pre-spawn feeding frenzy — October is the best pike month', rarity: 'uncommon' },
      { name: 'Perch', reason: 'Pack hunting mode — jigging a small rubber shad triggers fierce competition', rarity: 'common' },
      { name: 'Zander', reason: 'Moving to deeper winter holding spots — slow jig near channel edges', rarity: 'uncommon' },
      { name: 'Brown Trout', reason: 'Spawning runs beginning — see them in clear shallows but leave them alone', rarity: 'uncommon' },
      { name: 'Burbot', reason: 'Night fishing as temperatures drop — burbot start feeding', rarity: 'rare' },
    ],
    topBaits: [
      { name: 'Large Deadbait', tip: 'October pike take large prey. Roach, bream or mackerel deadbait fished under a float near weed edges.' },
      { name: 'Jigging Spoon', tip: '40-60g jigging spoon for zander in 8–15m of water. Work the bottom slowly.' },
      { name: 'Blade Bait', tip: 'A vibrating blade bait on a slow lift-drop retrieve devastates October perch.' },
    ],
    fishingScore: 7,
    scoreReason: 'Excellent predator fishing as water cools. Ice will come in 4–6 weeks.',
    tipOfDay: 'As water drops below 10°C, pike move from shallow weeds to deeper basin edges. Find the 4–6m depth transition zone.',
    waterTemp: '6–10°C',
  },
  // Nov-Dec
  ...[10, 11].map((m) => ({
    topSpecies: [
      { name: 'Pike', reason: 'Ice forming on edges — fish open water from boats with deadbait', rarity: 'uncommon' as const },
      { name: 'Perch', reason: 'Deep jigging before ice locks everything down', rarity: 'common' as const },
      { name: 'Burbot', reason: 'Night fishing in rivers for burbot — best on cold dark nights', rarity: 'rare' as const },
      { name: 'Vendace', reason: 'Ice just forming — the first days of ice fishing', rarity: 'uncommon' as const },
      { name: 'Char', reason: 'Deep mountain lakes still open — trolling with copper wire', rarity: 'rare' as const },
    ],
    topBaits: [
      { name: 'Livebait (Perch)', tip: 'Pre-ice pike respond to a lively perch on a float — big bait, big fish.' },
      { name: 'Jig Head + Worm', tip: 'Slow vertical jig through the water column for November perch in open lake areas.' },
      { name: 'Liver Bait', tip: 'Burbot love liver. Chunk of fresh liver on a size 2 hook, static on the bottom after dark.' },
    ],
    fishingScore: m === 10 ? 6 : 5,
    scoreReason: m === 10 ? 'Pre-ice window closing. Good boat fishing on open water.' : 'Ice beginning. Transition from open-water to ice fishing. Exciting but tricky.',
    tipOfDay: m === 10 ? 'Find the last unfrozen bays — warm-water inflows stay open longest. Predators concentrate here as ice advances.' : 'Check ice thickness daily in December. First ice is dangerous — wait for 10cm before walking.',
    waterTemp: m === 10 ? '2–6°C' : '0–3°C',
  })),
];

function getMediterraneanData(month: number): MonthData {
  const scores = [7, 7, 8, 8, 8, 8, 7, 7, 8, 9, 8, 7];
  const temps = ['14–17°C','14–16°C','15–18°C','17–20°C','20–23°C','23–27°C','25–29°C','26–29°C','23–26°C','20–24°C','17–21°C','14–18°C'];
  const springFall = month >= 9 || month <= 5;
  return {
    topSpecies: [
      { name: 'European Sea Bass', reason: springFall ? 'Most active — hunting prawns along rocky shorelines at dawn/dusk' : 'Present but deep in summer heat', rarity: 'uncommon' },
      { name: 'Gilthead Bream', reason: 'Year-round Mediterranean target — sand flats, seagrass, rocky outcrops', rarity: 'uncommon' },
      { name: 'Red Mullet', reason: 'Sandy-bottomed areas — fragrant baits near weed', rarity: 'common' },
      { name: month >= 6 && month <= 9 ? 'Bluefin Tuna' : 'Dentex', reason: month >= 6 && month <= 9 ? 'Summer migrations bring tuna within reach of charter boats — trolling or live-bait' : 'Deep rocky bottoms — large jigs and live bait', rarity: 'rare' },
      { name: 'Grouper', reason: 'Rocky drop-offs and caves — requires heavy tackle and patience', rarity: 'rare' },
    ],
    topBaits: [
      { name: 'Fresh Prawn', tip: 'Mediterranean sea bass adore fresh unshelled prawn. Hook through the tail, cast near rocks at dusk.' },
      { name: 'Soft Plastic Crab', tip: 'A rubber crab worked slowly across a sandy flat takes bream and mullet.' },
      { name: 'Popper (Surface)', tip: 'Dawn surface fishing with a popper near rocky headlands produces explosive bass takes.' },
    ],
    fishingScore: scores[month - 1],
    scoreReason: month >= 9 && month <= 11 ? 'Autumn is prime — water cooling, predators active, wind conditions often perfect.' : month >= 6 && month <= 8 ? 'Hot but productive from boats. Shore fishing tough in midday heat.' : 'Good spring conditions. Bass and bream very active.',
    tipOfDay: month >= 9 && month <= 11 ? 'Autumn storms stir up the seabed and disorient prey fish — fish the day after a storm for explosive bass sport.' : month >= 6 && month <= 8 ? 'Fish the hour before sunrise. Mediterranean summer bass feed aggressively in the cool pre-dawn, then retreat deep.' : 'Spring sea bass patrol the same rocky points each tide. Learn the spot, return to it every morning for a week.',
    waterTemp: temps[month - 1],
  };
}

function getWesternEuropeData(month: number): MonthData {
  const scores = [4, 5, 6, 7, 8, 8, 7, 7, 8, 7, 6, 4];
  const temps = ['4–7°C','4–8°C','7–11°C','10–14°C','13–17°C','16–20°C','18–22°C','18–22°C','15–19°C','11–15°C','7–10°C','4–7°C'];
  return {
    topSpecies: [
      { name: 'Zander', reason: month >= 4 && month <= 10 ? 'Active in clear rivers and canals — jigging at dawn and dusk' : 'Deep winter holding in slow rivers', rarity: 'uncommon' },
      { name: 'Carp', reason: month >= 5 && month <= 9 ? 'Surface and bottom baits producing — active all day' : 'Cold-weather carp require slow presentations in deep water', rarity: 'common' },
      { name: 'Pike', reason: month <= 3 || month >= 10 ? 'Winter pike season at its best' : 'Summer pike in weed channels on surface lures', rarity: 'uncommon' },
      { name: 'Bream', reason: 'River bream reliable year-round in slow continental rivers', rarity: 'common' },
      { name: 'Catfish (Wels)', reason: month >= 6 && month <= 9 ? 'Summer catfish prime — warm nights in the Rhine, Danube, Ebro' : 'Dormant in cold months', rarity: 'rare' },
    ],
    topBaits: [
      { name: 'Rubber Shad (Zander)', tip: 'A white or natural-coloured paddle tail shad, fished on a jig head just above the bottom at 5–8 knots retrieve.' },
      { name: 'Boilies (Carp)', tip: 'European carp fishing: spod mix of pellets, hemp and 18mm boilies over a raked spot.' },
      { name: 'Live Bream (Catfish)', tip: 'A large live bream on a circle hook under a clip-down float is the classic Ebro catfish method.' },
    ],
    fishingScore: scores[month - 1],
    scoreReason: month >= 5 && month <= 9 ? 'Summer carp and catfish season. Rhine/Danube producing well.' : month >= 3 && month <= 4 ? 'Spring awakening — pike and zander prime.' : 'Winter — pike and zander targeted specifically.',
    tipOfDay: 'Continental European rivers carry more colour than UK rivers. Use stronger-scented baits in coloured conditions — oily fish, garlic pellets, liver-flavoured boilies.',
    waterTemp: temps[month - 1],
  };
}

function getNoaaData(isNortheast: boolean, month: number): MonthData {
  const scores = isNortheast
    ? [3, 3, 5, 7, 8, 9, 9, 8, 8, 7, 5, 3]
    : [7, 7, 9, 9, 8, 6, 6, 7, 9, 9, 8, 7];
  const temps = isNortheast
    ? ['2–5°C','2–6°C','5–10°C','10–15°C','14–18°C','18–22°C','22–26°C','22–25°C','18–22°C','13–17°C','8–12°C','3–7°C']
    : ['18–22°C','18–22°C','20–24°C','22–26°C','24–28°C','28–31°C','29–32°C','29–31°C','26–30°C','23–27°C','20–24°C','18–22°C'];
  return {
    topSpecies: isNortheast ? [
      { name: 'Striped Bass', reason: month >= 4 && month <= 11 ? 'Migratory stripers back in range — surf casting and jigging from boats' : 'Wintering south, unavailable', rarity: 'uncommon' },
      { name: 'Largemouth Bass', reason: 'Year-round freshwater target; best in spring (spawn) and fall (feeding)', rarity: 'common' },
      { name: 'Bluefish', reason: month >= 6 && month <= 10 ? 'Savage surface-blitzing schools from June — poppers and metals' : 'Not present', rarity: 'uncommon' },
      { name: 'Summer Flounder', reason: month >= 5 && month <= 9 ? 'Flatfish from sandy bottoms near structure — bucktail jigging' : 'Offshore', rarity: 'common' },
      { name: 'Trout (Brookies)', reason: 'Stocked and wild brook trout in mountain streams; spring and fall best', rarity: 'uncommon' },
    ] : [
      { name: 'Redfish', reason: month >= 9 && month <= 11 ? 'Fall redfish schools in the surf — gold spoons and live shrimp' : 'Tailing in shallow flats year-round', rarity: 'uncommon' },
      { name: 'Speckled Trout', reason: 'Estuaries and grass flats year-round; best in spring and fall', rarity: 'common' },
      { name: 'Snook', reason: month >= 4 && month <= 10 ? 'Active near passes and beach — live pilchards or topwaters' : 'Cold-sensitive, hugging warm-water outflows', rarity: 'rare' },
      { name: 'Tarpon', reason: month >= 5 && month <= 8 ? 'Iconic Gulf Coast target — daisy chains rolling at dawn, present 100lb+ fish' : 'Migrating', rarity: 'rare' },
      { name: 'Largemouth Bass', reason: 'Premier freshwater target — active spring and fall in reservoirs', rarity: 'common' },
    ],
    topBaits: isNortheast ? [
      { name: 'Bunker (Menhaden) Chunks', tip: 'Cut bunker drifted behind a boat or cast from a jetty at night is the #1 striper bait.' },
      { name: 'Soft Plastic Swimbait', tip: 'A paddle-tail swimbait on 1oz jig head covers water fast for aggressive stripers.' },
      { name: 'Popper/Plug', tip: 'Surface plug work — walk-the-dog at dawn and dusk for bluefish explosions.' },
    ] : [
      { name: 'Live Shrimp', tip: 'The universal Gulf Coast bait. Under a popping cork for trout and redfish in grass beds.' },
      { name: 'Gold Spoon', tip: 'A 3/4oz gold spoon cast into tailing redfish on a flat is as exciting as fishing gets.' },
      { name: 'Live Pilchard', tip: 'A free-lined live pilchard near a bridge pass at night is the top snook method.' },
    ],
    fishingScore: scores[month - 1],
    scoreReason: isNortheast
      ? (month >= 5 && month <= 10 ? 'Migratory fish returning. Spring and fall exceptional for stripers.' : 'Winter slow. Ice fishing possible in far north.')
      : (month === 3 || month === 4 || month === 9 || month === 10 ? 'Spring/fall redfish and trout at their best. Mild temperatures.' : month >= 6 && month <= 8 ? 'Summer heat reduces inshore action but tarpon and offshore excellent.' : 'Good mild-season fishing.'),
    tipOfDay: isNortheast
      ? 'Striped bass follow bunker migrations. Find the bunker schools on a fishfinder — the bass will be underneath and behind them.'
      : 'Gulf flats fishing requires stealth. Pole your boat or wade silently. Tailing redfish can hear a push pole from 50 yards.',
    waterTemp: temps[month - 1],
  };
}

function getPacificNorthwestData(month: number): MonthData {
  const scores = [4, 4, 5, 7, 8, 8, 9, 10, 9, 7, 5, 4];
  const temps = ['7–10°C','7–10°C','8–11°C','10–13°C','12–15°C','14–17°C','16–19°C','16–20°C','14–18°C','11–14°C','8–11°C','7–10°C'];
  return {
    topSpecies: [
      { name: 'Chinook Salmon', reason: month >= 7 && month <= 9 ? 'Peak king salmon runs — rivers full of 20lb+ fish, fly fishing and drift fishing' : month >= 4 && month <= 6 ? 'Spring chinook entering rivers — early runs on the Columbia' : 'Offshore or unavailable', rarity: 'rare' },
      { name: 'Coho Salmon', reason: month >= 8 && month <= 10 ? 'Silver salmon runs at their best — aggressive takers on spoons' : 'Not in rivers', rarity: 'rare' },
      { name: 'Steelhead', reason: month <= 4 || month >= 11 ? 'Winter steelhead runs — the holy grail of PNW fishing' : month >= 6 && month <= 8 ? 'Summer steelhead — dry fly fishing on clear rivers' : 'In transition', rarity: 'rare' },
      { name: 'Pacific Halibut', reason: month >= 5 && month <= 9 ? 'Charter boat halibut from 20–40 fathoms — bait and heavy jigs' : 'Deeper water, limited access', rarity: 'uncommon' },
      { name: 'Cutthroat Trout', reason: 'Year-round resident — clear mountain streams, aggressive to dry flies', rarity: 'uncommon' },
    ],
    topBaits: [
      { name: 'Salmon Eggs / Roe', tip: 'Cured salmon roe on a hook is the most effective drift bait for steelhead and salmon. Pink cure for winter, natural for summer.' },
      { name: 'Coho Spoon (Chrome)', tip: 'A bright chrome spoon worked fast through a salmon pool triggers aggressive strikes from coho.' },
      { name: 'Dry Fly (Elk Hair Caddis)', tip: 'Summer steelhead rise to large dry flies. An elk hair caddis size 6 swung across a riffle is the pinnacle of PNW fly fishing.' },
    ],
    fishingScore: scores[month - 1],
    scoreReason: month >= 7 && month <= 9 ? 'Peak salmon season. Rivers filling with chinook and coho. Best fishing of the year.' : month >= 11 || month <= 2 ? 'Winter steelhead runs. Challenging but the rewards are extraordinary.' : 'Spring/fall shoulder season — good but not peak.',
    tipOfDay: 'PNW salmon runs vary year to year with ocean conditions. Check the WDFW run forecast before your trip — a strong forecast year changes everything.',
    waterTemp: temps[month - 1],
  };
}

function getAustraliaEastData(month: number): MonthData {
  // Southern hemisphere — months are reversed season-wise
  const scores = [9, 9, 8, 7, 6, 5, 5, 6, 7, 8, 9, 9];
  const temps = ['22–26°C','22–26°C','20–24°C','17–21°C','14–18°C','11–15°C','10–14°C','11–15°C','14–18°C','17–21°C','19–23°C','21–25°C'];
  const isSummer = month >= 11 || month <= 3;
  return {
    topSpecies: [
      { name: 'Barramundi', reason: isSummer ? 'Prime barra season — aggressive in warm water, hit lures at dawn along mangroves' : 'Feeding less actively in cooler months', rarity: 'uncommon' },
      { name: 'Snapper (Australian)', reason: 'Year-round offshore target — reefs and rocky pinnacles produce quality fish', rarity: 'uncommon' },
      { name: 'Flathead', reason: 'Sandy estuaries and shallow bays year-round — soft plastics and hardbodies', rarity: 'common' },
      { name: 'Whiting', reason: 'Inshore estuary species active year-round — light tackle fun on prawns', rarity: 'common' },
      { name: isSummer ? 'Mahi-Mahi' : 'Kingfish', reason: isSummer ? 'Summer bluewater trolling — flying fish imitations along temp breaks' : 'Winter kingfish school around structure — pilchards and chrome lures', rarity: 'rare' },
    ],
    topBaits: [
      { name: 'Surface Lure (Popper)', tip: 'Dawn barramundi on a surface popper near a mangrove bank — it doesn\'t get better than this in Australian fishing.' },
      { name: 'Soft Plastic (Paddle Tail)', tip: 'A 4-inch paddle tail in natural prawn colour covers every estuary species. Slow roll near the bottom.' },
      { name: 'Fresh Prawn (Whole)', tip: 'Whole unshelled prawn on a size 1/0 circle hook — the universal Australian bait for snapper, bream and whiting.' },
    ],
    fishingScore: scores[month - 1],
    scoreReason: isSummer ? 'Australian summer — warm water, barramundi prime, excellent sport across all species.' : 'Winter months — cooler but snapper and kingfish excel offshore.',
    tipOfDay: isSummer ? 'Barra hit the surface lures hardest at first light. The 20-minute window after sunrise is when they\'re most aggressive before retreating to deeper shaded areas.' : 'Winter snapper over offshore reefs at dawn — a fresh squid bait on a paternoster rig drifted across the bottom produces the biggest fish.',
    waterTemp: temps[month - 1],
  };
}

function getSoutheastAsiaData(month: number): MonthData {
  return {
    topSpecies: [
      { name: 'Giant Snakehead', reason: 'Surface lure fishing in jungle ponds and rivers — explosive strikes, powerful runs', rarity: 'rare' },
      { name: 'Barramundi', reason: 'Year-round target in SE Asian estuaries and mangrove creeks', rarity: 'uncommon' },
      { name: 'Mahseer', reason: 'The SE Asian river monster — rapids and mountain streams, grows to 100lb+', rarity: 'rare' },
      { name: 'Giant Gourami', reason: 'Freshwater lakes and ponds — floating bread and dough baits', rarity: 'uncommon' },
      { name: 'Peacock Bass', reason: 'Introduced and thriving in reservoir complexes — aggressive lure takers', rarity: 'uncommon' },
    ],
    topBaits: [
      { name: 'Frog Lure (Hollow Body)', tip: 'A hollow-body frog worked through lily pads triggers explosive snakehead strikes. Let it sit motionless for 3–5 seconds between twitches.' },
      { name: 'Live Frog', tip: 'The ultimate snakehead bait in traditional fishing — hook through the leg and float it near cover.' },
      { name: 'Prawn/Shrimp', tip: 'Fresh river shrimp is the number one mahseer bait fished on a float in fast, rocky sections.' },
    ],
    fishingScore: month >= 3 && month <= 5 ? 9 : month >= 6 && month <= 8 ? 7 : 8,
    scoreReason: month >= 3 && month <= 5 ? 'Dry season — water levels low, fish concentrated in pools and channels. Best time of year.' : month >= 6 && month <= 8 ? 'Monsoon season — rivers flood and fish scatter. Harder but barramundi in new flood zones.' : 'Good conditions — post-monsoon fish concentrated as waters recede.',
    tipOfDay: 'Snakehead guard their fry aggressively. Find a snakehead with a cloud of fry near surface and you have guaranteed action — cast a popper near (not directly on) the fry cloud.',
    waterTemp: '26–30°C',
  };
}

function getDefaultData(month: number): MonthData {
  return {
    topSpecies: [
      { name: 'Carp', reason: 'Widely distributed worldwide, responds to boilies and corn', rarity: 'common' },
      { name: 'Catfish', reason: 'Present in most temperate freshwater systems', rarity: 'common' },
      { name: 'Bass', reason: 'Largemouth/smallmouth bass widely stocked globally', rarity: 'common' },
      { name: 'Trout', reason: 'Stocked in rivers and lakes across many countries', rarity: 'uncommon' },
      { name: 'Pike', reason: 'Found across Northern Hemisphere rivers and lakes', rarity: 'uncommon' },
    ],
    topBaits: [
      { name: 'Worm', tip: 'A worm catches fish everywhere on earth. Natural, irresistible, easy to obtain.' },
      { name: 'Sweetcorn', tip: 'Versatile and effective. Use on a size 10 hook for most coarse fish.' },
      { name: 'Small Spinner', tip: 'A simple silver or gold spinner works for perch, trout and bass worldwide.' },
    ],
    fishingScore: 6,
    scoreReason: 'Conditions are reasonable for general fishing.',
    tipOfDay: 'Fish where the food is. Current seams, weed edges, and depth changes concentrate fish. Never cast into open flat water without a reason.',
    waterTemp: '12–18°C',
  };
}

export function getRegionalFishingData(lat: number, lng: number, month: number): RegionalFishingData {
  let monthData: MonthData;
  let region: string;
  let legalNotes: string;
  let regulations: string;

  const m = Math.max(1, Math.min(12, month));

  // UK
  if (lat >= 49 && lat <= 61 && lng >= -8 && lng <= 2) {
    region = 'United Kingdom';
    monthData = UK_MONTHS[m - 1];
    legalNotes = 'Environment Agency rod licence required (£35/yr or £13/day). Minimum sizes apply: carp 35cm, barbel 35cm, trout 23cm.';
    regulations = m >= 3 && m <= 6
      ? 'Trout season open from 15 March on most rivers. Coarse season closes 14 March on rivers — stillwaters open year-round.'
      : m <= 2 || m === 12
      ? 'Coarse river closed season: 15 March – 15 June. Pike and perch permitted all year on stillwaters.'
      : 'Main coarse season open. Trout season open. Barbel catch-and-release recommended in warm water.';
  }
  // Scandinavia
  else if (lat >= 55 && lat <= 72 && lng >= 5 && lng <= 30) {
    region = 'Scandinavia';
    monthData = SCANDINAVIA_MONTHS[m - 1];
    legalNotes = 'National fishing licence required in Norway and Sweden for migratory fish. Local licences for private waters.';
    regulations = m >= 6 && m <= 9
      ? 'Salmon licence required for most rivers. Check individual river regulations — some rivers have quota systems.'
      : m >= 11 || m <= 3
      ? 'Ice fishing permitted on most lakes without licence. Check local municipality rules.'
      : 'Spring/autumn — standard freshwater licence covers most species.';
  }
  // Mediterranean
  else if (lat >= 35 && lat <= 45 && lng >= -6 && lng <= 36) {
    region = 'Mediterranean';
    monthData = getMediterraneanData(m);
    legalNotes = 'Sea fishing generally free from shore. Boat fishing may require permits in MPAs. Minimum bass size 36cm.';
    regulations = 'Check local marine protected area rules — many Mediterranean coastlines have restricted zones. Tuna quotas apply to commercial vessels.';
  }
  // Western Europe
  else if (lat >= 44 && lat <= 55 && lng >= 2 && lng <= 20) {
    region = 'Western Europe';
    monthData = getWesternEuropeData(m);
    legalNotes = 'National fishing permits required in France, Germany, Netherlands. Regulations vary by water. Carp catch-and-release encouraged.';
    regulations = m >= 3 && m <= 5
      ? 'Pike season varies by country — check local regulations. Spring bass season restrictions in France.'
      : 'General coarse fishing permitted. Trout waters may have seasonal restrictions.';
  }
  // Pacific Northwest USA
  else if (lat >= 45 && lat <= 49 && lng >= -125 && lng <= -116) {
    region = 'Pacific Northwest USA';
    monthData = getPacificNorthwestData(m);
    legalNotes = 'State fishing licence required (WA or OR). Salmon quota restrictions apply — check WDFW or ODFW regulations before each trip.';
    regulations = 'Salmon and steelhead regulations change WEEKLY during season. Always verify current rules at wdfw.wa.gov or dfw.state.or.us before fishing.';
  }
  // Northeast USA
  else if (lat >= 40 && lat <= 47 && lng >= -76 && lng <= -67) {
    region = 'Northeast USA';
    monthData = getNoaaData(true, m);
    legalNotes = 'State fishing licence required. Striped bass slot limits apply (28–35 inches in most states, 1 fish). Bluefish limit 3/day.';
    regulations = m >= 4 && m <= 11
      ? 'Striped bass season open. Check state-specific regulations for slot limits.'
      : 'Winter — most migratory fish absent. Ice fishing permits available in NY, CT, MA for freshwater.';
  }
  // Southeast USA
  else if (lat >= 25 && lat <= 40 && lng >= -90 && lng <= -75) {
    region = 'Southeast USA';
    monthData = getNoaaData(false, m);
    legalNotes = 'State licence required (FL, TX, GA, LA, SC, NC). Snook season varies in Florida — check FWC regulations. Redfish limit 1/day in most Gulf states.';
    regulations = m >= 12 || m <= 2
      ? 'Snook closed season in south Florida. Redfish and speckled trout open year-round.'
      : 'Main season. Check current snook status — regulations change seasonally.';
  }
  // Australia East
  else if (lat >= -38 && lat <= -10 && lng >= 148 && lng <= 154) {
    region = 'Eastern Australia';
    monthData = getAustraliaEastData(m);
    legalNotes = 'NSW/QLD recreational fishing licence required. Barramundi slot: 58–120cm in QLD. No-take estuary perch reserves exist.';
    regulations = 'Bag limits vary by species and state. Barramundi has strict slot limits. Check NSW DPI or QLD DAF current regulations.';
  }
  // Southeast Asia
  else if (lat >= 1 && lat <= 20 && lng >= 100 && lng <= 120) {
    region = 'Southeast Asia';
    monthData = getSoutheastAsiaData(m);
    legalNotes = 'Licensing varies by country. Mahseer is a protected species in India/Nepal — catch-and-release only.';
    regulations = 'Always check local regulations. Many SE Asian rivers have sanctuary zones protecting mahseer. Fishing within wildlife reserves is prohibited.';
  }
  // Default
  else {
    region = 'Your Region';
    monthData = getDefaultData(m);
    legalNotes = 'Check local fishing licence requirements and minimum size regulations for your area.';
    regulations = 'Always verify local fishing rules and licences before fishing.';
  }

  return {
    region,
    topSpecies: monthData.topSpecies,
    topBaits: monthData.topBaits,
    legalNotes,
    fishingScore: monthData.fishingScore,
    scoreReason: monthData.scoreReason,
    tipOfDay: monthData.tipOfDay,
    waterTemp: monthData.waterTemp,
    regulations,
  };
}
