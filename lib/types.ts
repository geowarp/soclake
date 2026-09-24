export type User = {
  id: string
  name: string
  avatar: string
  bio: string
  interests: string[]
  vibe: string
}

export type EventCategory = 'dinner' | 'games' | 'active' | 'music' | 'craft' | 'other'

export type AppEvent = {
  id: string
  title: string
  hostId: string
  category: EventCategory
  cover: string
  description: string
  location: string
  lat: number
  lng: number
  date: string
  time: string
  durationMinutes: number
  capacity: number
  /** user ids registered to attend (host auto-included) */
  attendeeIds: string[]
}

/** shared history between the current user and a friend */
export type Friendship = {
  friendId: string
  sharedMinutes: number
  sharedEvents: number
}

export type FriendTier = {
  name: string
  min: number
  colorVar: string
  blurb: string
}
