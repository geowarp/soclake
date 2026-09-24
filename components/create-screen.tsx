'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai'
import {
  ArrowUp,
  CalendarDays,
  Clock,
  MapPin,
  Radio,
  Sparkles,
  Users,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { Button } from '@/components/ui/button'
import { CATEGORY_LABELS } from '@/lib/data'
import type { EventCategory } from '@/lib/types'
import { formatHours } from './friendship'

type ProposedEvent = {
  title: string
  category: EventCategory
  description: string
  location: string
  date: string
  time: string
  durationMinutes: number
  capacity: number
}

const SUGGESTIONS = [
  'Plan a cozy dinner this Friday',
  'Board game night for 6 friends',
  'Sunrise hike on Saturday morning',
]

export function CreateScreen() {
  const { createEvent, selectEvent, setView } = useApp()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const [manual, setManual] = useState(false)

  const { messages, sendMessage, addToolOutput, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, status])

  const busy = status === 'submitted' || status === 'streaming'

  function submit(text: string) {
    const value = text.trim()
    if (!value || busy) return
    sendMessage({ text: value })
    setInput('')
  }

  const empty = messages.length === 0

  return (
    <div className="relative flex h-full flex-col">
      <header className="shrink-0 border-b border-border/60 bg-card/60 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-base font-semibold leading-none">
              Plan with Orbit
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Describe the hangout — I&apos;ll handle the rest
            </p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 text-primary">
              <Sparkles className="size-6" />
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold text-balance">
              What are we planning?
            </h2>
            <p className="mt-1.5 max-w-xs text-sm text-muted-foreground text-pretty">
              Tell me the vibe and I&apos;ll draft an event you can broadcast to friends
              nearby.
            </p>
            <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="rounded-xl border border-border/60 bg-card/70 px-4 py-3 text-left text-sm transition hover:border-primary/50 hover:bg-card"
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setManual(true)}
              className="mt-4 text-xs font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
            >
              Prefer to fill it in yourself?
            </button>
          </div>
        ) : (
          <div className="mx-auto flex max-w-md flex-col gap-4" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className="flex flex-col gap-2">
                {message.parts.map((part, i) => {
                  if (part.type === 'text') {
                    return (
                      <div
                        key={i}
                        className={
                          message.role === 'user'
                            ? 'ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground'
                            : 'mr-auto max-w-[90%] rounded-2xl rounded-bl-md bg-secondary px-3.5 py-2.5 text-sm leading-relaxed'
                        }
                      >
                        {part.text}
                      </div>
                    )
                  }

                  if (part.type === 'tool-proposeEvent') {
                    const callId = part.toolCallId
                    if (part.state === 'input-streaming') {
                      return (
                        <div
                          key={callId}
                          className="mr-auto flex items-center gap-2 rounded-2xl bg-secondary px-3.5 py-2.5 text-sm text-muted-foreground"
                        >
                          <span className="size-3 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-primary" />
                          Drafting your event…
                        </div>
                      )
                    }

                    const proposed = part.input as ProposedEvent

                    if (part.state === 'input-available') {
                      return (
                        <EventDraftCard
                          key={callId}
                          event={proposed}
                          onBroadcast={() => {
                            const created = createEvent(proposed)
                            addToolOutput({
                              tool: 'proposeEvent',
                              toolCallId: callId,
                              output: {
                                status: 'broadcasted',
                                eventId: created.id,
                                title: created.title,
                              },
                            })
                          }}
                        />
                      )
                    }

                    if (part.state === 'output-available') {
                      const out = part.output as { eventId: string; title: string }
                      return (
                        <div
                          key={callId}
                          className="rounded-2xl border border-accent/40 bg-accent/10 p-4"
                        >
                          <div className="flex items-center gap-2 text-accent">
                            <Radio className="size-4" />
                            <span className="text-sm font-semibold">Broadcasted!</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {out.title} is now live for friends nearby.
                          </p>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="mt-3 rounded-lg"
                            onClick={() => {
                              selectEvent(out.eventId)
                              setView('map')
                            }}
                          >
                            <MapPin className="size-4" /> View on map
                          </Button>
                        </div>
                      )
                    }
                  }
                  return null
                })}
              </div>
            ))}
            {status === 'submitted' && (
              <div className="mr-auto flex items-center gap-1.5 rounded-2xl bg-secondary px-4 py-3">
                <Dot /> <Dot delay="0.15s" /> <Dot delay="0.3s" />
              </div>
            )}
            {error && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
                <p className="font-medium text-foreground">
                  Orbit&apos;s AI planner is offline right now.
                </p>
                <p className="mt-1 text-muted-foreground">
                  The AI planner runs on Vercel AI Gateway, which needs credits enabled on
                  your account. You can still build and broadcast your event by hand.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3 rounded-lg"
                  onClick={() => setManual(true)}
                >
                  <Sparkles className="size-4" /> Build it manually
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {manual && (
        <ManualForm
          onClose={() => setManual(false)}
          onCreate={(draft) => {
            const created = createEvent(draft)
            setManual(false)
            selectEvent(created.id)
            setView('map')
          }}
        />
      )}

      <div className="shrink-0 border-t border-border/60 bg-card/60 p-3 backdrop-blur">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit(input)
          }}
          className="mx-auto flex max-w-md items-end gap-2"
        >
          <div className="flex flex-1 items-center rounded-2xl border border-border bg-input/60 px-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Message Orbit"
              autoComplete="off"
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing &&
                  e.keyCode !== 229
                ) {
                  e.preventDefault()
                  submit(input)
                }
              }}
              placeholder="Message Orbit…"
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={busy || !input.trim()}
            className="size-12 shrink-0 rounded-2xl"
            aria-label="Send"
          >
            <ArrowUp className="size-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}

function EventDraftCard({
  event,
  onBroadcast,
}: {
  event: ProposedEvent
  onBroadcast: () => void
}) {
  const [sent, setSent] = useState(false)
  return (
    <div className="overflow-hidden rounded-2xl border border-primary/40 bg-card">
      <div className="border-b border-border/60 bg-primary/10 px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
          {CATEGORY_LABELS[event.category]} · Draft
        </span>
        <h3 className="mt-0.5 font-display text-lg font-semibold leading-tight text-balance">
          {event.title}
        </h3>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {event.description}
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Row icon={<CalendarDays className="size-3.5" />} text={event.date} />
          <Row icon={<Clock className="size-3.5" />} text={`${event.time} · ${formatHours(event.durationMinutes)}`} />
          <Row icon={<MapPin className="size-3.5" />} text={event.location} />
          <Row icon={<Users className="size-3.5" />} text={`Up to ${event.capacity}`} />
        </div>
        <Button
          onClick={() => {
            setSent(true)
            onBroadcast()
          }}
          disabled={sent}
          className="h-10 w-full rounded-xl text-sm font-semibold"
        >
          <Radio className="size-4" /> Broadcast to friends nearby
        </Button>
      </div>
    </div>
  )
}

const CATEGORY_OPTIONS: EventCategory[] = [
  'dinner',
  'games',
  'active',
  'music',
  'craft',
  'other',
]

function ManualForm({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (draft: ProposedEvent) => void
}) {
  const [draft, setDraft] = useState<ProposedEvent>({
    title: '',
    category: 'dinner',
    description: '',
    location: '',
    date: 'This Friday',
    time: '7:00 PM',
    durationMinutes: 120,
    capacity: 6,
  })

  const valid = draft.title.trim() && draft.location.trim()

  function set<K extends keyof ProposedEvent>(key: K, value: ProposedEvent[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-background/95 backdrop-blur">
      <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="font-display text-base font-semibold">New event</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          Cancel
        </button>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <Field label="What is it?">
          <input
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Sunset rooftop dinner"
            className="w-full rounded-xl border border-border bg-input/60 px-3.5 py-2.5 text-sm outline-none focus:border-primary/60"
          />
        </Field>
        <Field label="Vibe">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set('category', c)}
                className={
                  draft.category === c
                    ? 'rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground'
                    : 'rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground'
                }
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Details">
          <textarea
            value={draft.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="A slow, candlelit dinner as the sun goes down…"
            className="w-full resize-none rounded-xl border border-border bg-input/60 px-3.5 py-2.5 text-sm outline-none focus:border-primary/60"
          />
        </Field>
        <Field label="Where?">
          <input
            value={draft.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Embarcadero rooftop"
            className="w-full rounded-xl border border-border bg-input/60 px-3.5 py-2.5 text-sm outline-none focus:border-primary/60"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Day">
            <input
              value={draft.date}
              onChange={(e) => set('date', e.target.value)}
              className="w-full rounded-xl border border-border bg-input/60 px-3.5 py-2.5 text-sm outline-none focus:border-primary/60"
            />
          </Field>
          <Field label="Time">
            <input
              value={draft.time}
              onChange={(e) => set('time', e.target.value)}
              className="w-full rounded-xl border border-border bg-input/60 px-3.5 py-2.5 text-sm outline-none focus:border-primary/60"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={`Length · ${formatHours(draft.durationMinutes)}`}>
            <input
              type="range"
              min={30}
              max={360}
              step={30}
              value={draft.durationMinutes}
              onChange={(e) => set('durationMinutes', Number(e.target.value))}
              className="w-full accent-primary"
            />
          </Field>
          <Field label={`Capacity · ${draft.capacity}`}>
            <input
              type="range"
              min={2}
              max={20}
              step={1}
              value={draft.capacity}
              onChange={(e) => set('capacity', Number(e.target.value))}
              className="w-full accent-primary"
            />
          </Field>
        </div>
      </div>
      <div className="border-t border-border/60 p-3">
        <Button
          disabled={!valid}
          onClick={() => onCreate(draft)}
          className="h-11 w-full rounded-xl font-semibold"
        >
          <Radio className="size-4" /> Broadcast to friends nearby
        </Button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-2.5 py-2">
      <span className="text-accent">{icon}</span>
      <span className="truncate text-foreground">{text}</span>
    </div>
  )
}

function Dot({ delay = '0s' }: { delay?: string }) {
  return (
    <span
      className="size-2 animate-bounce rounded-full bg-muted-foreground/60"
      style={{ animationDelay: delay }}
    />
  )
}
