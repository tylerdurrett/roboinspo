# Overview

We're building a fast, mobile-first, TikTok/Reels-style feed for Next.js that opens from a thumbnail grid into a full-screen, vertically snapped player. Each card autoplays as it becomes the focused view, stops when it leaves, and honors a global, user-gesture sound opt-in so audio stays enabled across the session. The UI supports swipe/scroll threshold snapping, share and details overlays, captions/volume controls, and orientation-aware layout that adapts cleanly between portrait and landscape. Under the hood, we virtualize the list with react-virtual to keep only a few items mounted, and we separate JSON prefetch (to extend the feed) from media preload (to warm the next few videos) for instant starts without memory bloat. The feed is effectively infinite, loading more data in the background via a cursor API, and includes sensible lifecycle policies (page/tab visibility pausing), accessibility (keyboard + reduced-motion), basic analytics hooks, and performance tuning (preconnect, teardown, adaptive preload) — all on top of Mux Player for reliable streaming and Tailwind v4 for a clean, responsive UI.

Here’s a **step-by-step, test-as-you-go implementation plan** for a TikTok/Reels-style feed in **Next.js + Tailwind v4**, using **@mux/mux-player-react** and **@tanstack/react-virtual**. It’s organized into **phases**, each with **1-story-point tasks** you can assign and verify independently. Hand this directly to a dev.

---

# Phase 0 — Baseline Contracts & Project Wiring

> Goal: lock the data contract, routes, and shared utilities so later phases slot in cleanly.

- [ ] **Create data types**

  - `types/feed.ts`

    - `export type FeedItem = { id:string; src:string; poster?:string; durationMs?:number; captions?: {src:string;srclang:string;label:string;default?:boolean}[]; shareUrl:string; title?:string; creator?:{id:string;handle:string;avatarUrl?:string}; aspectHint?:'9:16'|'16:9'|'1:1'; playerConfig?:Record<string,unknown> }`
    - `export type PageResult = { items: FeedItem[]; nextCursor?: string }`

  - **Acceptance check:** Type compiles; can import from any component.

- [ ] **Define data interfaces (no impl yet)**

  - `lib/feed-api.ts`

    - `export type FetchPage = (opts:{cursor?:string; limit?:number})=>Promise<PageResult>`
    - `export type PrefetchPolicy = { fetchCountAhead:number; preloadCountAhead:number }`

  - **Acceptance check:** Build passes; placeholder function exists.

- [ ] **Create shared storage helpers**

  - `lib/storage.ts`

    - `getBool(key:string, fallback:boolean): boolean`
    - `setBool(key:string, val:boolean): void`
    - Const key: `SOUND_ALLOWED_KEY = 'reels:soundAllowed'`

  - **Acceptance check:** Unit-style try/catch in a scratch file confirms read/write.

- [ ] **Add baseline Tailwind v4 utilities**

  - Ensure `@theme` tokens or equivalent present; add utility for full-viewport: `.h-dvh { height: 100dvh }`
  - **Acceptance check:** Dev server shows an element at exact device height.

---

# Phase 1 — Index Grid (Entry Point) → Feed Route

> Goal: users land on a grid of clickable thumbnails and can enter the feed at a specific item.

- [ ] **Index page grid**

  - `app/page.tsx` (or `pages/index.tsx`): render a grid of mock `FeedItem` thumbnails (use poster/src as image).
  - Tailwind: responsive 2–3 columns, aspect-video cells.
  - **Acceptance check:** Thumbnails display; layout responsive.

- [ ] **Link into feed by ID**

  - When a card is clicked, `push('/feed?startId=' + item.id)`.
  - **Acceptance check:** URL updates correctly on click.

- [ ] **Create feed route shell**

  - `app/feed/page.tsx` (or `pages/feed.tsx`) with a blank full-screen container and “Back” affordance.
  - Read `startId` from `searchParams` and log it.
  - **Acceptance check:** Navigating to `/feed?startId=xyz` renders shell and logs ID.

---

# Phase 2 — Virtualized Vertical List (No Player Yet)

> Goal: full-viewport virtual list that snaps vertically; measured with `react-virtual`.

- [ ] **Feed layout + container refs**

  - `components/ReelsFeed.tsx` with:

    - Parent scroll container: `className="relative w-full h-dvh overflow-y-scroll snap-y snap-mandatory"`
    - A `parentRef` assigned to this container.

  - **Acceptance check:** Container fills screen, scrolls.

- [ ] **Virtualizer setup**

  - Install/import `@tanstack/react-virtual`.
  - `const rowVirtualizer = useVirtualizer({ count: items.length, getScrollElement:()=>parentRef.current, estimateSize:()=>window.innerHeight, overscan:1 })`
  - Render virtual rows as absolutely-positioned wrappers with `style={{ transform: \`translateY(${virtualRow.start}px)` }}`and`height: virtualRow.size`.
  - **Acceptance check:** Placeholder rows render with correct heights.

- [ ] **Scroll-snap per row**

  - Each row wrapper: `className="snap-start h-dvh w-full"`
  - **Acceptance check:** Native scroll snaps between rows.

- [ ] **Start index resolution**

  - Given `startId`, compute initial index; on mount, `parentRef.current?.scrollTo({ top: index * window.innerHeight })`.
  - **Acceptance check:** Feed opens on the item matching `startId`.

---

# Phase 3 — Mux Player Adapter & Single Active Playback

> Goal: render a Mux player inside each row, but only the active row plays.

- [ ] **Player adapter component**

  - `components/PlayerMux.tsx`:

    - Wraps `<MuxPlayer ... />` from `@mux/mux-player-react`
    - Props: `{ src:string; poster?:string; muted:boolean; onReady?:()=>void; onError?:(e:unknown)=>void }`
    - Set `playsInline`, `preferPlayback="mse"`, `preload="metadata"`, captions via `<track>` loop if provided.

  - **Acceptance check:** A single instance renders and loads metadata.

- [ ] **Active index detection (IntersectionObserver)**

  - `hooks/useActiveIndex.ts`:

    - Given container and item refs, observe row visibility with `threshold: 0.6`.
    - Emits `activeIndex`.

  - **Acceptance check:** Log updates as you scroll; only one row at a time becomes active.

- [ ] **Play/pause policy**

  - In row render: if `index === activeIndex` → render `PlayerMux` and call `play()` via ref once `canplay`.
  - If not active → `pause()` or unmount (temporarily keep mounted).
  - **Acceptance check:** Only the visible row plays; others are paused.

---

# Phase 4 — Global Sound Opt-In (Gesture Gated)

> Goal: comply with mobile autoplay rules: first visit muted, a tap enables sound for the session (persisted).

- [ ] **Sound context**

  - `context/SoundContext.tsx`:

    - State: `soundAllowed:boolean`, `setSoundAllowed()`.
    - Initialize from `getBool(SOUND_ALLOWED_KEY,false)`.

  - **Acceptance check:** Devtools shows state toggling.

- [ ] **Unmute flow**

  - Add a mute/unmute button overlay on the active row (simple absolute button).
  - On first unmute click:

    - Set `soundAllowed=true` (context + `setBool`).
    - For the **active** player, set `muted=false` and retry `play()`; if promise rejects, revert to `muted=true` and show one-time tooltip.

  - **Acceptance check:** After enabling sound once, next items start unmuted automatically.

- [ ] **Default autoplay muted**

  - Active player initial `muted = !soundAllowed`.
  - **Acceptance check:** Fresh session → muted; after enabling, subsequent rows play with sound.

---

# Phase 5 — Strict Lifecycle: Mount Only Near Active

> Goal: reduce memory/CPU; only keep `activeIndex ± 1` mounted.

- [ ] **Mount window**

  - In the virtual row render, conditionally render `PlayerMux` only if `Math.abs(index - activeIndex) <= 1`.
  - **Acceptance check:** Scrolling logs show players unmount/mount around the current row; memory stays stable.

- [ ] **Cleanup on unmount**

  - Ensure `PlayerMux` tears down event listeners on unmount.
  - **Acceptance check:** No console leaks; performance profile shows no lingering media elements.

---

# Phase 6 — Predictive Prefetch (JSON) & Preload (Media)

> Goal: fetch more items ahead and warm the next N players without full buffering.

- [ ] **Prefetch policy config**

  - `config/prefetch.ts` with `export const PREFETCH:PrefetchPolicy = { fetchCountAhead: 8, preloadCountAhead: 2 }`
  - **Acceptance check:** Values import correctly.

- [ ] **JSON prefetch trigger**

  - When `activeIndex >= items.length - PREFETCH.fetchCountAhead`, call `fetchMore({cursor})` (provided externally), append unique items by `id`.
  - **Acceptance check:** Items length grows before you reach the end; no duplicates.

- [ ] **Media preload**

  - For rows `i` where `activeIndex < i <= activeIndex + PREFETCH.preloadCountAhead`, mount `PlayerMux` with `preload="metadata"` and **do not** `play()`.
  - **Acceptance check:** Network panel shows manifest/metadata fetched for next items; switching to next row has fast start.

- [ ] **Adaptive preload (optional)**

  - If `navigator.connection?.effectiveType` is `2g`/`slow-2g`, reduce `preloadCountAhead` to 1.
  - **Acceptance check:** Preload behavior changes on simulated throttling.

---

# Phase 7 — Gesture Threshold Snapping (Enhance Scroll Feel)

> Goal: add deterministic swipe thresholds while preserving native feel.

- [ ] **Gesture capture hook**

  - `hooks/useSwipeSnap.ts`:

    - Attach touch listeners to the scroll container; track `startY`, `deltaY`, peak velocity.
    - Config: `SWIPE_THRESHOLD_PX=80`, `SWIPE_VELOCITY=0.35`.

  - **Acceptance check:** Hook reports “next/prev/none” decisions in console.

- [ ] **Programmatic snap**

  - On “next” or “prev” decision, call `scrollTo({ top: targetIndex * viewportHeight, behavior:'smooth' })` and temporarily debounce further gestures until `scrollend`.
  - **Acceptance check:** Small swipes under threshold don’t move; larger swipes snap exactly one card.

- [ ] **Wheel/keyboard support**

  - Normalize wheel deltas; ArrowUp/Down or PageUp/PageDown to move ±1.
  - **Acceptance check:** Desktop UX matches mobile intent.

---

# Phase 8 — Orientation & Resize Handling

> Goal: keep the video full-bleed and controls reachable across rotations and dynamic toolbars.

- [ ] **Orientation state**

  - `hooks/useOrientation.ts`:

    - `screen.orientation` where available, fallback to `matchMedia('(orientation: portrait)')`.

  - **Acceptance check:** Logs change on device rotate or devtools rotate.

- [ ] **Viewport height recalculation**

  - On resize/orientation change, recompute row size using `100dvh` and update virtualizer `measure`.
  - **Acceptance check:** No cropping or gaps after rotation; rows remain exactly viewport tall.

- [ ] **Aspect handling**

  - CSS: videos `object-fit: cover` in portrait; `contain` in landscape if desired; ensure safe thumb zones for controls.
  - **Acceptance check:** No letterbox surprises; controls stay tappable.

---

# Phase 9 — Overlay Controls & Share

> Goal: minimal but complete controls: mute, volume, details, share.

- [ ] **Overlay scaffolding**

  - `components/OverlayControls.tsx`:

    - Mute toggle, volume range, details button, share button.
    - Position with Tailwind (top-right mute; bottom action rail).

  - **Acceptance check:** Controls visible on active row; inert on inactive rows.

- [ ] **Wire mute/volume**

  - Tie to `PlayerMux` ref methods and SoundContext.
  - Persist volume to `localStorage`.
  - **Acceptance check:** Volume persists across items and refresh.

- [ ] **Share**

  - If `navigator.share`, call with `{ url: item.shareUrl, title: item.title }`, else copy to clipboard (`navigator.clipboard.writeText`).
  - Toast on success/fail (simple local state).
  - **Acceptance check:** Mobile share sheet opens; desktop copies link.

- [ ] **Details panel**

  - Expandable panel with `title`, `creator.handle`, simple stats if present.
  - **Acceptance check:** Panel toggles without affecting playback.

---

# Phase 10 — Infinite Loading Edge Cases & Errors

> Goal: keep UX smooth when pages end, fail, or return short lists.

- [ ] **De-dup by `id`**

  - Maintain a `Set` of seen IDs; filter before merging.
  - **Acceptance check:** No duplicate rows even if server retries/reorders.

- [ ] **Backoff + retry**

  - On fetch failure: show non-blocking toast; retry in background with exponential backoff (e.g., 1.5× up to 4 tries).
  - **Acceptance check:** Simulated 500 recovers; UI remains interactive.

- [ ] **End-of-feed**

  - If several consecutive fetches return 0 items, mark `endOfFeed=true`; show CTA (“Refresh feed” or “Back to grid”).
  - **Acceptance check:** Clear end state rendered without console errors.

---

# Phase 11 — Page/Tab Visibility & Power Savers

> Goal: pause responsibly when hidden to save battery and avoid audio surprises.

- [ ] **Visibility listener**

  - On `document.visibilitychange`, if hidden → pause active; if visible → resume per policy.
  - **Acceptance check:** Switching tabs pauses; returning resumes.

- [ ] **Low power / data saver**

  - If `navigator.connection?.saveData===true`, set `preloadCountAhead=0`.
  - **Acceptance check:** Network panel shows no preloads in Data Saver.

---

# Phase 12 — Analytics Hooks (Minimal)

> Goal: enough signals to tune UX and streaming QoS later.

- [ ] **Event bus**

  - `lib/analytics.ts`: simple `track(event:string, payload?:Record<string,unknown>)`.
  - **Acceptance check:** Calls log as JSON to console.

- [ ] **Playback events**

  - From `PlayerMux`: track `viewStart`, `viewEnd`, `play`, `pause`, `mutedChange`, `error`, `rebuffer` (if available).
  - **Acceptance check:** Events fire on scroll, pause/unpause, errors.

- [ ] **Navigation events**

  - Swipe counts, thresholds crossed, TTFF of next row (Date.now from activation → first `playing`).
  - **Acceptance check:** Metrics appear in console.

---

# Phase 13 — Accessibility & Reduced Motion

> Goal: basic keyboard and motion sensitivity.

- [ ] **Keyboard map**

  - Space toggles play/pause; Arrow keys move ±1; Escape closes details.
  - **Acceptance check:** Works on desktop without mouse.

- [ ] **Reduced motion**

  - `@media (prefers-reduced-motion: reduce)`:

    - Disable smooth scroll on programmatic snaps; reduce overlay animations.

  - **Acceptance check:** Devtools emulation shows instant snaps.

- [ ] **Labels**

  - Add `aria-label` and `aria-pressed` to controls; focus outlines visible.
  - **Acceptance check:** Tab order sensible; screen reader announces buttons.

---

# Phase 14 — Performance Hardening

> Goal: keep main thread free and memory bounded on mid-tier Android.

- [ ] **Virtual window budget**

  - Confirm only `active ± 1` mounted; increase to ±2 behind a dev flag to compare.
  - **Acceptance check:** Timeline shows < 70% main thread busy while scrolling.

- [ ] **HLS resource cleanup**

  - Ensure Mux player releases buffers when unmounted; validate no cumulative GPU memory growth across 50+ scrolls.
  - **Acceptance check:** Performance/Memory panel stable after long scroll.

- [ ] **Preconnects**

  - Add `<link rel="preconnect" href="https://stream.mux.com">` and poster CDN.
  - **Acceptance check:** First request handshake faster (inspect headers).

---

# Phase 15 — Routing niceties & Back navigation

> Goal: deep linkability and smooth return to grid.

- [ ] **Deep link to item**

  - Update URL on active change: `router.replace('/feed?startId='+currentId, { scroll:false })`.
  - **Acceptance check:** Refresh on feed keeps current item.

- [ ] **Back to grid**

  - “Back” button returns to `/` and scrolls to the tapped thumbnail (store last index in sessionStorage).
  - **Acceptance check:** Index page restores scroll position.

---

# Phase 16 — QA Matrix & Final Switches

> Goal: verify on real devices and capture toggles for fast iteration.

- [ ] **Device QA checklist**

  - iOS Safari (latest-1), Chrome iOS
  - Android Chrome (mid-tier), Samsung Internet
  - Desktop Chrome/Edge/Firefox/Safari
  - Portrait/landscape, reduced motion, data saver
  - **Acceptance check:** All green or documented issues.

- [ ] **Feature flags**

  - Env-controlled: `VIRTUAL_WINDOW_AHEAD`, `PREFETCH_FETCH_AHEAD`, `PREFETCH_PRELOAD_AHEAD`, `SWIPE_THRESHOLD_PX`, `SWIPE_VELOCITY`.
  - **Acceptance check:** Changing env values at build time changes behavior.

---

## Notes to Developer

- **Files you’ll create (summary):**

  - `types/feed.ts`, `lib/feed-api.ts`, `lib/storage.ts`, `lib/analytics.ts`
  - `context/SoundContext.tsx`
  - `hooks/useActiveIndex.ts`, `hooks/useSwipeSnap.ts`, `hooks/useOrientation.ts`
  - `components/ReelsFeed.tsx`, `components/PlayerMux.tsx`, `components/OverlayControls.tsx`
  - `config/prefetch.ts`
  - `app/page.tsx` (grid), `app/feed/page.tsx` (feed) **or** equivalent in `pages/`

- **External deps already installed:** `@mux/mux-player-react`, `@tanstack/react-virtual`.

- **Provided externally:** `fetchMore({cursor,limit})` returning `{ items, nextCursor }`.

- **CSS essentials:** `h-dvh`, `snap-y snap-mandatory`, `snap-start`, `object-cover`.

This sequence builds up **incrementally**, with a visible/testable outcome at each step, and keeps the critical constraints front-and-center: **autoplay policy compliance, virtualization/memory discipline, prefetch & preload separation, and rotation-safe layout**.
