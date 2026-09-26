'use client'

import { AttributionControl, Map as MapLibre, Marker, setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef } from 'react'
import { HOME_LOCATION } from '@/lib/data'
import type { AppEvent, EventCategory, User } from '@/lib/types'

// OpenFreeMap "Liberty": a keyless, standard-color OSM vector style (not satellite).
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

// Copied into public/ by scripts/copy-maplibre-worker.mjs on install.
setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')

const CATEGORY_COLOR: Record<EventCategory, string> = {
  dinner: 'oklch(0.72 0.175 42)',
  games: 'oklch(0.62 0.16 300)',
  active: 'oklch(0.68 0.13 160)',
  music: 'oklch(0.66 0.17 12)',
  craft: 'oklch(0.83 0.135 82)',
  other: 'oklch(0.72 0.02 70)',
}

function avatarImage(src: string) {
  const img = document.createElement('img')
  img.src = src
  img.alt = ''
  img.draggable = false
  return img
}

/** MapLibre owns the outer element's transform, so visuals live on an inner node. */
function friendPin(avatar: string, color: string, label: string) {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = 'orbit-pin-anchor'
  el.setAttribute('aria-label', label)
  const pin = document.createElement('div')
  pin.className = 'orbit-pin'
  pin.style.setProperty('--pin-color', color)
  const face = document.createElement('div')
  face.className = 'orbit-pin-face'
  face.append(avatarImage(avatar))
  const tail = document.createElement('div')
  tail.className = 'orbit-pin-tail'
  pin.append(face, tail)
  el.append(pin)
  return el
}

function youPin(avatar: string) {
  const el = document.createElement('div')
  el.className = 'orbit-you'
  const pulse = document.createElement('div')
  pulse.className = 'you-pulse'
  const face = document.createElement('div')
  face.className = 'orbit-you-face'
  face.append(avatarImage(avatar))
  el.append(pulse, face)
  return el
}

export default function MapLibreMap({
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
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibre | null>(null)
  const pinsRef = useRef(new Map<string, HTMLElement>())
  const onSelectRef = useRef(onSelect)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  // Create the map once; everything else syncs onto it.
  useEffect(() => {
    const map = new MapLibre({
      container: containerRef.current!,
      style: MAP_STYLE,
      center: [HOME_LOCATION.lng, HOME_LOCATION.lat],
      zoom: 13,
      attributionControl: false,
    })
    // Top-right keeps the required attribution clear of the floating island.
    map.addControl(new AttributionControl({ compact: true }), 'top-right')
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const marker = new Marker({ element: youPin(youAvatar) })
      .setLngLat([HOME_LOCATION.lng, HOME_LOCATION.lat])
      .addTo(map)
    return () => {
      marker.remove()
    }
  }, [youAvatar])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const pins = pinsRef.current
    const markers: Marker[] = []
    for (const evt of events) {
      const host = getUser(evt.hostId)
      if (!host || !Number.isFinite(evt.lat) || !Number.isFinite(evt.lng)) continue
      const el = friendPin(host.avatar, CATEGORY_COLOR[evt.category], evt.title)
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onSelectRef.current(evt.id)
      })
      pins.set(evt.id, el)
      markers.push(new Marker({ element: el, anchor: 'bottom' }).setLngLat([evt.lng, evt.lat]).addTo(map))
    }
    return () => {
      for (const m of markers) m.remove()
      pins.clear()
    }
  }, [events, getUser])

  // Highlight by toggling an attribute instead of rebuilding markers.
  useEffect(() => {
    for (const [id, el] of pinsRef.current) {
      el.toggleAttribute('data-selected', id === selectedEventId)
    }
    const selected = events.find((e) => e.id === selectedEventId)
    if (selected && Number.isFinite(selected.lat) && Number.isFinite(selected.lng)) {
      // Non-essential, so MapLibre skips the flight under prefers-reduced-motion.
      mapRef.current?.flyTo({ center: [selected.lng, selected.lat], zoom: 15, duration: 800 })
    }
  }, [events, selectedEventId])

  return <div ref={containerRef} className="orbit-map size-full bg-muted" />
}
