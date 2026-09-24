'use client'

import { CalendarDays, Check, Clock, MapPin, Users, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect } from 'react'
import { useApp } from '@/components/app-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { CATEGORY_LABELS } from '@/lib/data'
import type { AppEvent } from '@/lib/types'
import { formatHours } from './friendship'

export function EventSheet({
  event,
  onClose,
  onViewProfile,
}: {
  event: AppEvent | null
  onClose: () => void
  onViewProfile: (id: string) => void
}) {
  const { getUser, registerForEvent, isRegistered, currentUser } = useApp()

  useEffect(() => {
    if (!event) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [event, onClose])

  if (!event) return null

  const host = getUser(event.hostId)
  const registered = isRegistered(event.id)
  const attendees = event.attendeeIds
    .map((id) => getUser(id))
    .filter((u): u is NonNullable<typeof u> => !!u)
  const spotsLeft = event.capacity - event.attendeeIds.length
  const isHost = event.hostId === currentUser.id

  return (
    <div className="fixed inset-0 z-[1200] flex items-end justify-center sm:items-center">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        className="animate-sheet-up relative z-10 flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-border bg-card sm:rounded-3xl"
      >
        <div className="relative h-40 shrink-0">
          <Image
            src={event.cover || '/placeholder.svg'}
            alt={event.title}
            fill
            className="object-cover"
            sizes="448px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-background/60 text-foreground backdrop-blur transition hover:bg-background/80"
          >
            <X className="size-4" />
          </button>
          <span className="absolute left-4 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
            {CATEGORY_LABELS[event.category]}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <h2 className="mt-3 font-display text-2xl font-semibold text-balance">
            {event.title}
          </h2>

          {host && (
            <button
              onClick={() => onViewProfile(host.id)}
              className="mt-3 flex items-center gap-2.5 rounded-full text-left"
            >
              <Avatar className="size-8">
                <AvatarImage src={host.avatar || '/placeholder.svg'} alt={host.name} />
                <AvatarFallback>{host.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Hosted by <span className="font-medium text-foreground">{host.name}</span>
              </span>
            </button>
          )}

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5 text-sm">
            <Detail icon={<CalendarDays className="size-4" />} label={event.date} />
            <Detail icon={<Clock className="size-4" />} label={`${event.time} · ${formatHours(event.durationMinutes)}`} />
            <Detail icon={<MapPin className="size-4" />} label={event.location} />
            <Detail
              icon={<Users className="size-4" />}
              label={spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
            />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Who&apos;s going</span>
              <span className="text-xs text-muted-foreground">
                {attendees.length}/{event.capacity}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {attendees.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onViewProfile(a.id)}
                  className="flex w-14 flex-col items-center gap-1"
                >
                  <Avatar className="size-11 ring-2 ring-transparent transition hover:ring-accent">
                    <AvatarImage src={a.avatar || '/placeholder.svg'} alt={a.name} />
                    <AvatarFallback>{a.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-full truncate text-[11px] text-muted-foreground">
                    {a.id === currentUser.id ? 'You' : a.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {!isHost && !registered && attendees.length > 0 && (
            <p className="mt-4 rounded-xl bg-accent/10 px-3 py-2 text-xs text-accent">
              Join and you&apos;ll level up your friendship with everyone here.
            </p>
          )}
        </div>

        <div className="shrink-0 border-t border-border p-4">
          {isHost ? (
            <Button disabled className="h-11 w-full rounded-xl text-sm">
              You&apos;re hosting this
            </Button>
          ) : registered ? (
            <Button
              disabled
              className="h-11 w-full rounded-xl bg-accent text-sm text-accent-foreground disabled:opacity-100"
            >
              <Check className="size-4" /> You&apos;re going
            </Button>
          ) : spotsLeft > 0 ? (
            <Button
              onClick={() => registerForEvent(event.id)}
              className="h-11 w-full rounded-xl text-sm font-semibold"
            >
              Join this gathering
            </Button>
          ) : (
            <Button disabled className="h-11 w-full rounded-xl text-sm">
              This one&apos;s full
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Detail({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2.5">
      <span className="text-accent">{icon}</span>
      <span className="truncate text-foreground">{label}</span>
    </div>
  )
}
