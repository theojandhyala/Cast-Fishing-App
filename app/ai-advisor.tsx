import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCatchStore } from '../store/catchStore';
import { useLocationStore } from '../store/locationStore';
import { CONFIG } from '../constants/config';
import { colors, spacing, radius } from '../constants/theme';
import { useProStore } from '../store/proStore';
import { useAuthStore } from '../store/authStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const QUICK_QUESTIONS = [
  "Best bait for carp right now?",
  "Why am I missing bites?",
  "How do I read the water?",
  "Best time to fish today?",
  "What's a good beginner rig?",
  "How do I hold a pike safely?",
];

const CANNED_RESPONSES: Record<string, { content: string; suggestions: string[] }> = {
  'biting': {
    content: "Based on the current conditions and time of year, **Carp and Tench** are your best bet right now. They're most active during warm, overcast days with light south-westerly winds — perfect for the current pressure system.\n\n**Top picks for today:**\n• Carp — active at dawn and dusk, try boilies near margins\n• Tench — feeding hard before summer spawning, worm & corn combo\n• Barbel — if you're on a river, pellets on a feeder in the current\n\nAvoid open water — fish will be tucked tight to features today.",
    suggestions: ["Best bait for carp right now?", "Where should I fish?", "What rig for tench?"],
  },
  'carp': {
    content: "**Carp Fishing — Complete Guide:**\n\nThe **hair rig** is the go-to setup. Carp are cautious and will eject a bait if they feel resistance — the hair presents the bait separate from the hook so the fish hooks itself.\n\n**Recommended setup:**\n• Hook: Size 6-8 Wide Gape\n• Line: 15lb fluorocarbon hooklink, 8-10cm\n• Lead: 2-3oz inline lead (self-hooking)\n• Bait: 18mm shelf-life boilie, fruit or fishmeal\n\n**Winter carp:** Slow down your approach. Use single bright pop-ups on a chod rig over clean gravel. Fish at range in deeper water where temperatures are more stable.\n\n**Pro tip:** Pop the bait up 1cm off the bottom using a piece of foam — this avoids silty areas where the fish can't find it.",
    suggestions: ["Best boilies for carp?", "How long should my hooklink be?", "Chod rig setup?"],
  },
  'today': {
    content: "**Today's Fishing Score: 72/100 — Good conditions!**\n\n**What's working in your favour:**\n• Pressure stable at 1016mb (rising slightly)\n• Overcast cloud cover — fish feel confident\n• SW wind bringing warm surface water\n• Temperature 14°C — good activity level\n\n**Challenges:**\n• Wind increasing to 15mph by afternoon\n• Rain possible after 3pm\n\n**Best windows today:**\n• 6:30–9:00am — Major feed (dawn feeding)\n• 12:00–1:30pm — Minor feed\n• 7:00–9:00pm — Evening feeding window\n\n**Verdict:** Get out early — conditions are best before noon.",
    suggestions: ["What species should I target?", "Best spots for today?", "What about tomorrow?"],
  },
  'barbel': {
    content: "**Barbel River Tactics:**\n\nBarbel love fast, oxygenated water — gravelly runs, weirpools, and deep creases are prime spots.\n\n**Best baits (ranked):**\n1. Halibut pellets (8-15mm) — almost irresistible\n2. Luncheon meat (1.5cm cubes) — deadly in summer\n3. Hemp + sweetcorn — great for building a swim\n4. Paste wrapped around the hook — superb in warm water\n\n**Rig:** Method feeder or straight lead with short 3-4\" hooklink. Use a size 8-10 hook.\n\n**When:** Peak feeding is at dusk and into darkness. Summer evenings on a river are magical — barbel often feed well into the night in warm weather.",
    suggestions: ["What size hook for barbel?", "Night fishing tips?", "Best barbel rivers in the UK?"],
  },
  'hair': {
    content: "**Hair Rig — Step by Step:**\n\n1. Cut 25cm of hooklink material (fluorocarbon works great)\n2. Thread the line through the hook eye and tie an overhand loop at the end — this is the hair\n3. The loop should extend ~1.5cm below the hook bend\n4. Tie the line to the hook using a knotless knot — 8 turns down the shank, then back through the eye\n5. Thread your bait onto a baiting needle, then hook it onto the hair loop\n6. Secure with a bait stop\n\n**Key measurements:**\n• Hair length: 1-1.5cm below hook bend\n• Hooklink: 6-12cm for wary fish, longer in snaggy swims\n\nWant me to explain any step in more detail?",
    suggestions: ["What hooklink material to use?", "Knotless knot vs palomar?", "How to use a bait stop?"],
  },
  'season': {
    content: "**UK Fishing Closed Seasons:**\n\n**Coarse fish on rivers:**\n15th March to 15th June (inclusive) — protects fish during spawning season.\n\n**Still waters (lakes, reservoirs, canals):**\nNo closed season for most coarse species. Individual fisheries may impose their own rules.\n\n**Salmon & Sea Trout:**\nVaries by river — check EA for your specific river. Typically autumn through winter.\n\n**Trout:**\nOctober to March on most rivers. Stillwater trout fisheries often open year-round.\n\n**Always:** Check your specific water's rules, ensure your EA rod licence is valid, and respect any local bylaws.",
    suggestions: ["Do I need a rod licence?", "What can I catch right now?", "Where to buy a rod licence?"],
  },
  'pike': {
    content: "**Pike Fishing Guide:**\n\nPike are apex predators — and deserve careful handling.\n\n**How to hold a pike safely:**\n1. Wet your hands first — never handle dry\n2. Support the belly with one hand\n3. Use your other hand to hold the lower jaw with fingers (never put fingers near the gill rakers)\n4. Keep the fish horizontal and close to the ground or unhooking mat\n5. Use long-nose pliers or forceps to remove treble hooks\n6. Return the pike quickly — they tire fast out of water\n\n**Pike traces:** Always use a wire trace (20-30lb multi-strand wire) — pike teeth will cut through mono or fluorocarbon instantly.\n\n**Best baits:** Deadbaits (mackerel, smelt, roach), large spinners, jerk baits, rubber shads in bright colours.",
    suggestions: ["Best pike lures?", "Wire trace setup?", "Best time to fish for pike?"],
  },
  'bait': {
    content: "**Bait Selection — Match the Hatch:**\n\n**Spring/Autumn (naturals work best):**\n• Lobworms and dendrobenas — deadly for most species\n• Maggots and casters — perch, roach, bream\n• Slugs and snails — big chub on rivers\n\n**Summer (high-attract baits):**\n• Boilies and pellets — carp and barbel\n• Corn and hemp — versatile groundbait attractor\n• Bread punch — superb for roach and skimmers\n\n**Groundbait mixing:** Use a 60/40 mix of base groundbait to fine crumb. Add a few maggots or casters. Don't over-wet it — it should just hold a ball shape when squeezed.\n\n**Match fishing tip:** Loose feed little and often to keep fish competing in your swim rather than one big hit.",
    suggestions: ["Groundbait tips?", "Best carp bait?", "Float fishing setup?"],
  },
  'weather': {
    content: "**Weather Patterns & Fishing:**\n\n**Best conditions:**\n• Overcast skies — fish move more confidently without bright light\n• Rising barometer after a low — triggers feeding activity\n• Light SW winds — push warm water and food to the windward bank\n• Temperature 12-20°C — prime feeding range for most coarse species\n\n**Avoid fishing:**\n• Falling barometer — fish go deep and sulk\n• Bright, high-pressure days in summer — fish go lethargic mid-day\n• Extreme cold snaps (below 4°C) — fish barely move\n\n**Night fishing:** In summer, night sessions are often the most productive — cooler temperatures, less angling pressure, and big fish feed with confidence in darkness.",
    suggestions: ["Best time to fish today?", "Night fishing tips?", "How does moon phase affect fishing?"],
  },
  'beginner': {
    content: "**Perfect Beginner Setup:**\n\nDon't overcomplicate it — simple rigs catch fish.\n\n**Starting kit:**\n• 10-11ft match rod (1.5lb TC)\n• Fixed spool reel with 6lb mainline\n• A pack of size 14-16 hooks\n• Floats, split shot, disgorger (essential!)\n• Rod licence from the EA (£35/year)\n\n**Best beginner rig:** Waggler float rig. Set the depth so the bait just touches the bottom. Cast near features — reeds, lily pads, overhanging trees.\n\n**Best starter species:** Roach, perch, and bream — they're forgiving, widespread, and fight well on light tackle.\n\n**Top beginner bait:** Maggots. They catch almost everything and are cheap.\n\n**Golden rule:** Stay quiet, move slowly near the bank, and never shadow the water.",
    suggestions: ["How do I tie a hook?", "Best beginner locations?", "Do I need a rod licence?"],
  },
  'miss': {
    content: "**Missing Bites — Common Causes & Fixes:**\n\n**1. Hook is too big** — Drop down two hook sizes. A size 16 instead of a 12 makes a huge difference.\n\n**2. Strike timing** — For float fishing, wait until the float is fully under before striking. For legering, wait for the tip to pull round firmly — don't strike at every twitch.\n\n**3. Bait is too big** — A large piece of bread or luncheon meat can mask the hook. Use smaller pieces.\n\n**4. Hook is blunt** — Check the hook point against your thumbnail. If it slides, it's blunt. Change it.\n\n**5. Shotting pattern** — Bunch your shot nearer the hook to get a faster drop on the float and better bite indication on the bottom.\n\n**6. Fish are shy feeding** — Try lighter line on the hooklink, smaller hook, and single maggot instead of double.",
    suggestions: ["What float should I use?", "Best bite detection tips?", "Why are fish not biting?"],
  },
  'water': {
    content: "**Reading the Water — Angler's Guide:**\n\n**On rivers:**\n• The inside of bends collect silt and food — great for roach and bream\n• The outside of bends scour deep — barbel and chub love it here\n• Weirpools hold virtually everything — oxygenated, food-rich water\n• Look for creases where fast water meets slow — fish hold on that line\n\n**On still waters:**\n• The windward bank — wind pushes surface food and warmth here in summer\n• Overhanging trees — insect food drops in; carp and chub patrol underneath\n• Weed edges — ambush points for perch, pike and tench\n• Margins at dawn — big carp often patrol within a rod length of the bank\n\n**Water clarity:**\n• Clear water = fish are wary. Use light line, natural baits, fish at distance\n• Coloured water = fish are confident. Bigger baits, brighter colours, fish the margins",
    suggestions: ["Best river spots?", "How do I find carp?", "What does wind direction affect?"],
  },
  'tench': {
    content: "**Summer Tench Tactics:**\n\nTench are a summer gem — they feed best from dawn until about 9am, then again in the evening.\n\n**Key signs:** Pinprick bubbles rising in patches — that's tench feeding and disturbing bottom sediment.\n\n**Best rigs:** Lift method float rig or simple ledger with a short hooklink. Shot the float so it lifts sharply when a tench picks up the bait.\n\n**Best baits:** Lobworm (biggest fish), sweetcorn, bread flake, red maggots, paste.\n\n**Location:** Shallow bays with soft silt and lily pads. Tench love estate lakes and mature gravel pits.\n\n**Approach:** Prebait the night before with a mix of hemp, corn and casters. Return at dawn — the tench will be there.",
    suggestions: ["Lift method float setup?", "Best summer baits?", "Early morning fishing tips?"],
  },
  'trout': {
    content: "**Trout Stream Fishing:**\n\nTrout fishing rewards observation and patience — read the water before you ever cast.\n\n**Where to find trout:**\n• Behind boulders and submerged rocks — they hold position here saving energy\n• Tail of pools where current slows\n• Under overhanging vegetation\n• Riffles in summer mornings\n\n**Fly fishing approach:** Work upstream. Cast dry flies upstream and let them drift naturally. Match the hatch — observe what insects are on the water surface.\n\n**Spinning:** Use small spinners (size 1-2), spoons, or soft plastic minnows in silver/gold. Cast across and downstream, retrieve steadily.\n\n**Best time:** Early morning and evening in summer. Overcast days with a hatch of flies are exceptional.",
    suggestions: ["Best trout flies?", "Dry fly vs nymph?", "Catch and release tips?"],
  },
  'perch': {
    content: "**Perch Fishing Tactics:**\n\nPerch are arguably the UK's most beautiful fish — and they're a blast on light tackle.\n\n**Best tactics:**\n• Drop shot rig — a soft plastic worm or paddle tail worked slowly along the bottom\n• Worm under a small float — deadly for river perch\n• Small spinners and blade lures — trigger their predatory instinct\n\n**Top baits:** Lobworms (the classic), small livebaits, soft plastic shads, maggot bunches.\n\n**Location:** Perch love structure — lock walls, bridge supports, fallen trees, pontoons. In rivers, look for slacker water behind obstructions.\n\n**Seasonal tips:** Autumn and winter are prime — perch feed aggressively as water cools. Big perch (2lb+) often patrol deeper water in winter.",
    suggestions: ["Drop shot rig setup?", "Best lures for perch?", "Canal perch tips?"],
  },
  'lure': {
    content: "**Lure Colours & When to Use Them:**\n\n**Clear water:**\n• Natural colours — silver, white, pale green\n• Transparent soft plastics\n• Match the colour of the local baitfish\n\n**Coloured/murky water:**\n• Bright colours — chartreuse, orange, yellow\n• Black silhouette lures (excellent in low light)\n• Vibrating lures that create sound and movement\n\n**Overcast days:** Fire tiger, chartreuse and red — high visibility triggers reaction bites.\n\n**Sunny conditions:** Metallic finishes — silver and gold flash well in bright light.\n\n**Pike lures:** Large rubber shads in white, perch pattern, or jointed jerkbaits. Work slow and erratic near weed edges.\n\n**General rule:** Match lure speed to water temperature. Cold water = slow retrieve. Warm water = faster, more erratic action.",
    suggestions: ["Best pike lures?", "How do I work a soft lure?", "Perch lure tips?"],
  },
  'night': {
    content: "**Night Fishing Guide:**\n\nNight sessions can produce the biggest fish — carp, barbel, bream, and eels all feed with confidence in darkness.\n\n**Essential kit:**\n• Head torch (red light preserves night vision)\n• Bite alarms with illuminated bobbin indicators\n• Landing net with a long handle\n• Unhooking mat (mandatory for carp)\n• Warm layers — temperatures drop significantly\n\n**Safety rules:**\n• Always tell someone where you're going\n• Check the fishery permits night fishing\n• Keep noise to a minimum\n• Don't wade at night\n\n**Tactics:** Set up in daylight, bait your spot, then wait. Don't keep recasting — let the swim settle. Barbel often feed from 10pm–2am. Carp can feed right through the night.",
    suggestions: ["Night carp setup?", "Best night fishing baits?", "Bite alarm recommendations?"],
  },
  'sea_bass': {
    content: "**Sea Bass Fishing:**\n\nSea bass are one of the UK's most sought-after sport fish — powerful, acrobatic, and challenging to target.\n\n**Best locations:** Rocky headlands, estuaries, surf beaches, harbour walls, and any feature that concentrates baitfish.\n\n**Best times:** Dawn and dusk on a flooding tide. Bass follow the tide in to feed on crabs and sandeels in the surf.\n\n**Top lures:** Surface poppers at dawn (explosive takes), soft plastic eels on a weighted jig head, Albie Snax-style lures worked in the surf.\n\n**Bait fishing:** Fresh peeler crab is the number one bait. Sandeels and ragworm also work well.\n\n**Conservation:** Bass are a protected species — check minimum size limits (42cm) and bag limits before you fish. Consider catch and release for all bass.",
    suggestions: ["Peeler crab rig?", "Best bass lures?", "Surf fishing tips?"],
  },
  'match': {
    content: "**Match Fishing Tips:**\n\nMatch fishing is all about maximising catch weight across a timed session — efficiency and consistency beat trying for a monster.\n\n**Key principles:**\n• Loose feed little and often — keep fish competing, not gorging\n• Change bait if bites dry up — don't sit on a dead swim\n• Start shallow and work down — roach and skimmers often sit mid-water\n• Build your net with smaller fish early; bigger fish often come later\n\n**Float fishing:** Waggler for open water, stick float on flowing rivers. Always use the lightest float you can get away with.\n\n**Pole fishing:** The most efficient method for close-range match fishing. Elastic grade 4-8 for small fish, 10-14 for carp.\n\n**Keepnet care:** Always dampen the net before use. Return fish gently at the end — they feel the stress of confinement.",
    suggestions: ["Best match fishing baits?", "Float vs pole?", "How to plumb the depth?"],
  },
  'bream': {
    content: "**Bream Fishing Guide:**\n\nBream are shoal fish — find one and you've found them all. Sessions can be incredible once a shoal moves into your swim.\n\n**Groundbait is king:** A stiff, sinking groundbait carpet draws bream in and keeps them on the bottom. Add casters, chopped worm, and sweetcorn.\n\n**Best rigs:** Feeder rig with a 12-18\" hooklink. Bream pick up bait gently — use a longer hooklink than you think. A size 14-16 hook with a single red maggot or small worm.\n\n**Signs of bream:** Rolling fish on the surface at dusk, muddy patches where they've been feeding, and bow-wave movements across the surface.\n\n**Patience:** Once you prebait a spot and bream arrive, they can feed for hours. Don't move — feed regularly and keep the hookbait dropping into the same spot.",
    suggestions: ["Feeder rig setup?", "Best bream groundbait?", "Night bream tactics?"],
  },
  'casting': {
    content: "**Casting Technique — Improve Your Distance & Accuracy:**\n\n**Basic overhead cast:**\n1. Position rod at 2 o'clock behind you\n2. Power stroke forward, stopping at 10 o'clock\n3. Release line at the right moment — too early goes high and short, too late goes low\n4. Follow through smoothly\n\n**Accuracy drills:** Practice casting at a hula hoop on the lawn. Consistency beats distance for most fishing situations.\n\n**Common mistakes:**\n• Gripping the rod too tightly — relax your hand\n• Using only the wrist instead of the whole forearm\n• Starting the cast too fast — let the rod load\n\n**Distance:** For long-range carp or sea fishing, use a pendulum cast and clip the line on your reel. Walk back to the same clip each cast for consistent range.",
    suggestions: ["How far can I cast?", "Overhead vs pendulum cast?", "Best casting rods?"],
  },
  'knot': {
    content: "**Essential Fishing Knots:**\n\n**Palomar knot** (strongest — 95% line strength):\n1. Double 15cm of line through the hook eye\n2. Tie a simple overhand knot in the doubled line\n3. Pass the hook through the loop\n4. Moisten and pull tight\n\n**Improved Clinch knot** (best for hooks and swivels):\n1. Thread line through the eye\n2. Wrap 5-6 times around the mainline\n3. Thread back through the loop behind the eye\n4. Thread through the large loop just created\n5. Pull tight and trim\n\n**Grinner knot** (great for braid):\nSimilar to improved clinch but with 5-6 turns for modern braided lines.\n\n**Always:** Wet the knot before pulling tight — dry friction weakens it by up to 30%.",
    suggestions: ["Hair rig knot?", "Best knot for braid?", "How to join two lines?"],
  },
  'default': {
    content: "That's a great fishing question! Here's my best advice as a UK angling advisor:\n\n**The fundamentals that catch fish:**\n\n1. **Timing** — Dawn and dusk are peak feeding times for most species\n2. **Weather** — A rising barometer after rain often triggers feeding\n3. **Bait choice** — Match your bait to the season; naturals in spring/autumn, boilies and pellets in summer\n4. **Location** — Fish near features: lily pads, overhanging trees, weed edges, channels\n5. **Stealth** — Slow movements, avoid shadows on the water, keep noise down\n\nIs there anything more specific I can help you with? Try asking about a species, rig, weather conditions, or bait selection!",
    suggestions: ["Best bait for carp right now?", "How do I read the water?", "What's a good beginner rig?"],
  },
};

const GENERAL_TIPS = [
  "Dawn and dusk are peak feeding windows for most UK species. Get out early and stay late — that's where the magic happens.",
  "A rising barometer after prolonged rain is one of the best triggers for a big catch. Fish become confident and actively feed.",
  "Always wet your hands before handling fish. It protects their slime coat, which is their immune system.",
  "Stealth is your biggest edge. Walk slowly near the bank, crouch down, and never shadow the water with your silhouette.",
  "The windward bank on a still water is usually the most productive in summer — wind pushes warm water and surface food there.",
  "Change something every 20 minutes if you're getting no bites — bait size, hook size, casting position, or depth.",
  "Overfishing a swim with too much groundbait fills the fish up. Little and often keeps them searching and competing.",
  "In cold water, fish are cold-blooded and slow down. Use smaller baits, fish slower, and target the deepest areas where temperature is most stable.",
];

let generalTipIndex = 0;

function getAIResponse(question: string): { content: string; suggestions: string[] } {
  const lower = question.toLowerCase();

  if (lower.includes('carp')) return CANNED_RESPONSES['carp'];
  if (lower.includes('pike') || lower.includes('hold a pike') || lower.includes('wire trace')) return CANNED_RESPONSES['pike'];
  if (lower.includes('barbel')) return CANNED_RESPONSES['barbel'];
  if (lower.includes('tench')) return CANNED_RESPONSES['tench'];
  if (lower.includes('bream')) return CANNED_RESPONSES['bream'];
  if (lower.includes('perch')) return CANNED_RESPONSES['perch'];
  if (lower.includes('trout')) return CANNED_RESPONSES['trout'];
  if (lower.includes('bass') || lower.includes('sea bass')) return CANNED_RESPONSES['sea_bass'];
  if (lower.includes('match fishing') || lower.includes('match angling')) return CANNED_RESPONSES['match'];
  if (lower.includes('lure') || lower.includes('colour') || lower.includes('color')) return CANNED_RESPONSES['lure'];
  if (lower.includes('night') || lower.includes('dark') || lower.includes('midnight')) return CANNED_RESPONSES['night'];
  if (lower.includes('bait') || lower.includes('groundbait') || lower.includes('boilie') || lower.includes('maggot') || lower.includes('worm')) return CANNED_RESPONSES['bait'];
  if (lower.includes('weather') || lower.includes('barometer') || lower.includes('pressure') || lower.includes('wind')) return CANNED_RESPONSES['weather'];
  if (lower.includes('beginner') || lower.includes('start') || lower.includes('new to fishing') || lower.includes('first time')) return CANNED_RESPONSES['beginner'];
  if (lower.includes('miss') || lower.includes('bites') || lower.includes('bite') || lower.includes('striking')) return CANNED_RESPONSES['miss'];
  if (lower.includes('read') || lower.includes('water') || lower.includes('swim') || lower.includes('where to fish')) return CANNED_RESPONSES['water'];
  if (lower.includes('cast') || lower.includes('distance') || lower.includes('accuracy')) return CANNED_RESPONSES['casting'];
  if (lower.includes('knot') || lower.includes('hair') || lower.includes('rig') || lower.includes('tie')) return CANNED_RESPONSES['hair'];
  if (lower.includes('knot strength') || lower.includes('palomar') || lower.includes('clinch')) return CANNED_RESPONSES['knot'];
  if (lower.includes('bit') || lower.includes('catch') || lower.includes('near me') || lower.includes('biting')) return CANNED_RESPONSES['biting'];
  if (lower.includes('today') || lower.includes('good') || lower.includes('condition') || lower.includes('time to fish')) return CANNED_RESPONSES['today'];
  if (lower.includes('season') || lower.includes('close') || lower.includes('licence') || lower.includes('legal')) return CANNED_RESPONSES['season'];

  // Rotate through general tips for unknown queries
  const tip = GENERAL_TIPS[generalTipIndex % GENERAL_TIPS.length];
  generalTipIndex++;
  return {
    content: `${tip}\n\n${CANNED_RESPONSES['default'].content}`,
    suggestions: CANNED_RESPONSES['default'].suggestions,
  };
}

function getCannedResponse(input: string): typeof CANNED_RESPONSES['default'] {
  return getAIResponse(input);
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function AIAdvisorScreen() {
  const router = useRouter();
  const { catches } = useCatchStore();
  const { location } = useLocationStore();
  const { aiAdvisorUses, useAIAdvisor } = useProStore();
  const { user } = useAuthStore();
  const isPro = user?.isPro ?? false;
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm CAST AI, your personal fishing advisor. I can help with species tips, rig advice, bait selection, conditions analysis and much more.\n\nWhat would you like to know today?",
      timestamp: new Date(),
      suggestions: QUICK_QUESTIONS.slice(0, 3),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: generateId(), role: 'user', content: text, timestamp: new Date() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    // Try the real AI via the secure Worker proxy; fall back to canned advice.
    let content: string | null = null;
    if (CONFIG.AI_WORKER_URL) {
      try {
        const res = await fetch(`${CONFIG.AI_WORKER_URL}/advisor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system: `You are CAST's expert fishing advisor. ${location ? `The angler is currently fishing at: ${location.name}.` : ''} Give concise, practical advice. Use markdown bold (**text**) for emphasis. Keep responses focused and actionable.`,
            messages: history
              .filter(m => m.id !== 'welcome')
              .map(m => ({ role: m.role, content: m.content })),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.reply) content = data.reply;
        }
      } catch {
        // network error — fall through to canned response
      }
    }

    if (!content) {
      await new Promise(r => setTimeout(r, 600));
      content = getCannedResponse(text).content;
    }

    const aiMsg: Message = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      suggestions: getCannedResponse(text).suggestions,
    };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const formatContent = (content: string) => {
    // Simple bold formatting
    return content.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={i} style={styles.bold}>{part.slice(2, -2)}</Text>;
      }
      return <Text key={i}>{part}</Text>;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(0,212,170,0.08)', 'transparent']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Advisor</Text>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => (
            <View key={msg.id}>
              {msg.role === 'assistant' && (
                <Text style={styles.castAiLabel}>CAST AI</Text>
              )}
              <View style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                {msg.role === 'assistant' && (
                  <View style={styles.aiAvatar}>
                    <MaterialCommunityIcons name="robot" size={18} color={colors.primary} />
                  </View>
                )}
                <View style={[styles.bubbleContent, msg.role === 'user' ? styles.userBubbleContent : styles.aiBubbleContent]}>
                  <Text style={[styles.bubbleText, msg.role === 'user' && styles.userText]}>
                    {formatContent(msg.content)}
                  </Text>
                  <Text style={[styles.bubbleTime, msg.role === 'user' && styles.userBubbleTime]}>
                    {msg.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
              {msg.suggestions && msg.suggestions.length > 0 && (
                <View style={styles.suggestions}>
                  {msg.suggestions.map(s => (
                    <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => sendMessage(s)}>
                      <Text style={styles.suggestionText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
          {loading && (
            <View style={styles.bubble}>
              <View style={styles.aiAvatar}><Text style={styles.aiAvatarText}>🤖</Text></View>
              <View style={[styles.bubbleContent, styles.aiBubbleContent]}>
                <View style={styles.typingDots}>
                  <View style={styles.typingDot} />
                  <View style={[styles.typingDot, { opacity: 0.6 }]} />
                  <View style={[styles.typingDot, { opacity: 0.3 }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick questions */}
        {messages.length === 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
            {QUICK_QUESTIONS.map(q => (
              <TouchableOpacity key={q} style={styles.quickBtn} onPress={() => sendMessage(q)}>
                <Text style={styles.quickBtnText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything about fishing..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#0A0E1A" />
            ) : (
              <MaterialCommunityIcons name="send" size={20} color="#0A0E1A" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  onlineText: { fontSize: 12, color: colors.success },
  messages: { flex: 1 },
  messagesContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  userBubble: { flexDirection: 'row-reverse' },
  aiBubble: {},
  castAiLabel: { fontSize: 10, fontWeight: '700', color: colors.primary, letterSpacing: 1.2, textTransform: 'uppercase', marginLeft: 40, marginBottom: 3, opacity: 0.85 },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,212,170,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  aiAvatarText: { fontSize: 16 },
  userBubbleTime: { color: 'rgba(10,14,26,0.55)' },
  bubbleContent: { maxWidth: '78%', borderRadius: radius.lg, padding: spacing.md },
  aiBubbleContent: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  userBubbleContent: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  userText: { color: '#0A0E1A' },
  bold: { fontWeight: '700' },
  bubbleTime: { fontSize: 10, color: colors.textSecondary, marginTop: 4, textAlign: 'right' },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginLeft: 40, marginTop: spacing.xs },
  suggestionChip: { backgroundColor: 'rgba(0,212,170,0.1)', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)' },
  suggestionText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  typingDots: { flexDirection: 'row', gap: 4, padding: 4 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  quickScroll: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  quickBtn: { backgroundColor: colors.surface, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, marginRight: spacing.xs, borderWidth: 1, borderColor: colors.border },
  quickBtnText: { fontSize: 13, color: colors.textPrimary },
  inputArea: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
  input: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 15, color: colors.textPrimary, maxHeight: 120 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
});
