import type { AppEvent, FriendTier, Friendship, User } from './types'

export const CURRENT_USER_ID = 'you'

/** Center of the world — the current user's neighborhood (San Francisco). */
export const HOME_LOCATION = { lat: 37.7749, lng: -122.4194 }

export const USERS: User[] = [
  {
    id: 'you',
    name: 'You',
    avatar: '/avatars/you.png',
    bio: 'Collector of small gatherings. Always down for a spontaneous plan.',
    interests: ['cooking', 'hiking', 'live music'],
    vibe: 'The connector',
  },
  {
    id: 'maya',
    name: 'Maya',
    avatar: '/avatars/maya.png',
    bio: 'Throws the best dinners in the city. Will feed you until you cannot move.',
    interests: ['cooking', 'wine', 'photography'],
    vibe: 'The host',
  },
  {
    id: 'leo',
    name: 'Leo',
    avatar: '/avatars/leo.png',
    bio: 'Board game hoarder and strategy nerd. Undefeated at Catan (allegedly).',
    interests: ['board games', 'coffee', 'sci-fi'],
    vibe: 'The strategist',
  },
  {
    id: 'priya',
    name: 'Priya',
    avatar: '/avatars/priya.png',
    bio: 'Runs before sunrise so she can eat pastries guilt-free. Trail addict.',
    interests: ['running', 'yoga', 'baking'],
    vibe: 'The early bird',
  },
  {
    id: 'sam',
    name: 'Sam',
    avatar: '/avatars/sam.png',
    bio: 'Vinyl in one hand, cocktail in the other. Curates a mean playlist.',
    interests: ['music', 'mixology', 'design'],
    vibe: 'The tastemaker',
  },
  {
    id: 'nina',
    name: 'Nina',
    avatar: '/avatars/nina.png',
    bio: 'Ceramicist. Believes everyone should make something with their hands.',
    interests: ['pottery', 'art', 'tea'],
    vibe: 'The maker',
  },
  {
    id: 'diego',
    name: 'Diego',
    avatar: '/avatars/diego.png',
    bio: 'Says yes to almost everything. The reason plans actually happen.',
    interests: ['soccer', 'tacos', 'road trips'],
    vibe: 'The spark',
  },
  // Nearby people you're not friends with yet — surfaced in Public mode.
  // No photos: their pins and avatars fall back to initials.
  {
    id: 'kenji',
    name: 'Kenji',
    avatar: '',
    bio: 'On a mission to rank every ramen shop in the city. Currently at 41.',
    interests: ['ramen', 'film photography', 'jazz'],
    vibe: 'The explorer',
  },
  {
    id: 'lucia',
    name: 'Lucía',
    avatar: '',
    bio: 'Teaches salsa on weekends. Believes nobody is actually bad at dancing.',
    interests: ['dance', 'latin music', 'picnics'],
    vibe: 'The mover',
  },
  {
    id: 'omar',
    name: 'Omar',
    avatar: '',
    bio: 'Urban sketcher. Carries three pens and zero erasers.',
    interests: ['drawing', 'coffee', 'architecture'],
    vibe: 'The observer',
  },
  {
    id: 'ava',
    name: 'Ava',
    avatar: '',
    bio: 'New to SF and saying yes to everything. Bikes faster than she talks.',
    interests: ['cycling', 'brunch', 'podcasts'],
    vibe: 'The newcomer',
  },
]

export const USERS_BY_ID: Record<string, User> = Object.fromEntries(
  USERS.map((u) => [u.id, u]),
)

export const SEED_EVENTS: AppEvent[] = [
  {
    id: 'evt-dinner',
    title: 'Sunset Rooftop Dinner',
    hostId: 'maya',
    category: 'dinner',
    cover: '/events/dinner.png',
    description:
      'A slow, candlelit dinner on the roof as the sun goes down. Bring your appetite and a story to share.',
    location: 'Embarcadero rooftop',
    lat: 37.7955,
    lng: -122.3937,
    date: 'Fri, Jun 13',
    time: '6:30 PM',
    durationMinutes: 180,
    capacity: 8,
    attendeeIds: ['maya', 'sam', 'diego'],
  },
  {
    id: 'evt-games',
    title: 'Board Game Night',
    hostId: 'leo',
    category: 'games',
    cover: '/events/games.png',
    description:
      'Snacks, rivalries, and at least one game that ends a friendship (temporarily). All skill levels welcome.',
    location: "Leo's place, Mission",
    lat: 37.7599,
    lng: -122.4148,
    date: 'Sat, Jun 14',
    time: '7:00 PM',
    durationMinutes: 150,
    capacity: 6,
    attendeeIds: ['leo', 'priya'],
  },
  {
    id: 'evt-run',
    title: 'Sunrise Trail Run',
    hostId: 'priya',
    category: 'active',
    cover: '/events/run.png',
    description:
      'An easy 5k through the park before the city wakes up. Pastries and coffee after, obviously.',
    location: 'Golden Gate Park',
    lat: 37.7694,
    lng: -122.4862,
    date: 'Sun, Jun 15',
    time: '6:45 AM',
    durationMinutes: 90,
    capacity: 10,
    attendeeIds: ['priya', 'diego'],
  },
  {
    id: 'evt-vinyl',
    title: 'Vinyl & Cocktails',
    hostId: 'sam',
    category: 'music',
    cover: '/events/vinyl.png',
    description:
      'Bring one record that means something to you. We listen, we sip, we talk about why it matters.',
    location: 'Hayes Valley loft',
    lat: 37.7765,
    lng: -122.4256,
    date: 'Fri, Jun 20',
    time: '8:00 PM',
    durationMinutes: 150,
    capacity: 7,
    attendeeIds: ['sam', 'maya'],
  },
  {
    id: 'evt-pottery',
    title: 'Pottery Afternoon',
    hostId: 'nina',
    category: 'craft',
    cover: '/events/pottery.png',
    description:
      'Get your hands muddy. No experience needed — just leave with a slightly lopsided mug you love.',
    location: 'Marina studio',
    lat: 37.8009,
    lng: -122.4364,
    date: 'Sat, Jun 21',
    time: '2:00 PM',
    durationMinutes: 120,
    capacity: 6,
    attendeeIds: ['nina'],
  },
  {
    id: 'evt-ramen',
    title: 'Japantown Ramen Crawl',
    hostId: 'kenji',
    category: 'dinner',
    cover: '/events/dinner.png',
    description:
      'Three shops, half bowls at each, one very serious scorecard. Come hungry, leave with opinions.',
    location: 'Japantown',
    lat: 37.7852,
    lng: -122.4295,
    date: 'Thu, Jun 12',
    time: '7:00 PM',
    durationMinutes: 150,
    capacity: 6,
    attendeeIds: ['kenji', 'ava'],
  },
  {
    id: 'evt-salsa',
    title: 'Salsa in the Park',
    hostId: 'lucia',
    category: 'music',
    cover: '/events/vinyl.png',
    description:
      'A speaker, a patch of grass, and a beginner-friendly lesson. Two left feet are welcome.',
    location: 'Dolores Park',
    lat: 37.7596,
    lng: -122.4269,
    date: 'Sat, Jun 14',
    time: '4:00 PM',
    durationMinutes: 120,
    capacity: 16,
    attendeeIds: ['lucia', 'diego'],
  },
  {
    id: 'evt-sketch',
    title: 'Sketch & Coffee Walk',
    hostId: 'omar',
    category: 'craft',
    cover: '/events/pottery.png',
    description:
      'We wander, we stop, we draw what we see. Any sketchbook, any skill level, lots of coffee.',
    location: 'North Beach',
    lat: 37.8003,
    lng: -122.4102,
    date: 'Sun, Jun 15',
    time: '10:00 AM',
    durationMinutes: 120,
    capacity: 8,
    attendeeIds: ['omar'],
  },
  {
    id: 'evt-bike',
    title: 'Bay Loop Bike Ride',
    hostId: 'ava',
    category: 'active',
    cover: '/events/run.png',
    description:
      'An easy-paced ride along the water to the bridge and back. Brunch stop is non-negotiable.',
    location: 'Crissy Field',
    lat: 37.8039,
    lng: -122.4648,
    date: 'Sat, Jun 21',
    time: '9:30 AM',
    durationMinutes: 180,
    capacity: 10,
    attendeeIds: ['ava', 'kenji'],
  },
]

/** Shared history that seeds each friendship's level. */
export const SEED_FRIENDSHIPS: Friendship[] = [
  { friendId: 'maya', sharedMinutes: 1420, sharedEvents: 11 },
  { friendId: 'diego', sharedMinutes: 960, sharedEvents: 8 },
  { friendId: 'leo', sharedMinutes: 520, sharedEvents: 5 },
  { friendId: 'priya', sharedMinutes: 240, sharedEvents: 3 },
  { friendId: 'sam', sharedMinutes: 90, sharedEvents: 1 },
  { friendId: 'nina', sharedMinutes: 0, sharedEvents: 0 },
]

export const FRIEND_TIERS: FriendTier[] = [
  { name: 'New Orbit', min: 0, colorVar: 'var(--muted-foreground)', blurb: 'Just getting started' },
  { name: 'Acquaintance', min: 120, colorVar: 'var(--chart-3)', blurb: 'Warming up' },
  { name: 'Good Friend', min: 400, colorVar: 'var(--chart-4)', blurb: 'A real bond' },
  { name: 'Close Friend', min: 900, colorVar: 'var(--accent)', blurb: 'Your people' },
  { name: 'Inner Circle', min: 1400, colorVar: 'var(--primary)', blurb: 'Ride or die' },
]

export function tierForMinutes(minutes: number): {
  tier: FriendTier
  index: number
  next: FriendTier | null
  progress: number
} {
  let index = 0
  for (let i = 0; i < FRIEND_TIERS.length; i++) {
    if (minutes >= FRIEND_TIERS[i].min) index = i
  }
  const tier = FRIEND_TIERS[index]
  const next = FRIEND_TIERS[index + 1] ?? null
  const progress = next
    ? Math.min(1, (minutes - tier.min) / (next.min - tier.min))
    : 1
  return { tier, index, next, progress }
}

export const CATEGORY_LABELS: Record<string, string> = {
  dinner: 'Dinner',
  games: 'Games',
  active: 'Active',
  music: 'Music',
  craft: 'Craft',
  other: 'Hangout',
}
