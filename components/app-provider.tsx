'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  CURRENT_USER_ID,
  HOME_LOCATION,
  SEED_EVENTS,
  SEED_FRIENDSHIPS,
  USERS,
  USERS_BY_ID,
} from '@/lib/data'
import type { AppEvent, EventCategory, Friendship, User } from '@/lib/types'

export type View = 'map' | 'create' | 'friends' | 'profile'

type NewEventInput = {
  title: string
  category: EventCategory
  description: string
  location: string
  date: string
  time: string
  durationMinutes: number
  capacity: number
}

const COVER_BY_CATEGORY: Record<EventCategory, string> = {
  dinner: '/events/dinner.png',
  games: '/events/games.png',
  active: '/events/run.png',
  music: '/events/vinyl.png',
  craft: '/events/pottery.png',
  other: '/events/dinner.png',
}

type AppState = {
  currentUser: User
  users: User[]
  events: AppEvent[]
  friendships: Friendship[]
  /** ids of people you're friends with, for O(1) lookups */
  friendIds: Set<string>
  /** ids of people you've sent a friend request to */
  requestedIds: Set<string>
  requestFriend: (id: string) => void
  view: View
  setView: (v: View) => void
  selectedEventId: string | null
  selectEvent: (id: string | null) => void
  registerForEvent: (id: string) => void
  createEvent: (input: NewEventInput) => AppEvent
  isRegistered: (id: string) => boolean
  getUser: (id: string) => User | undefined
}

const AppContext = createContext<AppState | null>(null)

/** Spread new events in a ring around home so pins never overlap. */
function scatterAround(index: number) {
  const angle = (index * 137.5 * Math.PI) / 180
  const radius = 0.012 + (index % 3) * 0.006
  return {
    lat: HOME_LOCATION.lat + Math.sin(angle) * radius,
    lng: HOME_LOCATION.lng + Math.cos(angle) * radius,
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<AppEvent[]>(SEED_EVENTS)
  const [friendships, setFriendships] = useState<Friendship[]>(SEED_FRIENDSHIPS)
  const [view, setView] = useState<View>('map')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [createdCount, setCreatedCount] = useState(0)
  const [requestedIds, setRequestedIds] = useState<Set<string>>(() => new Set())

  const friendIds = useMemo(
    () => new Set(friendships.map((f) => f.friendId)),
    [friendships],
  )

  const requestFriend = useCallback((id: string) => {
    setRequestedIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
  }, [])

  const currentUser = USERS_BY_ID[CURRENT_USER_ID]

  const getUser = useCallback((id: string) => USERS_BY_ID[id], [])

  const isRegistered = useCallback(
    (id: string) => {
      const evt = events.find((e) => e.id === id)
      return !!evt?.attendeeIds.includes(CURRENT_USER_ID)
    },
    [events],
  )

  const registerForEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const evt = prev.find((e) => e.id === id)
      if (!evt || evt.attendeeIds.includes(CURRENT_USER_ID)) return prev
      // Level up friendships with everyone already attending.
      const coAttendees = evt.attendeeIds.filter((a) => a !== CURRENT_USER_ID)
      setFriendships((fs) =>
        fs.map((f) =>
          coAttendees.includes(f.friendId)
            ? {
                ...f,
                sharedMinutes: f.sharedMinutes + evt.durationMinutes,
                sharedEvents: f.sharedEvents + 1,
              }
            : f,
        ),
      )
      return prev.map((e) =>
        e.id === id ? { ...e, attendeeIds: [...e.attendeeIds, CURRENT_USER_ID] } : e,
      )
    })
  }, [])

  const createEvent = useCallback(
    (input: NewEventInput) => {
      const pos = scatterAround(createdCount + 2)
      const newEvent: AppEvent = {
        id: `evt-${Date.now()}`,
        hostId: CURRENT_USER_ID,
        cover: COVER_BY_CATEGORY[input.category] ?? COVER_BY_CATEGORY.other,
        attendeeIds: [CURRENT_USER_ID],
        lat: pos.lat,
        lng: pos.lng,
        ...input,
      }
      setEvents((prev) => [newEvent, ...prev])
      setCreatedCount((c) => c + 1)
      return newEvent
    },
    [createdCount],
  )

  const selectEvent = useCallback((id: string | null) => setSelectedEventId(id), [])

  const value = useMemo<AppState>(
    () => ({
      currentUser,
      users: USERS,
      events,
      friendships,
      friendIds,
      requestedIds,
      requestFriend,
      view,
      setView,
      selectedEventId,
      selectEvent,
      registerForEvent,
      createEvent,
      isRegistered,
      getUser,
    }),
    [
      currentUser,
      events,
      friendships,
      friendIds,
      requestedIds,
      requestFriend,
      view,
      selectedEventId,
      selectEvent,
      registerForEvent,
      createEvent,
      isRegistered,
      getUser,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
