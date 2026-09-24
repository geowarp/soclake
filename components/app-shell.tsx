'use client'

import { useApp } from '@/components/app-provider'
import { BottomNav } from '@/components/bottom-nav'
import { CreateScreen } from '@/components/create-screen'
import { FriendsScreen } from '@/components/friends-screen'
import { MapScreen } from '@/components/map-screen'
import { ProfileScreen } from '@/components/profile-screen'

export function AppShell() {
  const { view } = useApp()

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-background sm:my-4 sm:h-[calc(100dvh-2rem)] sm:rounded-[2rem] sm:border sm:border-border sm:shadow-2xl">
      <main className="relative flex-1 overflow-hidden">
        {/* Map stays mounted to avoid re-initialization; others render on demand */}
        <div className={view === 'map' ? 'h-full' : 'hidden'}>
          <MapScreen />
        </div>
        {view === 'create' && <CreateScreen />}
        {view === 'friends' && <FriendsScreen />}
        {view === 'profile' && <ProfileScreen />}
      </main>
      <BottomNav />
    </div>
  )
}
