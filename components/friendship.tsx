'use client'

import { tierForMinutes } from '@/lib/data'

export function formatHours(minutes: number) {
  if (minutes < 60) return `${minutes}m`
  const h = minutes / 60
  return `${h % 1 === 0 ? h : h.toFixed(1)}h`
}

export function TierPill({ minutes }: { minutes: number }) {
  const { tier } = tierForMinutes(minutes)
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        color: tier.colorVar,
        background: `color-mix(in oklab, ${tier.colorVar} 16%, transparent)`,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: tier.colorVar }}
        aria-hidden
      />
      {tier.name}
    </span>
  )
}

export function FriendProgress({ minutes }: { minutes: number }) {
  const { tier, next, progress } = tierForMinutes(minutes)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span style={{ color: tier.colorVar }} className="font-medium">
          {tier.name}
        </span>
        {next ? (
          <span>
            {formatHours(next.min - minutes)} to {next.name}
          </span>
        ) : (
          <span>Max level</span>
        )}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.max(6, progress * 100)}%`,
            background: `linear-gradient(90deg, color-mix(in oklab, ${tier.colorVar} 60%, transparent), ${tier.colorVar})`,
          }}
        />
      </div>
    </div>
  )
}
