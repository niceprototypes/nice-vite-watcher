import type { KeyedDebouncer } from "../types"

/**
 * Creates a keyed debouncer that batches calls by key.
 *
 * Each key gets its own independent debounce timer. This is useful for
 * debouncing file change events per-package, so that rapid changes to
 * one package don't affect the debounce timing for another package.
 *
 * @param delay - Debounce delay in milliseconds
 * @returns A keyed debouncer instance with a call() method
 */
export function createKeyedDebouncer(delay: number): KeyedDebouncer {
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  const counts = new Map<string, number>()

  return {
    call(key: string, fn: (count: number) => void): void {
      // Increment the count for this key
      counts.set(key, (counts.get(key) || 0) + 1)

      // Cancel any existing timer for this key
      const existing = timers.get(key)
      if (existing) {
        clearTimeout(existing)
      }

      // Set a new timer
      const timer = setTimeout(() => {
        const count = counts.get(key) || 1
        timers.delete(key)
        counts.delete(key)
        fn(count)
      }, delay)

      timers.set(key, timer)
    },
  }
}
