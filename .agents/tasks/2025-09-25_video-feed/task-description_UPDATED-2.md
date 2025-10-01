# Overview

This plan adapts the vertical video feed roadmap to the Robo Inspo codebase while keeping the feature module portable across React environments (including non-Next.js apps). It leans on the existing Sanity `thing` documents (which already ship poster images, Mux assets, and metadata), reuses shared utilities like `urlFor`, the Shadcn UI kit, and the global Tailwind token setup in `globals.css`. The feed grid will live at `/things`, while the full-screen feed mounts at `/thing/[id]` so URLs stay canonical and predictable across frameworks. All new feature code is grouped under `src/features/video-feed/**`, with a framework-agnostic core and thin Next.js wiring to keep runtime hooks, components, context, and config encapsulated yet shareable. We intentionally rely on native scrolling (no Lenis provider) so other pages' scroll behavior stays untouched. Each feed item is derived solely from a Thing's featured video; gallery videos remain exclusive to the detail experience.

We're building a fast, mobile-first, TikTok/Reels-style feed for React that opens from a thumbnail grid into a full-screen, vertically snapped player. Each card autoplays as it becomes the focused view, stops when it leaves, and honors a global, user-gesture sound opt-in so audio stays enabled across the session. The UI supports swipe/scroll threshold snapping, share and details overlays, captions/volume controls, and orientation-aware layout that adapts cleanly between portrait and landscape. Under the hood, we virtualize the list with `@tanstack/react-virtual` to keep only a few items mounted, and we separate JSON prefetch (to extend the feed) from media preload (to warm the next few videos) for instant starts without memory bloat. The feed is effectively infinite, loading more data in the background via a cursor API, and includes sensible lifecycle policies (page/tab visibility pausing), accessibility (keyboard + reduced-motion), basic analytics hooks, and performance tuning (preconnect, teardown, adaptive preload) — all on top of Mux Player for reliable streaming and Tailwind v4 for a clean, responsive UI.

---

# Phase 0 — Baseline Contracts & Project Wiring

> Goal: lock down data contracts, routing touchpoints, and shared helpers so later phases drop in cleanly without fighting the existing app structure.

- [x] **Establish core module boundary**

  - Create `src/features/video-feed/core` to house framework-agnostic exports (types, hooks, and components) and add `src/features/video-feed/index.ts` that re-exports the pieces needed by the Next.js integration. Split DOM-only behavior behind environment guards so the same code can compile inside a plain React (Vite/CRA) sandbox.

- [x] **Define feed domain types**

  - Add `src/features/video-feed/core/types.ts` exporting `VideoFeedItem`, `VideoFeedPage`, and `VideoCreator` types derived from `ThingQueryResult` + `MuxVideoAsset` in `sanity.types.ts`. Include computed fields we will supply (e.g., `muxPlaybackId`, `posterImage`, `shareHref`, `thingSlug`).
  - Export a `mapThingToFeedItems(thing: ThingQueryResult): VideoFeedItem[]` helper that returns a feed item only when a Thing has a playable `featuredVideo`, assigning a stable ID like `${thing._id}:featured`, and ensure it is re-exported from `src/features/video-feed/index.ts`.

- [x] **Establish fetch contract**

  - Create `src/features/video-feed/api.ts` that defines `export type FetchVideoFeedPage = (params: { cursor?: string; limit?: number }) => Promise<VideoFeedPage>` and exports a placeholder `fetchVideoFeedPage` implementation that throws `new Error('unimplemented')` for now.
  - Re-export `mapThingToFeedItems` so the future API implementation can consume it without circular imports and so non-Next apps can supply their own fetcher.
  - Notes:
    - `fetchVideoFeedPage` currently throws so host apps must provide an implementation before usage.
    - `mapThingToFeedItems` is re-exported through the API module to keep consumers framework-agnostic.

- [ ] **Shared storage utilities**

  - Add `src/lib/storage.ts` with guarded `getBool`/`setBool` helpers (no `window` access during SSR) and export `SOUND_ALLOWED_KEY = 'robo-inspo:feedSoundAllowed'`.
  - Provide basic unit-style usage example in JSDoc so teammates know the SSR guard pattern.
  - **Acceptance check:** Running `npm run lint` after adding the file passes.

- [ ] **Viewport-safe utility class**

  - Extend `src/app/globals.css` utilities with an `.h-viewport` class that uses `height: var(--viewportHeight, 100dvh)` and update `src/hooks/useViewportHeight.tsx` (already present) documentation to note the new CSS variable consumer.
  - Plan to use this class for the scroll container to avoid iOS dynamic toolbar jumps.
  - **Acceptance check:** Temporary element styled with `h-viewport` snaps exactly to device height in dev tools responsive mode. Ask the user to test this check and mark this phase complete.

---

# Phase 1 — THINGS Grid Entry → /thing/[id] Route Shell

> Goal: create a navigation entry point that lists playable videos and hands off to an isolated feed shell when a card is tapped.

- [ ] **Server model for previews**

  - Implement `src/models/video-feed.ts` exporting `getVideoFeedPreview(limit?: number)` that fetches the newest Things whose `featuredVideo` resolves to a playable Mux asset using GROQ, reuses `mapThingToFeedItems`, and returns the first `limit` items (default 24) pre-sorted by newest available video.
  - **Acceptance check:** `npm run lint` passes and calling the model in `node --eval` prints an array with required fields (`posterUrl`, `muxPlaybackId`).

- [ ] **Grid presentation**

  - Create `src/features/video-feed/components/video-feed-grid.tsx` (server component) that accepts the preview list and renders a responsive grid (Tailwind `grid-cols-2 md:grid-cols-3 xl:grid-cols-4`) of thumbnail buttons. Use `Image` + `urlFor` for posters and overlay duration/title if available.
  - Add a small client wrapper `VideoFeedGridItem` that calls `router.push('/thing/' + item.routeSlug)` (fall back to `_id` if slug missing) on click, handing the selected item to the feed shell.
  - **Acceptance check:** `/things` shows at least one playable card with focus outline + hover effect, and clicking changes the URL without a full reload.

- [ ] **Feed route skeleton**

  - Add `src/app/thing/[id]/page.tsx` as a **client component** that reads the dynamic `params.id`, renders a placeholder full-bleed container using `h-viewport`, includes a “Back to Things” button wired to `router.back()` fallback `router.push('/things')`, and temporarily logs the resolved `id`.
  - Ensure this route mounts the feed module outside any scroll modifiers so native scroll + virtualization behave correctly.
  - **Acceptance check:** Visiting `/thing/demo-id` displays the shell, the back button returns to `/things`, and the console logs the `id` once.

---

# Phase 2 — Virtualized Vertical List (No Player Yet)

> Goal: stitch in `@tanstack/react-virtual` to render a screen-tall stack that snaps vertically while keeping DOM nodes minimal.

- [ ] **Client feed shell**

  - Create `src/features/video-feed/components/reels-feed.tsx` as a client component receiving `{ initialItems, initialCursor, initialStartId }`.
  - Render a parent `div` with `className="relative w-full h-viewport overflow-y-auto snap-y snap-mandatory"` and attach `parentRef`.
  - **Acceptance check:** With fake rows, the container fills the viewport and scrolls vertically.

- [ ] **Virtualizer wiring**

  - Inside `reels-feed.tsx`, set up `useVirtualizer` with `estimateSize` based on current viewport height (use `useMemo` + `window.innerHeight` fallback to CSS variable), and render absolute positioned row wrappers.
  - Provide placeholder row content (e.g., gradient blocks) with `snap-start h-viewport` classes.
  - **Acceptance check:** Scrolling shows only a handful of elements in the DOM; DevTools count stays constant.

- [ ] **Start index resolution**

  - Accept `initialStartId`, compute the index in `initialItems`, and call `parentRef.current?.scrollTo({ top: index * viewportHeight, behavior: 'auto' })` in an effect once refs resolve.
  - Ensure the logic works whether `initialStartId` originated from Next.js route params or a plain React router.
  - **Acceptance check:** Navigating with `/thing/<valid-id>` opens the placeholder row aligned to that index.

---

# Phase 3 — Mux Player Adapter & Single Active Playback

> Goal: render real videos in each row and make only the focused row play audio/video.

- [ ] **Reusable player wrapper**

  - Add `src/features/video-feed/components/player-mux.tsx` exporting a client component that wraps `@mux/mux-player-react`. Accept props for `autoPlay`, `muted`, poster, captions, and event callbacks. Reuse the `MuxPlayerElement` ref pattern from `AdaptiveVideoPlayer` to expose imperative `play/pause` helpers.
  - **Acceptance check:** Rendering a single `PlayerMux` in Storybook or a scratch page loads metadata without throwing.

- [ ] **Active index hook**

  - Create `src/features/video-feed/hooks/use-active-index.ts` implementing an `IntersectionObserver` on row refs with `threshold: 0.6`, returning the active index and a `register` callback to attach refs.
  - **Acceptance check:** Console logs show a single active index changing as you scroll.

- [ ] **Play/pause orchestration**

  - Update `reels-feed.tsx` to render `PlayerMux` inside each virtual row, wiring refs so the active row calls `play()` when ready and inactive rows call `pause()` and reset to `currentTime = 0`.
  - **Acceptance check:** Only the visible row plays video; background rows halt playback immediately when scrolled away.

---

# Phase 4 — Global Sound Opt-In (Gesture Gated)

> Goal: comply with autoplay rules by defaulting to muted, but let users enable sound once per session.

- [ ] **Sound context**

  - Create `src/features/video-feed/context/sound-context.tsx` with a provider storing `soundAllowed` in state, initializing from `getBool(SOUND_ALLOWED_KEY, false)`, and exposing `enableSound()`/`disableSound()` helpers.
  - Wrap the feed tree in this provider inside `src/app/thing/[id]/page.tsx`.
  - **Acceptance check:** Provider toggling updates React DevTools state and persists across route re-mounts.

- [ ] **Mute/unmute UI**

  - Add a floating mute button component (using `@/components/ui/button`) that appears only on the active row. On first unmute gesture: call `enableSound()`, unmute the active player, and retry `play()`; surface a toast if `play()` rejects.
  - **Acceptance check:** After tapping unmute once, subsequent videos start with audio; refreshing resets the preference.

- [ ] **Default autoplay muted**

  - Ensure `PlayerMux` receives `muted={!soundAllowed}` and sets `playsInline`.
  - **Acceptance check:** Fresh session plays muted, enabling audio flips future rows.

---

# Phase 5 — Strict Lifecycle: Mount Only Near Active

> Goal: keep memory and CPU in check by limiting mounted players to the active item plus immediate neighbors.

- [ ] **Mount window**

  - Update the row renderer to skip mounting `PlayerMux` when `Math.abs(index - activeIndex) > 1`; render a lightweight poster fallback instead so layout stays intact.
  - **Acceptance check:** React DevTools shows only three `PlayerMux` instances regardless of list length.

- [ ] **Cleanup on unmount**

  - Ensure `PlayerMux` tears down event listeners and cancels media loading in `useEffect` cleanup when unmounted.
  - **Acceptance check:** Profiling a long scroll shows no accumulating listeners or network requests.

---

# Phase 6 — Predictive Prefetch (JSON) & Preload (Media)

> Goal: hydrate feed data ahead of the user and warm upcoming videos without over-buffering.

- [ ] **Implement fetcher + API route**

  - Flesh out `fetchVideoFeedPage` to call a new GROQ query in `src/models/video-feed.ts` that accepts `{ cursor, limit }`, orders items by `_createdAt desc`, flattens via `mapThingToFeedItems`, and returns `{ items, nextCursor }` where `cursor` stores the last Thing ID.
  - Add `src/app/api/video-feed/route.ts` that invokes the model and returns JSON for client-side prefetches.
  - **Acceptance check:** `curl '/api/video-feed?limit=5'` returns well-typed JSON with `nextCursor` when more data exists.

- [ ] **Config + client data store**

  - Create `src/features/video-feed/config/prefetch.ts` exporting `PREFETCH = { fetchCountAhead: 8, preloadCountAhead: 2 }`.
  - Add a `useVideoFeedData` hook that owns client state (items array, cursor, `isFetching`, `error`), seeds from server props, and triggers `fetch` to `/api/video-feed` when the active index approaches the end.
  - **Acceptance check:** Scrolling near the end increases `items.length` before you run out; network panel shows batched JSON fetches.

- [ ] **Media preload**

  - When `activeIndex < rowIndex ≤ activeIndex + PREFETCH.preloadCountAhead`, render `PlayerMux` with `preload="metadata"` but skip `play()`. Guard via `soundAllowed` to avoid accidental audio.
  - Add adaptive logic: if `navigator.connection?.effectiveType` is `2g`/`slow-2g`, clamp `preloadCountAhead` to 1.
  - **Acceptance check:** Next videos fetch manifests early on fast networks, but not on simulated slow 3G.

---

# Phase 7 — Gesture Threshold Snapping (Enhance Scroll Feel)

> Goal: keep the tactile swipe experience consistent across touch, wheel, and keyboard without fighting native scroll.

- [ ] **Gesture capture hook**

  - Implement `src/features/video-feed/hooks/use-swipe-snap.ts` that attaches passive touch listeners to the scroll container, measures displacement + velocity, and returns `snapDirection` events (`prev | next | stay`). Make sure to detach listeners on unmount.
  - **Acceptance check:** Logging inside the hook shows `next` only when distance > `SWIPE_THRESHOLD_PX` or velocity > `SWIPE_VELOCITY`.

- [ ] **Programmatic snapping**

  - When the hook signals `next/prev`, call `parentRef.current?.scrollTo({ top: targetIndex * viewportHeight, behavior: prefersReducedMotion ? 'auto' : 'smooth' })` and debounce until `scrollend`.
  - **Acceptance check:** Light flicks under the threshold leave you on the same video; confident swipes snap exactly one item.

- [ ] **Wheel + keyboard parity**

  - Add handlers for wheel (aggregate deltas), Arrow/Page keys, and Space (toggle play/pause on active player). Respect focus management so overlays remain accessible.
  - **Acceptance check:** Desktop testing confirms consistent behavior across inputs.

---

# Phase 8 — Orientation & Resize Handling

> Goal: keep videos full-bleed and controls reachable during rotation, resize, or dynamic toolbar changes.

- [ ] **Orientation hook**

  - Add `src/features/video-feed/hooks/use-orientation.ts` that listens to `screen.orientation` (when available) and falls back to `matchMedia('(orientation: portrait)')`.
  - **Acceptance check:** Toggling orientation in Chrome dev tools updates the hook's returned value.

- [ ] **Viewport + virtualizer sync**

  - On orientation or resize, recompute the cached viewport height (`setViewportHeight`) and call `rowVirtualizer.measure()` to avoid gaps/overlaps.
  - **Acceptance check:** Rotating a device keeps each row perfectly aligned with the viewport.

- [ ] **Aspect handling**

  - Update `PlayerMux` wrapper styles to use `object-cover` in portrait and `object-contain` in landscape when `item.aspectHint` suggests so. Provide safe insets for overlays using CSS logical properties.
  - **Acceptance check:** Landscape mode avoids awkward cropping; overlay buttons remain tappable.

---

# Phase 9 — Overlay Controls & Share

> Goal: deliver the minimal control surface (mute, volume, share, details) that matches Robo Inspo styling.

- [ ] **Overlay scaffold**

  - Create `src/features/video-feed/components/overlay-controls.tsx` housing mute toggle, volume slider (Shadcn `Slider`), details button, and share button. Only render controls for the active row.
  - **Acceptance check:** Controls fade in/out with Tailwind transitions and respect dark/light CSS variables.

- [ ] **Volume persistence**

  - Persist volume to `localStorage` using a new key (`robo-inspo:feedVolume`), restore it on mount, and update both the Mux player and UI slider in sync.
  - **Acceptance check:** Adjusting volume on one video applies to the next; refresh keeps the same level.

- [ ] **Share & clipboard fallback**

  - For active item share: use `navigator.share` when available with `{ url: item.shareHref, title: item.title }`; otherwise copy to clipboard and show a toast (reuse existing toast system or a lightweight inline message).
  - **Acceptance check:** Mobile share sheet opens; desktop shows “Link copied”.

- [ ] **Details panel**

  - Render a collapsible panel (Radix Dialog or simple sheet) that surfaces title, originating Thing link, caption, and AI-generated badge if relevant.
  - **Acceptance check:** Opening the panel pauses background interaction but keeps the current video playing unless explicitly paused.

---

# Phase 10 — Infinite Loading Edge Cases & Errors

> Goal: keep UX smooth when the backend returns short pages, fails, or reaches the end of the catalog.

- [ ] **De-duplication**

  - Track seen IDs in the `useVideoFeedData` hook; filter new pages before merging to avoid duplicates when GROQ reorders items.
  - **Acceptance check:** Scroll testing with repeated fetches never shows the same ID twice.

- [ ] **Retry with backoff**

  - On fetch failure, surface a dismissible toast and schedule retries with exponential backoff (e.g., 1s, 1.5s, 2.25s, capped). Integrate with the hook state so the UI stays responsive.
  - **Acceptance check:** Manually failing the API (toggle network offline) triggers retries up to the cap, then surfaces a persistent “Tap to retry” control.

- [ ] **End-of-feed CTA**

  - When `nextCursor` is `null` for multiple fetches, show an end state card offering “Refresh feed” and “Back to Things”. Hook “Back” into the grid route (Phase 15 scroll restoration).
  - **Acceptance check:** Reaching the end renders the CTA without crashing; pressing buttons performs the expected navigation.

---

# Phase 11 — Page/Tab Visibility & Power Savers

> Goal: be polite with autoplay and data usage based on visibility and user preferences.

- [ ] **Visibility listener**

  - Add `document.visibilitychange` handling inside the feed component to pause the active player when hidden and resume (respecting mute state) when visible again.
  - **Acceptance check:** Switching tabs or locking the device pauses playback immediately; returning resumes only if sound policy allows.

- [ ] **Data saver support**

  - Detect `navigator.connection?.saveData` and override `preloadCountAhead` to `0`, also disabling autoplay for next videos until the user explicitly scrolls.
  - **Acceptance check:** Chrome DevTools “Data Saver” emulation shows zero preloading requests and no automatic autoplay for new items.

---

# Phase 12 — Analytics Hooks (Minimal)

> Goal: capture key playback and navigation events for future tuning.

- [ ] **Event bus**

  - Add `src/lib/analytics.ts` exporting `track(event: string, payload?: Record<string, unknown>)` that no-ops in production unless an analytics endpoint is configured, but logs in development.
  - **Acceptance check:** Calling `track('feed:test')` from a sandbox prints the payload in dev, stays silent in production builds.

- [ ] **Playback events**

  - Hook into `PlayerMux` events (`playing`, `pause`, `error`, `timeupdate`) to emit `track` calls: `viewStart`, `viewEnd`, `mutedChange`, `rebuffer`, etc., tagging with `item.id` and timing metrics.
  - **Acceptance check:** Console logs show matching events as you scroll through the feed.

- [ ] **Navigation metrics**

  - Record swipe counts, snap threshold hits, and time-to-first-frame per row (activation timestamp → first `playing` event). Store aggregates in-memory for now.
  - **Acceptance check:** Enabling verbose logging shows computed TTFF numbers per video.

---

# Phase 13 — Accessibility & Reduced Motion

> Goal: ensure keyboard users and motion-sensitive users have an equivalent experience.

- [ ] **Keyboard map**

  - Support Space (toggle play/pause), Arrow Up/Down (prev/next), Page Up/Down, and Escape (dismiss overlays). Ensure focus outlines are visible on interactive controls.
  - **Acceptance check:** Navigating the feed without a mouse covers all key flows.

- [ ] **Reduced motion compliance**

  - Respect `prefers-reduced-motion`: disable smooth scrolling in `useSwipeSnap`, reduce overlay fade animations, and skip autoplay transitions (only start on explicit play).
  - **Acceptance check:** Emulating reduced motion results in instant snaps and no animated transitions.

- [ ] **Labels & semantics**

  - Add `aria-label`, `aria-pressed`, and `role="button"` as needed; ensure captions tracks expose language labels; confirm focus trapping inside the details dialog meets WCAG.
  - **Acceptance check:** Running Chrome's accessibility panel flags no critical issues.

---

# Phase 14 — Performance Hardening

> Goal: guarantee smooth scrolling and bounded memory on mid-tier devices.

- [ ] **Virtual window budget**

  - Verify via React Profiler that only `activeIndex ± 1` players mount; add a feature-flagged dev toggle to widen the window for debugging (`process.env.NEXT_PUBLIC_VIRTUAL_WINDOW_AHEAD`).
  - **Acceptance check:** DevTools performance recording shows < 3 simultaneous `<video>` elements.

- [ ] **HLS resource cleanup**

  - Confirm Mux players release `srcObject` and MediaSource buffers on unmount; call `playerRef.current?.removeAttribute('src')` and `load()` reset when tearing down.
  - **Acceptance check:** Scrolling through 50+ items does not grow GPU memory according to Chrome's performance monitor.

- [ ] **Preconnect hints**

  - Add `<link rel="preconnect" href="https://stream.mux.com">` (and any poster CDN) to `src/app/layout.tsx` head section to reduce handshake time.
  - **Acceptance check:** Network waterfall shows quicker TLS negotiation after the change.

---

# Phase 15 — Routing Niceties & Back Navigation

> Goal: keep URLs in sync with the active item and make returning to the grid feel natural.

- [ ] **URL sync**

  - When the active index changes, call `router.replace('/thing/' + currentItem.routeSlug, { scroll: false })` (fall back to `_id` when slug absent). Guard to avoid spamming history when the active item has not changed.
  - **Acceptance check:** Refreshing the page stays on the current video and keeps the canonical `/thing/[id]` format.

- [ ] **Grid scroll restoration**

  - Store the tapped card index in `sessionStorage` before navigating away, and on `/things` mount, read the value and restore scroll using `document.querySelector('[data-feed-grid]')?.scrollTo({ top: targetOffset, behavior: 'auto' })` with a native fallback. Provide the same hook for non-Next apps by exporting a helper from `core`.
  - **Acceptance check:** Returning from `/thing/[id]` drops you back near the previously opened card without relying on third-party scroll managers.

- [ ] **Back affordances**

  - Ensure the in-feed “Back” button on `/thing/[id]` both navigates to `/things` and clears any feed-specific state so the grid doesn’t auto-open another video.
  - **Acceptance check:** Pressing Back always lands on the grid without stale params or unexpected autoplay.

---

## Notes for Developers

- New client components must include `'use client'` headers and avoid `any` types—prefer exact imports from `sanity.types.ts` and `@mux/mux-player-react` definitions.
- Keep feed-specific code under `src/features/video-feed` to prevent leaking player-only hooks into unrelated bundles, and export React-agnostic helpers from `core` for reuse in other projects.
- Avoid referencing Next.js App Router APIs inside `core/**`; gate them behind wrapper modules so the feature stays portable.
- When adding Sanity queries, run `npm run gen` afterward to refresh generated types and prevent drift.
