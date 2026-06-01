export interface KnotStep {
  instruction: string;
  tip?: string;
}

export interface Knot {
  id: string;
  name: string;
  useCase: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  strengthRating: number;
  steps: KnotStep[];
  usedFor: string[];
  tags: string[];
  emoji: string;
}

export const knots: Knot[] = [
  {
    id: 'palomar',
    name: 'Palomar Knot',
    useCase: 'Tying hooks, swivels, and lures to braided or mono line',
    difficulty: 'beginner',
    strengthRating: 9,
    steps: [
      { instruction: 'Double 15cm of line and pass the doubled loop through the hook eye', tip: 'Wet the line before tightening for maximum strength' },
      { instruction: 'Tie a simple overhand knot using the doubled line, leaving the hook dangling in the loop' },
      { instruction: 'Pass the entire hook through the loop at the end of the doubled line' },
      { instruction: 'Hold the hook and pull both tag ends to tighten, then trim the tag end', tip: 'Pull slowly and evenly to seat the knot correctly' },
    ],
    usedFor: ['Hook to line', 'Swivel to line', 'Lure to line', 'Braided line', 'Fluorocarbon'],
    tags: ['simple', 'strong', 'all-round', 'recommended'],
    emoji: '🪢',
  },
  {
    id: 'blood-knot',
    name: 'Blood Knot',
    useCase: 'Joining two lines of similar diameter together',
    difficulty: 'intermediate',
    strengthRating: 8,
    steps: [
      { instruction: 'Overlap the two lines for about 15cm, with ends pointing in opposite directions' },
      { instruction: 'Take one tag end and wrap it around the other line 5-7 times', tip: 'More wraps = stronger knot for lighter lines' },
      { instruction: 'Pass the tag end back through the gap between the two lines in the middle' },
      { instruction: 'Repeat steps 2-3 with the other tag end, passing through the same central gap from the opposite side' },
      { instruction: 'Wet both sides, hold at the wraps, and pull both main lines simultaneously to tighten', tip: 'Pull slowly - rushing will cause the knot to slip' },
      { instruction: 'Trim both tag ends close to the knot' },
    ],
    usedFor: ['Joining line to trace', 'Making droppers', 'Line repairs', 'Tapering leaders'],
    tags: ['joining', 'leader', 'fly fishing'],
    emoji: '🔗',
  },
  {
    id: 'uni-knot',
    name: 'Uni Knot',
    useCase: 'Versatile knot for tying terminal tackle or joining lines',
    difficulty: 'beginner',
    strengthRating: 8,
    steps: [
      { instruction: 'Thread the line through the hook eye and double back parallel to the main line, creating a loop' },
      { instruction: 'Take the tag end and make 4-6 wraps around both the doubled line and through the loop' },
      { instruction: 'Wet the knot and pull the tag end to tighten the coils', tip: 'Use 6 wraps for light lines (under 8lb), 4 wraps for heavier lines' },
      { instruction: 'Slide the knot down to the eye of the hook by pulling the main line' },
      { instruction: 'Trim the tag end close to the coils' },
    ],
    usedFor: ['Hook to line', 'Line joining (double uni)', 'Swivel connection', 'Fluorocarbon leaders'],
    tags: ['versatile', 'simple', 'reliable', 'all-round'],
    emoji: '🎯',
  },
  {
    id: 'clinch-knot',
    name: 'Improved Clinch Knot',
    useCase: 'Classic knot for tying hooks and swivels to monofilament',
    difficulty: 'beginner',
    strengthRating: 7,
    steps: [
      { instruction: 'Thread 15cm of line through the hook eye' },
      { instruction: 'Make 5-7 turns around the main line away from the hook' },
      { instruction: 'Pass the tag end back through the small loop nearest the eye, then through the large loop just formed', tip: 'This "improved" step significantly increases strength' },
      { instruction: 'Wet the knot and pull the main line while holding the tag end to tighten' },
      { instruction: 'Snug the knot down to the hook eye and trim the tag end' },
    ],
    usedFor: ['Hook to monofilament', 'Swivel attachment', 'Light tackle', 'Float fishing'],
    tags: ['classic', 'mono', 'beginner', 'hook'],
    emoji: '🔒',
  },
  {
    id: 'loop-knot',
    name: 'Non-Slip Loop Knot',
    useCase: 'Creates a loop that gives lures and flies free movement',
    difficulty: 'intermediate',
    strengthRating: 8,
    steps: [
      { instruction: 'Tie an overhand knot in the line about 10cm from the end, do not tighten' },
      { instruction: 'Pass the tag end through the lure/hook eye' },
      { instruction: 'Bring the tag end back through the overhand knot from the same direction it left' },
      { instruction: 'Wrap the tag end around the main line 4-5 times towards the lure', tip: 'More wraps for lighter line' },
      { instruction: 'Pass the tag end back through the overhand knot again' },
      { instruction: 'Wet and tighten by pulling both the main line and the tag end while pinching the loop size', tip: 'Pinch the loop to your desired size as you tighten' },
    ],
    usedFor: ['Lure fishing', 'Fly fishing', 'Plug connection', 'Soft plastic lures'],
    tags: ['loop', 'lure', 'action', 'plug'],
    emoji: '🔄',
  },
  {
    id: 'albright',
    name: 'Albright Knot',
    useCase: 'Joining braided line to monofilament leader',
    difficulty: 'expert',
    strengthRating: 9,
    steps: [
      { instruction: 'Bend the heavier line back on itself to form a loop, hold the loop between thumb and forefinger' },
      { instruction: 'Insert the lighter line through the loop from below, leaving 25cm of tag end' },
      { instruction: 'Wrap the tag end back over the doubled heavy line, working from front to back, for 10-12 tight wraps', tip: 'Keep wraps tight and even - gaps weaken the knot' },
      { instruction: 'Pass the tag end back through the loop on the same side it entered' },
      { instruction: 'Pull on the main light line to slide the wraps toward the end of the heavy line loop' },
      { instruction: 'Wet thoroughly and pull all four strands simultaneously to tighten', tip: 'This knot must be pulled very tight to not slip under load' },
      { instruction: 'Trim tag ends and optionally add a drop of super glue' },
    ],
    usedFor: ['Braid to leader', 'Line class connection', 'Sea fishing', 'Lure fishing leaders'],
    tags: ['braid', 'leader', 'sea fishing', 'lure'],
    emoji: '⚡',
  },
  {
    id: 'surgeons-knot',
    name: "Surgeon's Knot",
    useCase: 'Quick and reliable method for joining two lines',
    difficulty: 'beginner',
    strengthRating: 8,
    steps: [
      { instruction: 'Lay the two lines parallel to each other, overlapping by about 20cm' },
      { instruction: 'Treating both lines as one, tie a simple overhand knot but do not pull tight - leave a large loop' },
      { instruction: 'Pass both the tag end AND the short section of the other line through the loop again', tip: 'Two passes through the loop makes it the "double surgeon\'s knot"' },
      { instruction: 'Wet all parts of the knot thoroughly' },
      { instruction: 'Hold all four strands and pull simultaneously to tighten evenly' },
      { instruction: 'Trim both tag ends close to the knot' },
    ],
    usedFor: ['Leader connection', 'Dropper addition', 'Fly fishing', 'Quick repairs'],
    tags: ['quick', 'reliable', 'leader', 'joining'],
    emoji: '✂️',
  },
  {
    id: 'snell-knot',
    name: 'Snell Knot',
    useCase: 'Traditional knot that aligns hook for straight pulls',
    difficulty: 'intermediate',
    strengthRating: 9,
    steps: [
      { instruction: 'Pass the line through the hook eye from the front and down alongside the shank, leave a generous loop alongside the shank' },
      { instruction: 'Hold the loop open and begin wrapping the tag end around both the shank and the line, working upward toward the eye', tip: 'Keep wraps very tight and close together' },
      { instruction: 'Make 7-10 wraps upward toward the eye of the hook' },
      { instruction: 'Pass the tag end through the hook eye from front to back' },
      { instruction: 'Wet the knot and pull the main line slowly to tighten - the coils should slide toward the eye' },
      { instruction: 'Hold the hook bend and pull firmly on the main line, then trim the tag end' },
    ],
    usedFor: ['Traditional bait fishing', 'Worm rigs', 'Bait alignment', 'Sea fishing hooks'],
    tags: ['traditional', 'bait', 'hook alignment', 'strength'],
    emoji: '🪝',
  },
];
