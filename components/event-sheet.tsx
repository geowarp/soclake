'use client'

import {
  CalendarDays,
  CalendarX,
  Check,
  Clock,
  Flag,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Users,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { AddFriendButton } from '@/components/add-friend-button'
import { useApp } from '@/components/app-provider'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  const {
    getUser,
    registerForEvent,
    leaveEvent,
    isRegistered,
    currentUser,
    friendIds,
    reportedIds,
    reportEvent,
  } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    // Escape belongs to the top layer: let the menu or report dialog close first.
    if (!event || menuOpen || reportOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [event, onClose, menuOpen, reportOpen])

  if (!event) return null

  const host = getUser(event.hostId)
  const registered = isRegistered(event.id)
  const attendees = event.attendeeIds
    .map((id) => getUser(id))
    .filter((u): u is NonNullable<typeof u> => !!u)
  const spotsLeft = event.capacity - event.attendeeIds.length
  const isHost = event.hostId === currentUser.id
  const hostIsNew = !isHost && !friendIds.has(event.hostId)
  const reported = reportedIds.has(event.id)

  return (
    // z-40: above the nav island (z-30), below shadcn overlays (z-50) opened from here.
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
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
          <div className="mt-3 flex items-start justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold text-balance">{event.title}</h2>
            {registered ? (
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon-lg" aria-label="More options" />}
                  className="shrink-0 rounded-full"
                >
                  <MoreHorizontal />
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" className="w-28 min-w-28">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => leaveEvent(event.id)}>
                      <CalendarX />
                      Cancel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={reported}
                      onClick={() => setReportOpen(true)}
                    >
                      <Flag />
                      {reported ? 'Reported' : 'Report'}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>

          {host ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                onClick={() => onViewProfile(host.id)}
                className="flex min-w-0 items-center gap-2.5 rounded-full text-left"
              >
                <Avatar className="size-8">
                  <AvatarImage src={host.avatar || undefined} alt={host.name} />
                  <AvatarFallback>{host.name[0]}</AvatarFallback>
                </Avatar>
                <span className="truncate text-sm text-muted-foreground">
                  Hosted by <span className="font-medium text-foreground">{host.name}</span>
                </span>
              </button>
              <AddFriendButton userId={host.id} />
            </div>
          ) : null}

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
                    <AvatarImage src={a.avatar || undefined} alt={a.name} />
                    <AvatarFallback>{a.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-full truncate text-[11px] text-muted-foreground">
                    {a.id === currentUser.id ? 'You' : a.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {!isHost && !registered && attendees.length > 0 ? (
            <p className="mt-4 rounded-xl bg-accent/10 px-3 py-2 text-xs text-accent">
              {hostIsNew && host
                ? `Join to meet ${host.name} in person — a first gathering is how every friendship starts.`
                : 'Join and you\u2019ll level up your friendship with everyone here.'}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-border p-4">
          {isHost ? (
            <Button disabled className="h-11 w-full rounded-xl text-sm">
              You&apos;re hosting this
            </Button>
          ) : registered ? (
            <div className="flex gap-2">
              <Button
                disabled
                className="h-11 flex-1 rounded-xl bg-accent text-sm text-accent-foreground disabled:opacity-100"
              >
                <Check data-icon="inline-start" /> You&apos;re going
              </Button>
              <Button
                variant="secondary"
                onClick={() => onViewProfile(event.hostId)}
                className="h-11 flex-1 rounded-xl text-sm"
              >
                <MessageCircle data-icon="inline-start" /> Contact
              </Button>
            </div>
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

      <AlertDialog open={reportOpen} onOpenChange={setReportOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report this gathering?</AlertDialogTitle>
            <AlertDialogDescription>
              Orbit will review &ldquo;{event.title}&rdquo;. {host?.name ?? 'The host'} won&apos;t
              be told who reported it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                reportEvent(event.id)
                setReportOpen(false)
              }}
            >
              Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
