// MapLibre v6 resolves its tile worker from import.meta.url at runtime, which
// bundlers can't follow. Serve the worker (and the shared chunk it imports)
// from public/ so `setWorkerUrl` can point at a stable path. Source maps come
// along so DevTools can resolve the files' sourceMappingURL comments.
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const dist = dirname(require.resolve('maplibre-gl/package.json')) + '/dist'
const out = join(import.meta.dirname, '..', 'public', 'maplibre')

mkdirSync(out, { recursive: true })
for (const name of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  for (const file of [name, `${name}.map`]) {
    copyFileSync(join(dist, file), join(out, file))
  }
}
