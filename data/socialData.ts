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
}

export const DEMO_SOCIAL_USERS: SocialUser[] = [];
export const DEMO_SOCIAL_POSTS: SocialCatchPost[] = [];
export const DEMO_SESSION_PINS: FriendSessionPin[] = [];

export const SOCIAL_USERS_BY_ID = new Map(DEMO_SOCIAL_USERS.map((user) => [user.id, user]));
