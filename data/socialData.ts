export type ReactionType = 'like' | 'wow' | 'fire' | 'congrats';

export interface ReactionCounts {
  like: number;
  wow: number;
  fire: number;
  congrats: number;
}

export interface SocialUser {
  id: string;
  name: string;
  handle: string;
  country: string;
  countryCode: string;
  avatarColor: string;
  level: number;
  catchCount: number;
  topSpecies: string;
  streak: number;
  isOnline: boolean;
  lastActive: string;
  mutualFriends: number;
  isDemo: true;
}

export interface SocialCatchPost {
  id: string;
  userId: string;
  species: string;
  weightDisplay: string;
  location: string;
  countryCode: string;
  bait: string;
  caption: string;
  caughtAt: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  reactions: ReactionCounts;
  isDemo: true;
}

export interface FriendSessionPin {
  id: string;
  friendId: string;
  friendName: string;
  latitude: number;
  longitude: number;
  locationLabel: string;
  targetSpecies: string[];
  startedAt: string;
  expiresAt: string;
  visibility: 'friends';
  isDemo: true;
}

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();
const minutesFromNow = (minutes: number) =>
  new Date(Date.now() + minutes * 60_000).toISOString();

export const DEMO_SOCIAL_USERS: SocialUser[] = [
  { id: 'demo-aiko', name: 'Aiko Tanaka', handle: '@aiko_casts', country: 'Japan', countryCode: 'JP', avatarColor: '#EF476F', level: 42, catchCount: 318, topSpecies: 'Japanese sea bass', streak: 8, isOnline: true, lastActive: 'Now', mutualFriends: 4, isDemo: true },
  { id: 'demo-luca', name: 'Luca Moretti', handle: '@luca_lures', country: 'Italy', countryCode: 'IT', avatarColor: '#4D96FF', level: 31, catchCount: 224, topSpecies: 'Bluefin tuna', streak: 3, isOnline: false, lastActive: '24m ago', mutualFriends: 2, isDemo: true },
  { id: 'demo-amara', name: 'Amara Dlamini', handle: '@amara_on_water', country: 'South Africa', countryCode: 'ZA', avatarColor: '#9B5DE5', level: 37, catchCount: 276, topSpecies: 'Garrick', streak: 11, isOnline: true, lastActive: 'Now', mutualFriends: 5, isDemo: true },
  { id: 'demo-noah', name: 'Noah Williams', handle: '@noah_tides', country: 'New Zealand', countryCode: 'NZ', avatarColor: '#00B894', level: 28, catchCount: 191, topSpecies: 'Snapper', streak: 5, isOnline: true, lastActive: 'Now', mutualFriends: 3, isDemo: true },
  { id: 'demo-maya', name: 'Maya Brooks', handle: '@maya_flywater', country: 'United States', countryCode: 'US', avatarColor: '#F4A261', level: 35, catchCount: 249, topSpecies: 'Rainbow trout', streak: 6, isOnline: false, lastActive: '1h ago', mutualFriends: 6, isDemo: true },
  { id: 'demo-ravi', name: 'Ravi Menon', handle: '@ravi_riverlines', country: 'India', countryCode: 'IN', avatarColor: '#2A9D8F', level: 24, catchCount: 143, topSpecies: 'Golden mahseer', streak: 4, isOnline: false, lastActive: '2h ago', mutualFriends: 1, isDemo: true },
  { id: 'demo-sofia', name: 'Sofia Almeida', handle: '@sofia_amazon', country: 'Brazil', countryCode: 'BR', avatarColor: '#E9C46A', level: 39, catchCount: 302, topSpecies: 'Peacock bass', streak: 9, isOnline: true, lastActive: 'Now', mutualFriends: 4, isDemo: true },
  { id: 'demo-jack', name: 'Jack Nguyen', handle: '@jack_reef', country: 'Australia', countryCode: 'AU', avatarColor: '#00A8E8', level: 33, catchCount: 238, topSpecies: 'Barramundi', streak: 7, isOnline: false, lastActive: '46m ago', mutualFriends: 2, isDemo: true },
];

export const DEMO_SOCIAL_POSTS: SocialCatchPost[] = [
  { id: 'post-aiko', userId: 'demo-aiko', species: 'Japanese sea bass', weightDisplay: '4.8 kg', location: 'Tokyo Bay', countryCode: 'JP', bait: 'Sinking minnow', caption: 'Silver flash under the harbour lights. Quick photo, then safely released.', caughtAt: minutesAgo(18), rarity: 'Rare', reactions: { like: 84, wow: 21, fire: 15, congrats: 9 }, isDemo: true },
  { id: 'post-amara', userId: 'demo-amara', species: 'Garrick', weightDisplay: '11.2 kg', location: 'Durban North Coast', countryCode: 'ZA', bait: 'Live shad', caption: 'A long run and a clean release. The sunrise session delivered.', caughtAt: minutesAgo(47), rarity: 'Epic', reactions: { like: 132, wow: 38, fire: 44, congrats: 26 }, isDemo: true },
  { id: 'post-noah', userId: 'demo-noah', species: 'Snapper', weightDisplay: '7.1 kg', location: 'Hauraki Gulf', countryCode: 'NZ', bait: 'Soft-bait', caption: 'Found this beauty holding on the edge of the reef.', caughtAt: minutesAgo(86), rarity: 'Rare', reactions: { like: 76, wow: 18, fire: 11, congrats: 14 }, isDemo: true },
  { id: 'post-sofia', userId: 'demo-sofia', species: 'Peacock bass', weightDisplay: '6.4 kg', location: 'Rio Negro', countryCode: 'BR', bait: 'Topwater plug', caption: 'One explosive surface strike. These colours never get old.', caughtAt: minutesAgo(142), rarity: 'Epic', reactions: { like: 164, wow: 51, fire: 62, congrats: 31 }, isDemo: true },
  { id: 'post-maya', userId: 'demo-maya', species: 'Rainbow trout', weightDisplay: '2.3 kg', location: 'Madison River, Montana', countryCode: 'US', bait: 'Pheasant-tail nymph', caption: 'A careful drift through the seam and this wild rainbow obliged.', caughtAt: minutesAgo(215), rarity: 'Uncommon', reactions: { like: 59, wow: 12, fire: 8, congrats: 7 }, isDemo: true },
  { id: 'post-ravi', userId: 'demo-ravi', species: 'Golden mahseer', weightDisplay: '9.6 kg', location: 'Cauvery River', countryCode: 'IN', bait: 'Crankbait', caption: 'A powerful river fish, rested fully before release.', caughtAt: minutesAgo(303), rarity: 'Legendary', reactions: { like: 201, wow: 73, fire: 55, congrats: 49 }, isDemo: true },
];

export const DEMO_SESSION_PINS: FriendSessionPin[] = [
  { id: 'session-aiko', friendId: 'demo-aiko', friendName: 'Aiko Tanaka', latitude: 35.4437, longitude: 139.638, locationLabel: 'Tokyo Bay', targetSpecies: ['Japanese sea bass'], startedAt: minutesAgo(42), expiresAt: minutesFromNow(138), visibility: 'friends', isDemo: true },
  { id: 'session-amara', friendId: 'demo-amara', friendName: 'Amara Dlamini', latitude: -29.8587, longitude: 31.0218, locationLabel: 'Durban North Coast', targetSpecies: ['Garrick', 'Kob'], startedAt: minutesAgo(65), expiresAt: minutesFromNow(95), visibility: 'friends', isDemo: true },
  { id: 'session-noah', friendId: 'demo-noah', friendName: 'Noah Williams', latitude: -36.6302, longitude: 174.802, locationLabel: 'Hauraki Gulf', targetSpecies: ['Snapper', 'Kingfish'], startedAt: minutesAgo(27), expiresAt: minutesFromNow(173), visibility: 'friends', isDemo: true },
];

export const SOCIAL_USERS_BY_ID = new Map(DEMO_SOCIAL_USERS.map((user) => [user.id, user]));
