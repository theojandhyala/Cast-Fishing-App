export interface GearItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  purchaseDate: string;
  condition: number; // 1-5
  notes: string;
  isWishlist: boolean;
  estimatedValue: number; // GBP
}

export const GEAR_CATEGORIES = [
  { id: 'rods', name: 'Rods', emoji: '🎣', color: '#00D4AA' },
  { id: 'reels', name: 'Reels', emoji: '⚙️', color: '#60A5FA' },
  { id: 'lines', name: 'Lines', emoji: '🧵', color: '#F59E0B' },
  { id: 'hooks', name: 'Hooks', emoji: '🪝', color: '#EF4444' },
  { id: 'lures', name: 'Lures', emoji: '✨', color: '#A78BFA' },
  { id: 'bait', name: 'Bait & Tackle', emoji: '🐛', color: '#10B981' },
  { id: 'terminal', name: 'Terminal Tackle', emoji: '⚓', color: '#9CA3AF' },
  { id: 'clothing', name: 'Clothing', emoji: '🧥', color: '#F97316' },
  { id: 'electronics', name: 'Electronics', emoji: '📡', color: '#06B6D4' },
  { id: 'accessories', name: 'Accessories', emoji: '🎒', color: '#84CC16' },
];

export const DEFAULT_GEAR: GearItem[] = [
  {
    id: 'gear1',
    name: 'Main Rod',
    brand: 'Daiwa',
    model: 'Infinity X Carp 12ft 3.25lb',
    category: 'rods',
    purchaseDate: '2023-03-15',
    condition: 4,
    notes: 'Great all-round carp rod, brilliant action',
    isWishlist: false,
    estimatedValue: 180,
  },
  {
    id: 'gear2',
    name: 'Main Reel',
    brand: 'Shimano',
    model: 'Baitrunner DL 6000 RB',
    category: 'reels',
    purchaseDate: '2023-03-15',
    condition: 4,
    notes: 'Needs oil every 3 months. Last serviced Jan 2024.',
    isWishlist: false,
    estimatedValue: 120,
  },
  {
    id: 'gear3',
    name: 'Main Line',
    brand: 'Korda',
    model: 'Subline 15lb',
    category: 'lines',
    purchaseDate: '2024-01-10',
    condition: 3,
    notes: '300m, replace end of season',
    isWishlist: false,
    estimatedValue: 18,
  },
  {
    id: 'gear4',
    name: 'Hair Rig Hooks',
    brand: 'Korda',
    model: 'Wide Gape Size 6',
    category: 'hooks',
    purchaseDate: '2024-02-01',
    condition: 5,
    notes: 'Pack of 10, super sharp',
    isWishlist: false,
    estimatedValue: 5,
  },
  {
    id: 'gear5',
    name: 'Bite Alarms',
    brand: 'Delkim',
    model: 'Txi-D',
    category: 'electronics',
    purchaseDate: '2022-06-20',
    condition: 4,
    notes: 'Set of 3, excellent sensitivity',
    isWishlist: false,
    estimatedValue: 280,
  },
  {
    id: 'gear6',
    name: 'Dream Rod',
    brand: 'Nash',
    model: 'Scope Abbreviated 9ft 3.5lb TC',
    category: 'rods',
    purchaseDate: '',
    condition: 5,
    notes: 'Really want this for close-range work',
    isWishlist: true,
    estimatedValue: 250,
  },
];

export const GEAR_CHECKLIST_DEFAULT = [
  { id: 'rod', label: 'Rod(s)', checked: false, emoji: '🎣' },
  { id: 'reel', label: 'Reel(s)', checked: false, emoji: '⚙️' },
  { id: 'line', label: 'Mainline', checked: false, emoji: '🧵' },
  { id: 'hooks', label: 'Hooks', checked: false, emoji: '🪝' },
  { id: 'bait', label: 'Bait', checked: false, emoji: '🐛' },
  { id: 'licence', label: 'Rod Licence', checked: false, emoji: '📄' },
  { id: 'landing-net', label: 'Landing Net', checked: false, emoji: '🕸️' },
  { id: 'mat', label: 'Unhooking Mat', checked: false, emoji: '🛏️' },
  { id: 'scales', label: 'Weighing Scales', checked: false, emoji: '⚖️' },
  { id: 'camera', label: 'Camera / Phone', checked: false, emoji: '📸' },
  { id: 'lead', label: 'Leads & Feeders', checked: false, emoji: '🔩' },
  { id: 'rig', label: 'Pre-tied Rigs', checked: false, emoji: '🪢' },
  { id: 'scissors', label: 'Scissors / Knife', checked: false, emoji: '✂️' },
  { id: 'forceps', label: 'Forceps / Unhooker', checked: false, emoji: '🔧' },
  { id: 'food', label: 'Food & Drink', checked: false, emoji: '🥪' },
];
