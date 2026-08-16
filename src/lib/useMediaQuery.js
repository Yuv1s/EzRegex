import { useSyncExternalStore } from 'react'

// One MediaQueryList per query, shared across every caller and reused across
// renders so `subscribe` stays referentially stable.
const cache = new Map()

function entryFor(query) {
  let entry = cache.get(query)
  if (!entry) {
    const mql = window.matchMedia(query)
    entry = {
      subscribe(onChange) {
        mql.addEventListener('change', onChange)
        return () => mql.removeEventListener('change', onChange)
      },
      getSnapshot: () => mql.matches,
    }
    cache.set(query, entry)
  }
  return entry
}

/**
 * Subscribe to a media query as external state — no effect, no resize listener.
 * Only for things CSS cannot express (ARIA roles, conditional mounting).
 * Layout should still be done with Tailwind breakpoints.
 */
export function useMediaQuery(query) {
  const { subscribe, getSnapshot } = entryFor(query)
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
