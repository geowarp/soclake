'use client'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { HOME_LOCATION } from '@/lib/data'
import type { AppEvent, EventCategory, User } from '@/lib/types'

const CATEGORY_COLOR: Record<EventCategory, string> = {
  dinner: 'oklch(0.72 0.175 42)',
  games: 'oklch(0.62 0.16 300)',
  active: 'oklch(0.68 0.13 160)',
  music: 'oklch(0.66 0.17 12)',
  craft: 'oklch(0.83 0.135 82)',
  other: 'oklch(0.72 0.02 70)',
}

function friendPin(avatar: string, color: string, highlighted: boolean) {
  const size = highlighted ? 60 : 50
  const ring = highlighted ? 4 : 3
  const glow = highlighted
    ? `0 0 0 4px color-mix(in oklab, ${color} 35%, transparent), 0 10px 22px rgba(0,0,0,.55)`
    : '0 6px 16px rgba(0,0,0,.5)'
  return L.divIcon({
    className: 'friend-pin',
    html: `
      <div class="pin-pop" style="position:relative;width:${size}px;height:${size}px;">
        <div style="width:${size}px;height:${size}px;border-radius:50%;border:${ring}px solid ${color};overflow:hidden;box-shadow:${glow};background:#111;">
          <img src="${avatar}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" />
        </div>
        <div style="position:absolute;left:50%;bottom:-5px;transform:translateX(-50%) rotate(45deg);width:12px;height:12px;background:${color};border-radius:2px;"></div>
      </div>`,
    iconSize: [size, size + 6],
    iconAnchor: [size / 2, size + 6],
  })
}

function youPin(avatar: string) {
  return L.divIcon({
    className: 'friend-pin',
    html: `
      <div style="position:relative;width:54px;height:54px;display:flex;align-items:center;justify-content:center;">
        <div class="you-pulse" style="position:absolute;width:54px;height:54px;border-radius:50%;background:oklch(0.83 0.135 82);"></div>
        <div style="position:relative;width:46px;height:46px;border-radius:50%;border:3px solid oklch(0.83 0.135 82);overflow:hidden;box-shadow:0 6px 16px rgba(0,0,0,.5);background:#111;">
          <img src="${avatar}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" />
        </div>
      </div>`,
    iconSize: [54, 54],
    iconAnchor: [27, 27],
  })
}

function FlyTo({ event }: { event: AppEvent | null }) {
  const map = useMap()
  useEffect(() => {
    if (event && Number.isFinite(event.lat) && Number.isFinite(event.lng)) {
      map.flyTo([event.lat, event.lng], 15, { duration: 0.8 })
    }
  }, [event, map])
  return null
}

export default function LeafletMap({
  events,
  selectedEventId,
  onSelect,
  getUser,
  youAvatar,
}: {
  events: AppEvent[]
  selectedEventId: string | null
  onSelect: (id: string) => void
  getUser: (id: string) => User | undefined
  youAvatar: string
}) {
  const selected = events.find((e) => e.id === selectedEventId) ?? null

  return (
    <MapContainer
      center={[HOME_LOCATION.lat, HOME_LOCATION.lng]}
      zoom={13}
      zoomControl={false}
      attributionControl
      className="orbit-map h-full w-full"
      style={{ background: 'oklch(0.17 0.012 60)' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        subdomains="abc"
        maxZoom={19}
      />
      <FlyTo event={selected} />

      <Marker
        position={[HOME_LOCATION.lat, HOME_LOCATION.lng]}
        icon={youPin(youAvatar)}
        zIndexOffset={1000}
      />

      {events.map((evt) => {
        const host = getUser(evt.hostId)
        if (!host) return null
        if (!Number.isFinite(evt.lat) || !Number.isFinite(evt.lng)) return null
        return (
          <Marker
            key={evt.id}
            position={[evt.lat, evt.lng]}
            icon={friendPin(
              host.avatar,
              CATEGORY_COLOR[evt.category],
              evt.id === selectedEventId,
            )}
            eventHandlers={{ click: () => onSelect(evt.id) }}
          />
        )
      })}
    </MapContainer>
  )
}
