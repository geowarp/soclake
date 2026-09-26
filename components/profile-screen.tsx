'use client'

import { Sparkles } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CATEGORY_LABELS } from '@/lib/data'
import { formatHours } from './friendship'

export function ProfileScreen() {
  const { currentUser, events, friendships, selectEvent, setView } = useApp()

  const hosting = events.filter((e) => e.hostId === currentUser.id)
  const joined = events.filter(
    (e) => e.hostId !== currentUser.id && e.attendeeIds.includes(currentUser.id),
  )
  const totalMinutes = friendships.reduce((s, f) => s + f.sharedMinutes, 0)

  const stats = [
    { label: 'Hosting', value: hosting.length },
    { label: 'Joined', value: joined.length },
    { label: 'Friends', value: friendships.length },
    { label: 'Together', value: formatHours(totalMinutes) },
  ]

  const mine = [...hosting, ...joined]

  return (
    <div className="flex h-full flex-col overflow-y-auto pb-(--nav-clearance)">
      <div className="relative h-28 shrink-0 bg-gradient-to-br from-primary/40 via-accent/20 to-transparent">
        <div className="absolute -bottom-10 left-4">
          <Avatar className="size-24 border-4 border-background shadow-xl">
            <AvatarImage src={currentUser.avatar || '/placeholder.svg'} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="px-4 pt-12">
        <h1 className="font-display text-2xl font-semibold">{currentUser.name}</h1>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-accent">
          <Sparkles className="size-3.5" />
          {currentUser.vibe}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {currentUser.bio}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {currentUser.interests.map((i) => (
            <Badge key={i} variant="secondary" className="rounded-full font-normal capitalize">
              {i}
            </Badge>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border/60 bg-card p-3 text-center"
            >
              <div className="font-display text-lg font-semibold">{s.value}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="mt-6 mb-2 text-sm font-medium">Your gatherings</h2>
        <div className="flex flex-col gap-2 pb-4">
          {mine.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border bg-card/50 p-4 text-center text-sm text-muted-foreground">
              No gatherings yet. Plan one with Orbit.
            </p>
          )}
          {mine.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                selectEvent(e.id)
                setView('map')
              }}
              className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-3 text-left transition active:scale-[0.99]"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{e.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {e.date} · {e.time}
                </p>
              </div>
              <Badge
                variant={e.hostId === currentUser.id ? 'default' : 'secondary'}
                className="ml-2 shrink-0 rounded-full"
              >
                {e.hostId === currentUser.id ? 'Hosting' : CATEGORY_LABELS[e.category]}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
