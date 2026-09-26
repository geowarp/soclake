'use client'

import { MapIcon, Sparkles, User, Users, type LucideIcon } from 'lucide-react'
import { useApp, type View } from '@/components/app-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Slot order in the island; the indicator slides by slot index.
const SLOTS: View[] = ['map', 'friends', 'create', 'profile']

export function BottomNav() {
  const { view, setView, selectEvent } = useApp()
  const onOrbit = view === 'create'

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-(--nav-inset)',
        // Scroll-edge fade where lists meet the island; the map stays unobstructed.
        view !== 'map' && 'bg-linear-to-t from-background via-background/60 to-transparent pt-8',
      )}
    >
      <div className="glass pointer-events-auto relative flex h-(--nav-island-h) items-center rounded-full p-1.5">
        <span
          aria-hidden
          className={cn(
            'nav-indicator absolute inset-y-1.5 left-1.5 w-16 rounded-full bg-foreground/10',
            onOrbit && 'opacity-0',
          )}
          style={{ transform: `translateX(${SLOTS.indexOf(view) * 100}%)` }}
        />
        <Tab
          icon={MapIcon}
          label="Map"
          active={view === 'map'}
          onClick={() => {
            selectEvent(null)
            setView('map')
          }}
        />
        <Tab
          icon={Users}
          label="Friends"
          active={view === 'friends'}
          onClick={() => setView('friends')}
        />
        <div className="flex w-16 justify-center">
          <Button
            size="icon-lg"
            aria-label="Plan with Orbit"
            aria-current={onOrbit ? 'page' : undefined}
            onClick={() => setView('create')}
            className={cn(
              'size-11 rounded-full shadow-lg shadow-primary/30 transition-transform duration-100 active:scale-95',
              onOrbit && 'ring-2 ring-primary/40 ring-offset-2 ring-offset-card',
            )}
          >
            <Sparkles />
          </Button>
        </div>
        <Tab
          icon={User}
          label="You"
          active={view === 'profile'}
          onClick={() => setView('profile')}
        />
      </div>
    </nav>
  )
}

function Tab({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={cn(
        'relative flex h-full w-16 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-medium tracking-wide transition-[color,transform] duration-100 active:scale-95',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="size-5" aria-hidden />
      {label}
    </button>
  )
}
