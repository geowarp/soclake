'use client'

import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useApp } from '@/components/app-provider'
import { Badge } from '@/components/ui/badge'
import { CATEGORY_LABELS } from '@/lib/data'
import type { AppEvent } from '@/lib/types'

export function GatheringList({
  events,
  onSelect,
}: {
  events: AppEvent[]
  onSelect: (id: string) => void
}) {
  const { getUser, friendIds, currentUser } = useApp()

  return (
    <ul className="flex flex-col gap-2">
      {events.map((evt) => {
        const host = getUser(evt.hostId)
        const isNew = evt.hostId !== currentUser.id && !friendIds.has(evt.hostId)
        return (
          <li key={evt.id}>
            <button
              type="button"
              onClick={() => onSelect(evt.id)}
              className="flex w-full items-center gap-3 rounded-2xl bg-card p-2.5 text-left transition-transform duration-100 active:scale-[0.98]"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                <Image src={evt.cover} alt="" fill className="object-cover" sizes="64px" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
                  {CATEGORY_LABELS[evt.category]}
                </span>
                <p className="truncate font-medium leading-tight">{evt.title}</p>
                <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="truncate">
                    {evt.date} · {evt.hostId === currentUser.id ? 'You' : host?.name}
                  </span>
                  {isNew ? <Badge variant="outline">New</Badge> : null}
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
