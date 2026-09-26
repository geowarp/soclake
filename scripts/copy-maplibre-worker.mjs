// MapLibre v6 resolves its tile worker from import.meta.url at runtime, which
// bundlers can't follow. Serve the worker (and the shared chunk it imports)
// from public/ so `setWorkerUrl` can point at a stable path.
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const dist = dirname(require.resolve('maplibre-gl/package.json')) + '/dist'
const out = join(import.meta.dirname, '..', 'public', 'maplibre')

mkdirSync(out, { recursive: true })
for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  copyFileSync(join(dist, file), join(out, file))
}
