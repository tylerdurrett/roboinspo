/**
 * LocalStorage utilities that safely guard against SSR execution. These helpers
 * allow shared code to read and persist feature preferences without coupling to
 * the browser runtime. All values are normalised to the string literals
 * `"true"` and `"false"` so other storage consumers remain predictable.
 */

const SOUND_ALLOWED_STORAGE_KEY = 'robo-inspo:feedSoundAllowed'

const canUseStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export interface GetBoolOptions {
  defaultValue?: boolean
}

/**
 * Reads a boolean flag from LocalStorage.
 *
 * Example usage (SSR-safe initialiser):
 * ```ts
 * const [soundAllowed, setSoundAllowed] = useState(() =>
 *   getBool(SOUND_ALLOWED_KEY, { defaultValue: false }) ?? false
 * )
 * ```
 */
export const getBool = (
  key: string,
  { defaultValue }: GetBoolOptions = {}
): boolean | undefined => {
  if (!canUseStorage()) {
    return defaultValue
  }

  try {
    const value = window.localStorage.getItem(key)

    if (value === null) {
      return defaultValue
    }

    if (value === 'true') {
      return true
    }

    if (value === 'false') {
      return false
    }

    return defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * Stores a boolean flag in LocalStorage. No-ops during SSR or when storage is
 * inaccessible (private mode, quota errors, etc.).
 *
 * Example usage (persisting a toggle):
 * ```ts
 * setBool(SOUND_ALLOWED_KEY, soundAllowed)
 * ```
 */
export const setBool = (key: string, value: boolean): void => {
  if (!canUseStorage()) {
    return
  }

  try {
    window.localStorage.setItem(key, value ? 'true' : 'false')
  } catch {
    // Silently ignore storage write failures (e.g. private browsing).
  }
}

export const SOUND_ALLOWED_KEY = SOUND_ALLOWED_STORAGE_KEY
