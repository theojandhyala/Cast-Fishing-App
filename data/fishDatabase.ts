import { GLOBAL_FISH_DATABASE } from './globalFishDatabase';
import {
  FISH_RARITIES,
  FishFilters,
  FishRarity,
  FishRegion,
  FishSpecies,
  WaterType,
} from '../types/fish';

export const RARITY_COLOURS: Record<FishRarity, string> = {
  common: '#94A3B8',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
};

export const XP_BY_RARITY: Record<FishRarity, number> = {
  common: 50,
  uncommon: 100,
  rare: 225,
  epic: 500,
  legendary: 1000,
};

const EMPTY_RECORD: FishSpecies['record'] = {
  weightKg: null,
  lengthCm: null,
  angler: null,
  location: null,
  date: null,
  authority: null,
  sourceUrl: null,
  status: 'unverified',
  note: 'No primary record-authority citation is bundled. A record value is intentionally not displayed.',
};

type CatalogueGroup = {
  regions: FishRegion[];
  waterType: WaterType;
  habitats: string[];
  bestBaits: string[];
  seasons: string[];
  entries: string;
};

// These entries are a discovery catalogue, not a claim that every fish is legally targetable.
// Common/scientific-name pairs are kept declarative so taxonomy can be audited or replaced.
const CATALOGUE_GROUPS: CatalogueGroup[] = [
  {
    regions: ['UK & Ireland', 'Europe'], waterType: 'freshwater',
    habitats: ['rivers', 'lakes', 'canals'], bestBaits: ['worms', 'maggots', 'small lures'], seasons: ['spring', 'summer', 'autumn'],
    entries: `European eel|Anguilla anguilla
European bitterling|Rhodeus amarus
White-clawed crayfish goby|Romanogobio albipinnatus
European mudminnow|Umbra krameri
Huchen|Hucho hucho
Danube salmon|Hucho hucho
European grayling|Thymallus thymallus
Brown bullhead|Ameiurus nebulosus
Black bullhead|Ameiurus melas
Weatherfish|Misgurnus fossilis
Spined loach|Cobitis taenia
European brook lamprey|Lampetra planeri
River lamprey|Lampetra fluviatilis
Sea lamprey|Petromyzon marinus
Allis shad|Alosa alosa
Twaite shad|Alosa fallax
Vendace|Coregonus albula
Powan|Coregonus clupeoides
Schelly|Coregonus stigmaticus
Arctic char|Salvelinus alpinus
European catfish|Silurus glanis
Mediterranean barbel|Barbus meridionalis
Italian barbel|Barbus plebejus
Iberian barbel|Luciobarbus bocagei
European minnow|Phoxinus phoxinus
Topmouth gudgeon|Pseudorasbora parva
Zingel|Zingel zingel
Streber|Zingel streber
Schraetzer|Gymnocephalus schraetser
European bullhead|Cottus gobio`,
  },
  {
    regions: ['North America'], waterType: 'freshwater',
    habitats: ['lakes', 'reservoirs', 'rivers'], bestBaits: ['minnows', 'worms', 'jigs', 'crankbaits'], seasons: ['spring', 'summer', 'autumn'],
    entries: `Largemouth bass|Micropterus salmoides
Smallmouth bass|Micropterus dolomieu
Spotted bass|Micropterus punctulatus
Guadalupe bass|Micropterus treculii
Shoal bass|Micropterus cataractae
Suwannee bass|Micropterus notius
White crappie|Pomoxis annularis
Black crappie|Pomoxis nigromaculatus
Bluegill|Lepomis macrochirus
Pumpkinseed|Lepomis gibbosus
Redear sunfish|Lepomis microlophus
Green sunfish|Lepomis cyanellus
Warmouth|Lepomis gulosus
Rock bass|Ambloplites rupestris
Yellow perch|Perca flavescens
Walleye|Sander vitreus
Sauger|Sander canadensis
Chain pickerel|Esox niger
Muskellunge|Esox masquinongy
Longnose gar|Lepisosteus osseus
Spotted gar|Lepisosteus oculatus
Alligator gar|Atractosteus spatula
Bowfin|Amia calva
Channel catfish|Ictalurus punctatus
Blue catfish|Ictalurus furcatus
Flathead catfish|Pylodictis olivaris
White catfish|Ameiurus catus
Freshwater drum|Aplodinotus grunniens
American paddlefish|Polyodon spathula
Lake sturgeon|Acipenser fulvescens
White sturgeon|Acipenser transmontanus
Brook trout|Salvelinus fontinalis
Lake trout|Salvelinus namaycush
Cutthroat trout|Oncorhynchus clarkii
Golden trout|Oncorhynchus aguabonita
Kokanee|Oncorhynchus nerka
American shad|Alosa sapidissima
Striped bass|Morone saxatilis
White bass|Morone chrysops
Yellow bass|Morone mississippiensis`,
  },
  {
    regions: ['Australia'], waterType: 'freshwater',
    habitats: ['rivers', 'billabongs', 'reservoirs'], bestBaits: ['yabbies', 'shrimp', 'soft plastics', 'spinnerbaits'], seasons: ['spring', 'summer', 'autumn'],
    entries: `Murray cod|Maccullochella peelii
Trout cod|Maccullochella macquariensis
Mary River cod|Maccullochella mariensis
Eastern freshwater cod|Maccullochella ikei
Golden perch|Macquaria ambigua
Macquarie perch|Macquaria australasica
Australian bass|Percalates novemaculeata
Estuary perch|Percalates colonorum
Silver perch|Bidyanus bidyanus
Barcoo grunter|Scortum barcoo
Sooty grunter|Hephaestus fuliginosus
Jungle perch|Kuhlia rupestris
Sleepy cod|Oxyeleotris lineolata
Freshwater catfish|Tandanus tandanus
Australian lungfish|Neoceratodus forsteri
Saratoga|Scleropages leichardti
Gulf saratoga|Scleropages jardinii
Australian smelt|Retropinna semoni
River blackfish|Gadopsis marmoratus
Mountain galaxias|Galaxias olidus
Climbing galaxias|Galaxias brevipinnis
Short-finned eel|Anguilla australis
Long-finned eel|Anguilla reinhardtii
Coal grunter|Hephaestus carbo
Spangled perch|Leiopotherapon unicolor`,
  },
  {
    regions: ['New Zealand'], waterType: 'freshwater',
    habitats: ['rivers', 'hydro lakes', 'estuaries'], bestBaits: ['nymphs', 'streamers', 'worms', 'small lures'], seasons: ['spring', 'summer', 'autumn'],
    entries: `Giant kōkopu|Galaxias argenteus
Banded kōkopu|Galaxias fasciatus
Shortjaw kōkopu|Galaxias postvectis
Inanga|Galaxias maculatus
Kōaro|Galaxias brevipinnis
Canterbury mudfish|Neochanna burrowsius
Black mudfish|Neochanna diversus
Brown mudfish|Neochanna apoda
Gollum galaxias|Galaxias gollumoides
Lowland longjaw galaxias|Galaxias cobitinis
Bluegill bully|Gobiomorphus hubbsi
Giant bully|Gobiomorphus gobioides
Common bully|Gobiomorphus cotidianus
Torrentfish|Cheimarrichthys fosteri
New Zealand longfin eel|Anguilla dieffenbachii
New Zealand smelt|Retropinna retropinna
Common smelt|Retropinna retropinna
Grayling|Prototroctes oxyrhynchus
Upland bully|Gobiomorphus breviceps
Redfin bully|Gobiomorphus huttoni`,
  },
  {
    regions: ['South Africa'], waterType: 'freshwater',
    habitats: ['rivers', 'dams', 'estuaries'], bestBaits: ['worms', 'crabs', 'spinnerbaits', 'flies'], seasons: ['spring', 'summer', 'autumn'],
    entries: `Largemouth yellowfish|Labeobarbus kimberleyensis
Smallmouth yellowfish|Labeobarbus aeneus
Clanwilliam yellowfish|Labeobarbus capensis
Bushveld smallscale yellowfish|Labeobarbus polylepis
Natal yellowfish|Labeobarbus natalensis
Orange River mudfish|Labeo capensis
Vaal-Orange largemouth mudfish|Labeo umbratus
Sharptooth catfish|Clarias gariepinus
Moggel|Labeo umbratus
Kurper|Oreochromis mossambicus
Blue kurper|Oreochromis aureus
Canary kurper|Chetia flaviventris
Eastern Cape redfin|Pseudobarbus afer
Clanwilliam redfin|Sedercypris calidus
Cape galaxias|Galaxias zebratus
Cape kurper|Sandelia capensis
Rock catfish|Austroglanis sclateri
Papermouth|Enteromius mattozi
Silver catfish|Schilbe intermedius
Tigerfish|Hydrocynus vittatus`,
  },
  {
    regions: ['Japan'], waterType: 'freshwater',
    habitats: ['rivers', 'lakes', 'rice-field channels'], bestBaits: ['insects', 'worms', 'small minnows', 'flies'], seasons: ['spring', 'summer', 'autumn'],
    entries: `Ayu|Plecoglossus altivelis
Japanese eel|Anguilla japonica
Japanese huchen|Parahucho perryi
Biwa trout|Oncorhynchus masou rhodurus
Cherry salmon|Oncorhynchus masou
Amago salmon|Oncorhynchus masou ishikawae
Japanese dace|Pseudaspius hakonensis
Dark chub|Nipponocypris temminckii
Pale chub|Opsariichthys platypus
Japanese crucian carp|Carassius cuvieri
Ginbuna|Carassius langsdorfii
Honmoroko|Gnathopogon caerulescens
Japanese bitterling|Tanakia limbata
Rosy bitterling|Rhodeus ocellatus
Japanese white crucian|Carassius cuvieri
Three-lips|Opsariichthys uncirostris
Japanese smelt|Hypomesus nipponensis
Japanese catfish|Silurus asotus
Lake Biwa catfish|Silurus biwaensis
Japanese rice fish|Oryzias latipes
Japanese fluvial sculpin|Cottus pollux
Japanese trout|Salvelinus leucomaenis
Far Eastern brook lamprey|Lethenteron reissneri
Japanese weatherfish|Misgurnus anguillicaudatus
Chinese snakehead|Channa argus`,
  },
  {
    regions: ['Amazon'], waterType: 'freshwater',
    habitats: ['whitewater rivers', 'blackwater rivers', 'flooded forest'], bestBaits: ['cut fish', 'fruit', 'live bait', 'large lures'], seasons: ['wet season', 'falling water', 'dry season'],
    entries: `Arapaima|Arapaima gigas
Black piranha|Serrasalmus rhombeus
Red-bellied piranha|Pygocentrus nattereri
Wimple piranha|Catoprion mento
Tambaqui|Colossoma macropomum
Pirapitinga|Piaractus brachypomus
Piraíba|Brachyplatystoma filamentosum
Redtail catfish|Phractocephalus hemioliopterus
Tiger shovelnose catfish|Pseudoplatystoma tigrinum
Jau catfish|Zungaro zungaro
Ripsaw catfish|Oxydoras niger
Gilded catfish|Brachyplatystoma rousseauxii
Sorubim|Sorubim lima
Electric eel|Electrophorus electricus
Payara|Hydrolycus scomberoides
Black arowana|Osteoglossum ferreirai
Silver arowana|Osteoglossum bicirrhosum
Butterfly peacock bass|Cichla ocellaris
Speckled peacock bass|Cichla temensis
Orinoco peacock bass|Cichla orinocensis
Oscar|Astronotus ocellatus
Wolf fish|Hoplias malabaricus
Giant trahira|Hoplias aimara
Flannel-mouth characin|Prochilodus nigricans
Brycon|Brycon amazonicus
Freshwater stingray|Potamotrygon motoro
Giant freshwater stingray|Potamotrygon brachyura
Amazon leaffish|Monocirrhus polyacanthus
Discus|Symphysodon aequifasciatus
Cardinal tetra|Paracheirodon axelrodi`,
  },
  {
    regions: ['India'], waterType: 'freshwater',
    habitats: ['large rivers', 'reservoirs', 'foothill streams'], bestBaits: ['dough', 'worms', 'crustaceans', 'spinners'], seasons: ['pre-monsoon', 'post-monsoon', 'winter'],
    entries: `Golden mahseer|Tor putitora
Hump-backed mahseer|Tor remadevii
Deccan mahseer|Tor khudree
Chocolate mahseer|Neolissochilus hexagonolepis
Goonch|Bagarius yarrelli
Wallago catfish|Wallago attu
Giant river catfish|Sperata seenghala
Indian river shad|Gudusia chapra
Rohu|Labeo rohita
Catla|Labeo catla
Mrigal|Cirrhinus mrigala
Kalbasu|Labeo calbasu
Grass carp|Ctenopharyngodon idella
Snakehead murrel|Channa striata
Giant snakehead|Channa marulius
Spotted snakehead|Channa punctata
Climbing perch|Anabas testudineus
Indian featherback|Chitala chitala
Bronze featherback|Notopterus notopterus
Walking catfish|Clarias batrachus
Stinging catfish|Heteropneustes fossilis
Indian trout|Raiamas bola
Carnatic carp|Barbodes carnaticus
Pearl spot|Etroplus suratensis
Zebra danio|Danio rerio`,
  },
  {
    regions: ['Atlantic Ocean', 'Pacific Ocean', 'Indian Ocean'], waterType: 'saltwater',
    habitats: ['coastal waters', 'reefs', 'continental shelf'], bestBaits: ['squid', 'cut fish', 'jigs', 'trolling lures'], seasons: ['varies by stock and local regulation'],
    entries: `Atlantic bluefin tuna|Thunnus thynnus
Pacific bluefin tuna|Thunnus orientalis
Southern bluefin tuna|Thunnus maccoyii
Yellowfin tuna|Thunnus albacares
Bigeye tuna|Thunnus obesus
Albacore|Thunnus alalunga
Skipjack tuna|Katsuwonus pelamis
Atlantic bonito|Sarda sarda
Wahoo|Acanthocybium solandri
Mahi-mahi|Coryphaena hippurus
Atlantic sailfish|Istiophorus albicans
Indo-Pacific sailfish|Istiophorus platypterus
Blue marlin|Makaira nigricans
Black marlin|Istiompax indica
Striped marlin|Kajikia audax
White marlin|Kajikia albida
Swordfish|Xiphias gladius
Great barracuda|Sphyraena barracuda
Atlantic tarpon|Megalops atlanticus
Indo-Pacific tarpon|Megalops cyprinoides
Giant trevally|Caranx ignobilis
Bluefin trevally|Caranx melampygus
African pompano|Alectis ciliaris
Greater amberjack|Seriola dumerili
Yellowtail amberjack|Seriola lalandi
Permit|Trachinotus falcatus
Bonefish|Albula vulpes
Common snook|Centropomus undecimalis
Atlantic cod|Gadus morhua
Pacific cod|Gadus macrocephalus
Haddock|Melanogrammus aeglefinus
Pollock|Pollachius virens
European hake|Merluccius merluccius
Ling|Molva molva
Atlantic halibut|Hippoglossus hippoglossus
Pacific halibut|Hippoglossus stenolepis
European plaice|Pleuronectes platessa
Summer flounder|Paralichthys dentatus
Red snapper|Lutjanus campechanus
Cubera snapper|Lutjanus cyanopterus
Mangrove red snapper|Lutjanus argentimaculatus
Mutton snapper|Lutjanus analis
Nassau grouper|Epinephelus striatus
Goliath grouper|Epinephelus itajara
Gag grouper|Mycteroperca microlepis
Coral trout|Plectropomus leopardus
Humphead wrasse|Cheilinus undulatus
California sheephead|Semicossyphus pulcher
Red drum|Sciaenops ocellatus
Black drum|Pogonias cromis
White seabass|Atractoscion nobilis
European seabass|Dicentrarchus labrax
Barramundi|Lates calcarifer
Bluefish|Pomatomus saltatrix
Atlantic mackerel|Scomber scombrus
King mackerel|Scomberomorus cavalla
Spanish mackerel|Scomberomorus macula
Cobia|Rachycentron canadum
Queenfish|Scomberoides commersonnianus
Roosterfish|Nematistius pectoralis`,
  },
  {
    regions: ['Pacific Ocean', 'Indian Ocean'], waterType: 'saltwater',
    habitats: ['coral reefs', 'rocky reefs', 'lagoons'], bestBaits: ['prawns', 'crabs', 'small fish', 'soft plastics'], seasons: ['varies by latitude and local regulation'],
    entries: `Emperor red snapper|Lutjanus sebae
Dogtooth tuna|Gymnosarda unicolor
Jobfish|Aprion virescens
Green jobfish|Aprion virescens
Red emperor|Lutjanus sebae
Spangled emperor|Lethrinus nebulosus
Longface emperor|Lethrinus olivaceus
Sweetlip emperor|Lethrinus miniatus
Golden trevally|Gnathanodon speciosus
Brassy trevally|Caranx papuensis
Bigeye trevally|Caranx sexfasciatus
Island trevally|Carangoides orthogrammus
Giant queenfish|Scomberoides commersonnianus
Threadfin salmon|Eleutheronema tetradactylum
Blue threadfin|Eleutheronema tetradactylum
Golden snapper|Lutjanus johnii
Saddletail snapper|Lutjanus malabaricus
Crimson snapper|Lutjanus erythropterus
Chinamanfish|Symphorus nematophorus
Maori cod|Epinephelus undulatostriatus
Potato grouper|Epinephelus tukula
Camouflage grouper|Epinephelus polyphekadion
Peacock grouper|Cephalopholis argus
Blue-spotted grouper|Cephalopholis cyanostigma
Leopard coral grouper|Plectropomus leopardus
Baldchin groper|Choerodon rubescens
Blue groper|Achoerodus viridis
Harlequin fish|Othos dentex
Pink snapper|Chrysophrys auratus
Western blue groper|Achoerodus gouldii`,
  },
  {
    regions: ['Atlantic Ocean', 'Pacific Ocean', 'Indian Ocean', 'Arctic Ocean', 'Southern Ocean'], waterType: 'saltwater',
    habitats: ['open ocean', 'continental slopes', 'offshore banks'], bestBaits: ['whole fish', 'cut bait', 'large lures'], seasons: ['varies by migration and local regulation'],
    entries: `Blue shark|Prionace glauca
Shortfin mako|Isurus oxyrinchus
Porbeagle|Lamna nasus
Great white shark|Carcharodon carcharias
Tiger shark|Galeocerdo cuvier
Bull shark|Carcharhinus leucas
Oceanic whitetip shark|Carcharhinus longimanus
Blacktip shark|Carcharhinus limbatus
Sandbar shark|Carcharhinus plumbeus
Dusky shark|Carcharhinus obscurus
Lemon shark|Negaprion brevirostris
Bronze whaler|Carcharhinus brachyurus
Common thresher|Alopias vulpinus
Bigeye thresher|Alopias superciliosus
Greenland shark|Somniosus microcephalus
Sixgill shark|Hexanchus griseus
Tope shark|Galeorhinus galeus
Smoothhound|Mustelus mustelus
Spiny dogfish|Squalus acanthias
Whale shark|Rhincodon typus
Basking shark|Cetorhinus maximus
Giant manta ray|Mobula birostris
Reef manta ray|Mobula alfredi
Common eagle ray|Myliobatis aquila
Southern stingray|Hypanus americanus
Blue skate|Dipturus batis
Thornback ray|Raja clavata
Blonde ray|Raja brachyura
Small-eyed ray|Raja microocellata
Electric ray|Torpedo marmorata`,
  },
];

function slugify(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function rarityFromLegacy(value: string): FishRarity {
  if (value === 'mythic') return 'legendary';
  return FISH_RARITIES.includes(value as FishRarity) ? value as FishRarity : 'uncommon';
}

function normalizeRegions(regions: string[]): FishRegion[] {
  const found = new Set<FishRegion>();
  for (const value of regions.join(' ').toLowerCase().split(',')) {
    if (/uk|britain|ireland/.test(value)) found.add('UK & Ireland');
    if (/europe|mediterranean|scandinavia|baltic/.test(value)) found.add('Europe');
    if (/north america|canada|usa|united states|alaska/.test(value)) found.add('North America');
    if (/australia/.test(value)) found.add('Australia');
    if (/new zealand/.test(value)) found.add('New Zealand');
    if (/south africa/.test(value)) found.add('South Africa');
    if (/japan/.test(value)) found.add('Japan');
    if (/amazon|brazil/.test(value)) found.add('Amazon');
    if (/india/.test(value)) found.add('India');
    if (/atlantic/.test(value)) found.add('Atlantic Ocean');
    if (/pacific/.test(value)) found.add('Pacific Ocean');
    if (/indian ocean/.test(value)) found.add('Indian Ocean');
    if (/arctic/.test(value)) found.add('Arctic Ocean');
    if (/southern ocean|antarctic/.test(value)) found.add('Southern Ocean');
    if (/worldwide|global|tropical|asia|africa/.test(value)) found.add('Worldwide');
  }
  return found.size ? [...found] : ['Worldwide'];
}

const legacySpecies: FishSpecies[] = GLOBAL_FISH_DATABASE.map((fish) => {
  const rarity = rarityFromLegacy(fish.rarity);
  const waterType: WaterType = fish.type === 'migratory' ? 'anadromous'
    : ['sea', 'saltwater'].includes(fish.type) ? 'saltwater' : 'freshwater';
  return {
    id: `legacy-${fish.id}`,
    commonName: fish.commonName || fish.name,
    scientificName: fish.latinName,
    alternateNames: fish.name === fish.commonName ? [] : [fish.name],
    regions: normalizeRegions(fish.regions),
    waterType,
    habitats: [fish.habitat],
    bestBaits: fish.bestBait,
    seasons: fish.bestSeason,
    conservationStatus: 'Unknown',
    conservationAssessment: { authority: null, assessmentUrl: null, assessedAt: null },
    rarity,
    xp: XP_BY_RARITY[rarity],
    record: { ...EMPTY_RECORD, note: 'A legacy record string existed without a source citation and has been withheld.' },
    sources: [],
    dataQuality: 'partial',
    notes: 'Imported from the app’s legacy catalogue. Distribution and angling guidance should be independently checked.',
  };
});

const discoverySpecies: FishSpecies[] = CATALOGUE_GROUPS.flatMap((group) =>
  group.entries.trim().split('\n').map((line) => {
    const [commonName, scientificName] = line.split('|');
    return {
      id: `catalogue-${slugify(scientificName)}-${slugify(commonName)}`,
      commonName,
      scientificName,
      alternateNames: [],
      regions: group.regions,
      waterType: group.waterType,
      habitats: group.habitats,
      bestBaits: group.bestBaits,
      seasons: group.seasons,
      conservationStatus: 'Unknown' as const,
      conservationAssessment: { authority: null, assessmentUrl: null, assessedAt: null },
      rarity: 'uncommon' as const,
      xp: XP_BY_RARITY.uncommon,
      record: { ...EMPTY_RECORD },
      sources: [
        { label: 'Catalog of Fishes — taxonomy reference', url: 'https://researcharchive.calacademy.org/research/ichthyology/catalog/fishcatmain.asp', scope: 'taxonomy' as const },
        { label: 'FishBase — species reference directory', url: 'https://www.fishbase.se/search.php', scope: 'general' as const },
      ],
      dataQuality: 'catalogue-only' as const,
      notes: 'Catalogue profile: broad habitat, bait and season guidance is regional, not stock-specific. Check local rules before fishing.',
    };
  }),
);

// Deduplicate the combined catalogue by scientific + common name. Different commonly named
// populations can remain distinct, while exact legacy/discovery duplicates collapse safely.
const seen = new Set<string>();
export const FISH_DATABASE: FishSpecies[] = [...legacySpecies, ...discoverySpecies]
  .filter((fish) => {
    const key = `${fish.scientificName.toLowerCase()}|${fish.commonName.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .sort((a, b) => a.commonName.localeCompare(b.commonName));

export const FISH_REGIONS: FishRegion[] = [
  'UK & Ireland', 'Europe', 'North America', 'Australia', 'New Zealand',
  'South Africa', 'Japan', 'Amazon', 'India', 'Atlantic Ocean', 'Pacific Ocean',
  'Indian Ocean', 'Arctic Ocean', 'Southern Ocean', 'Worldwide',
];

export function getFishById(id: string) {
  return FISH_DATABASE.find((fish) => fish.id === id || fish.id === `legacy-${id}`) ?? null;
}

export function getFishByName(name: string) {
  const query = name.trim().toLocaleLowerCase();
  if (!query) return null;
  return FISH_DATABASE.find((fish) =>
    fish.commonName.toLocaleLowerCase() === query
    || fish.alternateNames.some((alternate) => alternate.toLocaleLowerCase() === query)
  ) ?? FISH_DATABASE.find((fish) => {
    const commonName = fish.commonName.toLocaleLowerCase();
    return commonName.includes(query) || query.includes(commonName);
  }) ?? null;
}

export function filterFish(filters: FishFilters = {}) {
  const query = filters.query?.trim().toLocaleLowerCase() ?? '';
  return FISH_DATABASE.filter((fish) => {
    if (filters.region && filters.region !== 'all' && !fish.regions.includes(filters.region)) return false;
    if (filters.waterType && filters.waterType !== 'all' && fish.waterType !== filters.waterType) return false;
    if (filters.rarity && filters.rarity !== 'all' && fish.rarity !== filters.rarity) return false;
    if (filters.conservationStatus && filters.conservationStatus !== 'all' && fish.conservationStatus !== filters.conservationStatus) return false;
    if (filters.recordStatus && filters.recordStatus !== 'all' && fish.record.status !== filters.recordStatus) return false;
    if (!query) return true;
    const haystack = [fish.commonName, fish.scientificName, ...fish.alternateNames, ...fish.regions, ...fish.habitats].join(' ').toLocaleLowerCase();
    return haystack.includes(query);
  });
}

export function getFishDatabaseStats() {
  return {
    total: FISH_DATABASE.length,
    regions: new Set(FISH_DATABASE.flatMap((fish) => fish.regions)).size,
    verifiedRecords: FISH_DATABASE.filter((fish) => fish.record.status === 'verified').length,
    sourcedProfiles: FISH_DATABASE.filter((fish) => fish.sources.length > 0).length,
  };
}
