'use client'

import { Map, Plus, Sparkles, User, Users } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const { view, setView, selectEvent } = useApp()

  return (
    <nav className="relative z-[1300] shrink-0 border-t border-border/60 bg-card/90 backdrop-blur-md">
      <div className="mx-auto grid max-w-md grid-cols-4 items-center px-2 py-2">
        <NavButton
          active={view === 'map'}
          onClick={() => {
            selectEvent(null)
            setView('map')
          }}
          icon={Map}
          label="Map"
        />
        <NavButton
          active={view === 'friends'}
          onClick={() => setView('friends')}
          icon={Users}
          label="Friends"
        />
        {/* Center create action */}
        <button
          type="button"
          onClick={() => setView('create')}
          className="flex flex-col items-center gap-1"
          aria-label="Create event"
        >
          <span
            className={cn(
              'grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition',
              view === 'create' && 'ring-2 ring-accent ring-offset-2 ring-offset-card',
            )}
          >
            {view === 'create' ? <Sparkles className="size-5" /> : <Plus className="size-5" />}
          </span>
          <span
            className={cn(
              'text-[10px] font-medium',
              view === 'create' ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            Create
          </span>
        </button>
        <NavButton
          active={view === 'profile'}
          onClick={() => setView('profile')}
          icon={User}
          label="You"
        />
      </div>
    </nav>
  )
}

function NavButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof Map
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 py-1.5"
    >
      <Icon
        className={cn(
          'size-5 transition',
          active ? 'text-primary' : 'text-muted-foreground',
        )}
      />
      <span
        className={cn(
          'text-[10px] font-medium transition',
          active ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        {label}
      </span>
    </button>
  )
}
