export interface CommunityPost {
  id: string;
  username: string;
  userEmoji: string;
  species: string;
  weight: number;
  weightDisplay: string;
  location: string;
  description: string;
  timestamp: string;
  likes: number;
  liked: boolean;
  bait: string;
  photoEmoji: string;
  isNearby?: boolean;
}

const now = Date.now();
const h = (hrs: number) => new Date(now - hrs * 60 * 60 * 1000).toISOString();

export const COMMUNITY_POSTS: CommunityPost[] = [
  { id: 'c1', username: 'CarpKing_Dave', userEmoji: '👑', species: 'Carp', weight: 24.8, weightDisplay: '24lb 13oz', location: 'Yateley North Lake', description: 'New personal best! Mirror took the boilie at 2am. Absolutely stunned. First 20+ for me!', timestamp: h(2), likes: 47, liked: false, bait: 'Squid boilie', photoEmoji: '🐟', isNearby: true },
  { id: 'c2', username: 'PikeHunter_Sam', userEmoji: '🦷', species: 'Pike', weight: 18.2, weightDisplay: '18lb 3oz', location: 'Broads, Norfolk', description: 'Deadbait float rig on the edge of the reed bed. Took 20 mins to land — absolute beast.', timestamp: h(5), likes: 89, liked: false, bait: 'Half mackerel', photoEmoji: '🦷' },
  { id: 'c3', username: 'TroutLady_Beth', userEmoji: '🌊', species: 'Brown Trout', weight: 3.4, weightDisplay: '3lb 6oz', location: 'River Test, Hampshire', description: 'Gorgeous wild brownie on a CDC dry fly. Released in perfect condition. The rise was stunning!', timestamp: h(8), likes: 63, liked: false, bait: 'CDC dry fly', photoEmoji: '🐠', isNearby: false },
  { id: 'c4', username: 'BarbelBoy', userEmoji: '💪', species: 'Barbel', weight: 12.1, weightDisplay: '12lb 2oz', location: 'River Severn', description: 'Summer barbel in full fighting form. Took 10 mins in the fast water. Pellet feeder rig.', timestamp: h(12), likes: 34, liked: false, bait: 'Halibut pellets', photoEmoji: '🐡', isNearby: true },
  { id: 'c5', username: 'PerchPro_Mark', userEmoji: '🎯', species: 'Perch', weight: 2.1, weightDisplay: '2lb 2oz', location: 'Grand Union Canal', description: 'New PB perch on the drop shot! This canal is fishing brilliantly right now.', timestamp: h(18), likes: 28, liked: false, bait: 'Soft plastic shad', photoEmoji: '🎣', isNearby: true },
  { id: 'c6', username: 'TenchTom', userEmoji: '🌿', species: 'Tench', weight: 6.8, weightDisplay: '6lb 13oz', location: 'Farlows Lake', description: 'Early morning tench session. 3 fish before 8am — all on corn and worm cocktail. Magic.', timestamp: h(24), likes: 55, liked: false, bait: 'Corn & worm', photoEmoji: '🟢' },
  { id: 'c7', username: 'SeaBass_Steve', userEmoji: '🌊', species: 'Sea Bass', weight: 4.2, weightDisplay: '4lb 3oz', location: 'Chesil Beach', description: 'Shore caught bass at dusk on a sandeel lure. Third session here this week — worth it!', timestamp: h(30), likes: 71, liked: false, bait: 'Sandeel lure', photoEmoji: '🌊' },
  { id: 'c8', username: 'RoachRuler', userEmoji: '🔴', species: 'Roach', weight: 1.8, weightDisplay: '1lb 13oz', location: 'River Wye', description: 'Stunning roach on bread punch float fishing. Crystal clear water made it a real challenge.', timestamp: h(36), likes: 19, liked: false, bait: 'Bread punch', photoEmoji: '🔴' },
  { id: 'c9', username: 'ZanderZach', userEmoji: '🦈', species: 'Zander', weight: 8.9, weightDisplay: '8lb 14oz', location: 'Relief Channel, Norfolk', description: 'Dusk session produced this cracking zander. Used a small roach deadbait on a wire trace.', timestamp: h(42), likes: 44, liked: false, bait: 'Roach deadbait', photoEmoji: '🐟', isNearby: false },
  { id: 'c10', username: 'SalmonSusan', userEmoji: '🐟', species: 'Salmon', weight: 15.5, weightDisplay: '15lb 8oz', location: 'River Tay, Scotland', description: 'Atlantic salmon on a size 8 Cascade tube fly. Incredible fight — took 25 minutes to land!', timestamp: h(48), likes: 112, liked: false, bait: 'Cascade tube fly', photoEmoji: '🐠' },
  { id: 'c11', username: 'ChubChamp_Gary', userEmoji: '🌊', species: 'Chub', weight: 5.2, weightDisplay: '5lb 3oz', location: 'River Avon', description: 'Monster chub on a free-lined crust. She was rising to the crust for 20 mins before I cast!', timestamp: h(54), likes: 38, liked: false, bait: 'Bread crust', photoEmoji: '🟡', isNearby: true },
  { id: 'c12', username: 'BreamBuster_Phil', userEmoji: '🫧', species: 'Bream', weight: 9.4, weightDisplay: '9lb 6oz', location: 'Windermere', description: 'Festival bream on a method feeder packed with groundbait. The swim was alive with bubbles!', timestamp: h(60), likes: 27, liked: false, bait: 'Method feeder', photoEmoji: '🫧' },
  { id: 'c13', username: 'EelElla', userEmoji: '🐍', species: 'Eel', weight: 3.1, weightDisplay: '3lb 2oz', location: 'River Thames', description: 'Accidental eel on a worm rig targeting bream. Took ages to unhook safely. Amazing fight though!', timestamp: h(66), likes: 15, liked: false, bait: 'Lobworm', photoEmoji: '🐍' },
  { id: 'c14', username: 'TroutMaster_Joe', userEmoji: '🎣', species: 'Rainbow Trout', weight: 5.8, weightDisplay: '5lb 13oz', location: 'Avington Trout Fishery', description: 'Stocked rainbow on a Damsel nymph in the deep channel. Went like a rocket on light tackle!', timestamp: h(72), likes: 41, liked: false, bait: 'Damsel nymph', photoEmoji: '🌈' },
  { id: 'c15', username: 'DaceDay_Rob', userEmoji: '💨', species: 'Dace', weight: 0.52, weightDisplay: '9oz', location: 'River Kennet', description: 'Beautiful dace on a size 18 hook and single maggot. This river is packed with them!', timestamp: h(78), likes: 22, liked: false, bait: 'Single maggot', photoEmoji: '🔵' },
];

export const LEADERBOARD_DATA = [
  { rank: 1, username: 'CarpKing_Dave', catches: 47, biggestFish: '24lb 13oz Carp', emoji: '👑' },
  { rank: 2, username: 'PikeHunter_Sam', catches: 39, biggestFish: '18lb 3oz Pike', emoji: '🦷' },
  { rank: 3, username: 'TroutLady_Beth', catches: 35, biggestFish: '3lb 6oz Trout', emoji: '🌊' },
  { rank: 4, username: 'BarbelBoy', catches: 31, biggestFish: '12lb 2oz Barbel', emoji: '💪' },
  { rank: 5, username: 'SalmonSusan', catches: 28, biggestFish: '15lb 8oz Salmon', emoji: '🐟' },
];

export const TOP_SPOTS_WEEK = [
  { name: 'Yateley North Lake', catches: 156, species: 'Carp', emoji: '🏆' },
  { name: 'River Thames, Pangbourne', catches: 98, species: 'Barbel', emoji: '🥈' },
  { name: 'Broads, Norfolk', catches: 87, species: 'Pike', emoji: '🥉' },
  { name: 'Chesil Beach', catches: 72, species: 'Sea Bass', emoji: '4️⃣' },
  { name: 'River Test', catches: 61, species: 'Brown Trout', emoji: '5️⃣' },
];
