'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { EventSheet } from '@/components/event-sheet'
import { ProfileDialog } from '@/components/profile-dialog'
import { CATEGORY_LABELS, tierForMinutes } from '@/lib/data'
import type { AppEvent } from '@/lib/types'

const MapLibreMap = dynamic(() => import('@/components/map/maplibre-map'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-background">
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  ),
})

export function MapScreen() {
  const { events, selectedEventId, selectEvent, getUser, currentUser, friendships } =
    useApp()
  const [profileUserId, setProfileUserId] = useState<string | null>(null)

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId],
  )
  const { tier } = useMemo(() => {
    if (friendships.length === 0) return tierForMinutes(0)
    const totalMinutes = friendships.reduce((s, f) => s + f.sharedMinutes, 0)
    return tierForMinutes(Math.round(totalMinutes / friendships.length))
  }, [friendships])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0">
        <MapLibreMap
          events={events}
          selectedEventId={selectedEventId}
          onSelect={selectEvent}
          getUser={getUser}
          youAvatar={currentUser.avatar}
        />
      </div>

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4">
        <div className="pointer-events-auto flex items-center justify-between rounded-2xl border border-border/60 bg-card/80 px-4 py-2.5 backdrop-blur-md">
          <div>
            <h1 className="font-display text-lg font-semibold leading-none tracking-tight">
              Orbit
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {events.length} gatherings near you
            </p>
          </div>
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{ background: `color-mix(in oklab, ${tier.colorVar} 16%, transparent)` }}
          >
            <span
              className="size-2 rounded-full"
              style={{ background: tier.colorVar }}
              aria-hidden
            />
            <span className="text-xs font-medium" style={{ color: tier.colorVar }}>
              {tier.name}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom event carousel */}
      {!selectedEvent && (
        <div className="absolute inset-x-0 bottom-(--nav-clearance) z-10">
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {events.map((evt) => (
              <EventCard key={evt.id} event={evt} onClick={() => selectEvent(evt.id)} />
            ))}
          </div>
        </div>
      )}

      <EventSheet
        event={selectedEvent}
        onClose={() => selectEvent(null)}
        onViewProfile={setProfileUserId}
      />
      <ProfileDialog userId={profileUserId} onClose={() => setProfileUserId(null)} />
    </div>
  )
}

function EventCard({ event, onClick }: { event: AppEvent; onClick: () => void }) {
  const { getUser } = useApp()
  const host = getUser(event.hostId)
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-64 shrink-0 items-center gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-2.5 text-left backdrop-blur-md transition active:scale-[0.98]"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={event.cover || '/placeholder.svg'}
          alt={event.title}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
          {CATEGORY_LABELS[event.category]}
        </span>
        <p className="truncate font-medium leading-tight">{event.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {event.date} · {host?.name}
        </p>
      </div>
    </button>
  )
}
