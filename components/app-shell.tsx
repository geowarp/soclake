'use client'

import { useMemo, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { BottomNav } from '@/components/bottom-nav'
import { CreateScreen } from '@/components/create-screen'
import { EventSheet } from '@/components/event-sheet'
import { FriendsScreen } from '@/components/friends-screen'
import { MapScreen } from '@/components/map-screen'
import { ProfileDialog } from '@/components/profile-dialog'
import { ProfileScreen } from '@/components/profile-screen'

export function AppShell() {
  const { view, events, selectedEventId, selectEvent } = useApp()
  const [profileUserId, setProfileUserId] = useState<string | null>(null)

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId],
  )

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-background sm:my-4 sm:h-[calc(100dvh-2rem)] sm:rounded-[2rem] sm:border sm:border-border sm:shadow-2xl">
      <main className="relative h-full overflow-hidden">
        {/* Map stays mounted to avoid re-initialization; others render on demand */}
        <div className={view === 'map' ? 'h-full' : 'hidden'}>
          <MapScreen />
        </div>
        {view === 'create' && <CreateScreen />}
        {view === 'friends' && <FriendsScreen />}
        {view === 'profile' && <ProfileScreen />}
      </main>
      <BottomNav />

      {/* App-level overlays: any screen can open a gathering without leaving it. */}
      <EventSheet
        event={selectedEvent}
        onClose={() => selectEvent(null)}
        onViewProfile={setProfileUserId}
      />
      <ProfileDialog userId={profileUserId} onClose={() => setProfileUserId(null)} />
    </div>
  )
}
