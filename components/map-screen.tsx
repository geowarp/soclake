'use client'

import { ListIcon, MapIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { EventSheet } from '@/components/event-sheet'
import { GatheringList } from '@/components/gathering-list'
import { ProfileDialog } from '@/components/profile-dialog'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CATEGORY_LABELS } from '@/lib/data'
import type { AppEvent } from '@/lib/types'

const MapLibreMap = dynamic(() => import('@/components/map/maplibre-map'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-background">
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  ),
})

type Audience = 'friends' | 'public'
type Layout = 'map' | 'list'

export function MapScreen() {
  const { events, selectedEventId, selectEvent, getUser, currentUser, friendIds } = useApp()
  const [profileUserId, setProfileUserId] = useState<string | null>(null)
  const [audience, setAudience] = useState<Audience>('friends')
  const [layout, setLayout] = useState<Layout>('map')

  const visibleEvents = useMemo(
    () =>
      audience === 'public'
        ? events
        : events.filter((e) => e.hostId === currentUser.id || friendIds.has(e.hostId)),
    [audience, events, currentUser.id, friendIds],
  )
  const newFaces = useMemo(() => {
    const hosts = new Set<string>()
    for (const e of visibleEvents) {
      if (e.hostId !== currentUser.id && !friendIds.has(e.hostId)) hosts.add(e.hostId)
    }
    return hosts.size
  }, [visibleEvents, currentUser.id, friendIds])

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId],
  )

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* The map stays mounted under the list so switching back is instant. */}
      <div className="absolute inset-0">
        <MapLibreMap
          events={visibleEvents}
          selectedEventId={selectedEventId}
          onSelect={selectEvent}
          getUser={getUser}
          friendIds={friendIds}
          youAvatar={currentUser.avatar}
        />
      </div>

      {layout === 'list' ? (
        // Top padding clears the banner (3.75rem) and view toggle (2.75rem) plus gaps.
        <div className="animate-fade-in absolute inset-0 z-10 overflow-y-auto bg-background px-4 pt-36 pb-(--nav-clearance)">
          <GatheringList events={visibleEvents} onSelect={selectEvent} />
        </div>
      ) : null}

      {/* Floating chrome */}
      <div
        className={
          layout === 'list'
            ? 'pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col items-end gap-3 bg-linear-to-b from-background via-background/90 to-transparent p-4'
            : 'pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col items-end gap-3 p-4'
        }
      >
        <header className="glass pointer-events-auto flex h-15 w-full items-center justify-between gap-3 rounded-2xl pr-2.5 pl-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="font-display text-lg leading-none font-semibold tracking-tight">
              Orbit
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {audience === 'public'
                ? `${visibleEvents.length} gatherings · ${newFaces} new faces`
                : `${visibleEvents.length} gatherings with friends`}
            </p>
          </div>
          <ToggleGroup
            aria-label="Show gatherings from"
            size="sm"
            spacing={1}
            value={[audience]}
            onValueChange={(v) => {
              // Single-select: ignore attempts to clear the active segment.
              if (v[0]) setAudience(v[0] as Audience)
            }}
          >
            <ToggleGroupItem value="friends" className="rounded-full px-3">
              Friends
            </ToggleGroupItem>
            <ToggleGroupItem value="public" className="rounded-full px-3">
              Public
            </ToggleGroupItem>
          </ToggleGroup>
        </header>

        <ToggleGroup
          aria-label="View as"
          spacing={1}
          value={[layout]}
          onValueChange={(v) => {
            if (v[0]) setLayout(v[0] as Layout)
          }}
          className="glass pointer-events-auto rounded-full p-1"
        >
          <ToggleGroupItem value="map" aria-label="Map view" className="size-9 rounded-full">
            <MapIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view" className="size-9 rounded-full">
            <ListIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Bottom event carousel (map view only) */}
      {layout === 'map' && !selectedEvent ? (
        <div className="absolute inset-x-0 bottom-(--nav-clearance) z-10">
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visibleEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} onClick={() => selectEvent(evt.id)} />
            ))}
          </div>
        </div>
      ) : null}

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
  const { getUser, friendIds, currentUser } = useApp()
  const host = getUser(event.hostId)
  const isNew = event.hostId !== currentUser.id && !friendIds.has(event.hostId)
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
        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <span className="truncate">
            {event.date} · {event.hostId === currentUser.id ? 'You' : host?.name}
          </span>
          {isNew ? <Badge variant="outline">New</Badge> : null}
        </div>
      </div>
    </button>
  )
}
