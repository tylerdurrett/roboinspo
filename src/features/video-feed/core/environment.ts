/**
 * Framework-agnostic helpers that prevent accidental DOM access when the
 * feature core is consumed in server or non-browser runtimes. Keeping this logic
 * colocated with the video feed feature ensures portability to plain React apps
 * without relying on Next.js globals.
 */

/**
 * Determines whether the current runtime exposes browser globals. Use this
 * before touching `window`, `document`, or other DOM-only APIs.
 */
export const isBrowserEnvironment = (): boolean =>
  typeof window !== 'undefined' &&
  typeof document !== 'undefined' &&
  'createElement' in document

/**
 * Runs a callback only when the code executes in a browser. An optional
 * fallback can supply SSR-friendly defaults while keeping the callsite tidy.
 */
export const runBrowserOnly = <T>(
  callback: () => T,
  fallback?: () => T
): T | undefined => {
  if (isBrowserEnvironment()) {
    return callback()
  }

  return fallback?.()
}

/**
 * Returns a DOM `window` reference when available. Prefer this helper so tests
 * and server builds can safely import modules that rely on `window`.
 */
export const getBrowserWindow = (): Window | undefined =>
  isBrowserEnvironment() ? window : undefined

/**
 * Returns the active `document` when executed in a browser. Accessing the
 * document directly from shared modules would throw during SSR, so this helper
 * keeps the dependency optional.
 */
export const getBrowserDocument = (): Document | undefined =>
  isBrowserEnvironment() ? document : undefined
