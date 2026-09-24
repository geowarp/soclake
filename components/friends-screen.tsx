'use client'

import { ChevronRight, Flame } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { FriendProgress } from '@/components/friendship'
import { ProfileDialog } from '@/components/profile-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { tierForMinutes } from '@/lib/data'
import { formatHours } from './friendship'

export function FriendsScreen() {
  const { friendships, getUser } = useApp()
  const [profileUserId, setProfileUserId] = useState<string | null>(null)

  const ranked = useMemo(
    () => [...friendships].sort((a, b) => b.sharedMinutes - a.sharedMinutes),
    [friendships],
  )
  const totalMinutes = friendships.reduce((s, f) => s + f.sharedMinutes, 0)
  const closest = ranked[0]
  const closestUser = closest ? getUser(closest.friendId) : undefined

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 px-4 pt-5 pb-3">
        <h1 className="font-display text-2xl font-semibold">Friendships</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatHours(totalMinutes)} spent together · level up by showing up
        </p>
      </header>

      {closestUser && (
        <div className="mx-4 mb-4 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-14 border-2 border-accent/50">
              <AvatarImage src={closestUser.avatar || '/placeholder.svg'} alt={closestUser.name} />
              <AvatarFallback>{closestUser.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
                <Flame className="size-3.5" /> Closest friend
              </div>
              <p className="mt-0.5 font-display text-lg font-semibold leading-tight">
                {closestUser.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {closest.sharedEvents} events · {formatHours(closest.sharedMinutes)} together
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-2">
          {ranked.map((f) => {
            const user = getUser(f.friendId)
            if (!user) return null
            const { tier } = tierForMinutes(f.sharedMinutes)
            return (
              <button
                key={f.friendId}
                type="button"
                onClick={() => setProfileUserId(f.friendId)}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 text-left transition active:scale-[0.99]"
              >
                <div className="relative shrink-0">
                  <Avatar className="size-12">
                    <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-card"
                    style={{ background: tier.colorVar }}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{user.name}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {f.sharedEvents} events
                    </span>
                  </div>
                  <div className="mt-2">
                    <FriendProgress minutes={f.sharedMinutes} />
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            )
          })}
        </div>
      </div>

      <ProfileDialog userId={profileUserId} onClose={() => setProfileUserId(null)} />
    </div>
  )
}
