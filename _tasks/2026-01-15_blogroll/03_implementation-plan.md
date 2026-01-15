# Phase 1C: Implementation Plan

## Overview

This document details the implementation plan for adding a markdown-based TouchDesigner resources database to the robo-inspo website. The system uses Velite for content processing, TanStack Table for the UI, and follows established codebase patterns.

---

## Architecture Summary

```
robo-inspo/
├── content/                          # Markdown content (future: separate repo)
│   ├── creators/
│   │   └── *.md
│   ├── organizations/
│   │   └── *.md
│   └── resources/
│       └── *.md
├── velite.config.ts                  # Schema definitions & relationships
├── .velite/                          # Generated output (gitignored)
│   ├── index.js
│   ├── index.d.ts
│   └── *.json
└── src/
    ├── lib/
    │   └── td-resources/             # Data access layer
    │       ├── types.ts              # Exported types
    │       ├── schemas.ts            # Zod schemas (for validation/reuse)
    │       └── data.ts               # Data access functions
    └── app/
        └── (with-nav)/
            └── touchdesigner/
                └── resources/
                    └── page.tsx      # Main resources page
```

---

## Implementation Steps

### Step 1: Install Dependencies

Add Velite and TanStack Table to the project.

**Files to modify:**

- `package.json`

**Dependencies to add:**

```json
{
  "devDependencies": {
    "velite": "^0.2.2"
  },
  "dependencies": {
    "@tanstack/react-table": "^8.21.2"
  }
}
```

**Note:** Velite is a dev dependency because it runs at build time.

---

### Step 2: Configure Velite

Create the Velite configuration with all three collections and relationship resolution.

**Files to create:**

- `velite.config.ts`

**Configuration structure:**

```typescript
import { defineConfig, s } from 'velite'

// Taxonomy definitions (from data model)
const skillLevels = ['beginner', 'intermediate', 'advanced'] as const

const topics = [
  'fundamentals',
  'python',
  'glsl',
  'shaders',
  'audio-reactive',
  'feedback-loops',
  'particles',
  'instancing',
  'point-clouds',
  'raymarching',
  'procedural',
  'textures',
  'projection-mapping',
  'kinect',
  'leap-motion',
  'mediapipe',
  'arduino',
  'websockets',
  'osc',
  'dmx',
  'optimization',
  'architecture',
  'best-practices',
  'tool-building',
] as const

const domains = [
  'generative-art',
  'vj-performance',
  'installations',
  'live-performance',
  'hardware-integration',
  'ai-ml',
  'projection-mapping',
  'led-mapping',
  'motion-capture',
  'video-synthesis',
  'education',
] as const

const organizationTypes = [
  'company',
  'platform',
  'institution',
  'community',
] as const
const resourceStatuses = ['active', 'inactive', 'archived'] as const
const sourceTypes = [
  'youtube',
  'patreon',
  'blog',
  'course',
  'github',
  'aggregator',
  'forum',
  'discord',
  'website',
  'social',
] as const
const pricingModels = ['free', 'freemium', 'paid'] as const

// Collections
const creators = {
  name: 'Creator',
  pattern: 'creators/*.md',
  schema: s.object({
    name: s.string(),
    slug: s.slug('creators'),
    aliases: s.array(s.string()).optional(),
    bio: s.string().optional(),
    location: s.string().optional(),
    website: s.string().url().optional(),
    socials: s
      .object({
        youtube: s.string().optional(),
        patreon: s.string().optional(),
        github: s.string().optional(),
        twitter: s.string().optional(),
        instagram: s.string().optional(),
        linkedin: s.string().optional(),
        discord: s.string().optional(),
      })
      .optional(),
    avatar: s.string().optional(),
    body: s.markdown(),
  }),
}

const organizations = {
  name: 'Organization',
  pattern: 'organizations/*.md',
  schema: s.object({
    name: s.string(),
    slug: s.slug('organizations'),
    type: s.enum(organizationTypes),
    description: s.string().optional(),
    website: s.string().url(),
    logo: s.string().optional(),
    location: s.string().optional(),
    body: s.markdown(),
  }),
}

const resources = {
  name: 'Resource',
  pattern: 'resources/*.md',
  schema: s.object({
    title: s.string(),
    slug: s.slug('resources'),
    url: s.string().url(),
    status: s.enum(resourceStatuses),
    lastVerified: s.isodate(),
    sourceType: s.enum(sourceTypes),
    pricingModel: s.enum(pricingModels),
    skillLevels: s.array(s.enum(skillLevels)).optional(),
    topics: s.array(s.enum(topics)).optional(),
    domains: s.array(s.enum(domains)).optional(),
    creatorSlugs: s.array(s.string()).optional(),
    orgSlug: s.string().optional(),
    description: s.string(),
    featured: s.boolean().default(false),
    body: s.markdown(),
  }),
}

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { creators, organizations, resources },
  prepare: ({ creators, organizations, resources }) => {
    // Resolve relationships: attach full creator/org objects to resources
    const creatorsMap = new Map(creators.map((c) => [c.slug, c]))
    const orgsMap = new Map(organizations.map((o) => [o.slug, o]))

    resources.forEach((resource) => {
      // Resolve creators
      if (resource.creatorSlugs?.length) {
        resource.creators = resource.creatorSlugs
          .map((slug) => creatorsMap.get(slug))
          .filter(Boolean)
      }
      // Resolve organization
      if (resource.orgSlug) {
        resource.organization = orgsMap.get(resource.orgSlug)
      }
    })

    // Build reverse relationships
    creators.forEach((creator) => {
      creator.resources = resources.filter((r) =>
        r.creatorSlugs?.includes(creator.slug)
      )
    })

    organizations.forEach((org) => {
      org.resources = resources.filter((r) => r.orgSlug === org.slug)
    })
  },
})
```

---

### Step 3: Integrate Velite with Next.js

Modify the Next.js configuration to run Velite during development and build.

**Files to modify:**

- `next.config.ts`

**Add to the top of the file:**

```typescript
const isDev = process.argv.indexOf('dev') !== -1
const isBuild = process.argv.indexOf('build') !== -1
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = '1'
  import('velite').then((m) => m.build({ watch: isDev, clean: !isDev }))
}
```

**Update .gitignore:**
Add `.velite/` to gitignore (build artifacts should not be committed).

**Update tsconfig.json paths:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "#content": ["./.velite"]
    }
  }
}
```

---

### Step 4: Create Content Directory Structure

Set up the markdown content directories with example seed files.

**Directories to create:**

- `content/creators/`
- `content/organizations/`
- `content/resources/`

**Seed files (examples):**

`content/creators/bileam-tschepe.md`:

```yaml
---
name: Bileam Tschepe
aliases:
  - Elekktronaut
bio: Berlin-based artist and educator known for design-focused TouchDesigner tutorials.
location: Berlin, Germany
website: https://elekktronaut.com
socials:
  youtube: '@elekktronaut'
  patreon: elekktronaut
  instagram: elekktronaut
---
Bileam Tschepe, known online as Elekktronaut, has produced over 84 TouchDesigner tutorials focusing on audio-reactive and aesthetic-driven projects.
```

`content/organizations/derivative.md`:

```yaml
---
name: Derivative
type: company
description: Creator and maintainer of TouchDesigner software.
website: https://derivative.ca
---
Derivative is the company behind TouchDesigner, providing official documentation, tutorials, and community resources.
```

`content/resources/elekktronaut-youtube.md`:

```yaml
---
title: Elekktronaut YouTube Channel
url: https://www.youtube.com/@elekktronaut
status: active
lastVerified: 2026-01-15
sourceType: youtube
pricingModel: freemium
skillLevels:
  - beginner
  - intermediate
topics:
  - audio-reactive
  - feedback-loops
  - procedural
domains:
  - generative-art
  - vj-performance
creatorSlugs:
  - bileam-tschepe
description: Design-focused TouchDesigner tutorials emphasizing aesthetic visuals and audio reactivity.
featured: true
---
Bileam's channel is renowned for high production value and approachable explanations of complex visual techniques.
```

---

### Step 5: Create Data Access Layer

Create typed exports and helper functions for accessing the content.

**Files to create:**

- `src/lib/td-resources/types.ts`
- `src/lib/td-resources/schemas.ts`
- `src/lib/td-resources/data.ts`
- `src/lib/td-resources/index.ts`

**`src/lib/td-resources/types.ts`:**

```typescript
// Re-export generated types from Velite
export type { Creator, Organization, Resource } from '#content'

// UI-specific types
export interface ResourceWithRelations {
  // ... extends Resource with resolved creator/org objects
}

export type FilterState = {
  sourceType: string[]
  pricingModel: string[]
  skillLevels: string[]
  topics: string[]
  domains: string[]
  status: string[]
  search: string
}
```

**`src/lib/td-resources/schemas.ts`:**

```typescript
// Export taxonomy constants for use in filters
export const skillLevels = ['beginner', 'intermediate', 'advanced'] as const
export const topics = [
  /* ... */
] as const
export const domains = [
  /* ... */
] as const
export const sourceTypes = [
  /* ... */
] as const
export const pricingModels = ['free', 'freemium', 'paid'] as const
export const statuses = ['active', 'inactive', 'archived'] as const
```

**`src/lib/td-resources/data.ts`:**

```typescript
import { creators, organizations, resources } from '#content'

export function getResources() {
  return resources
}

export function getCreators() {
  return creators
}

export function getOrganizations() {
  return organizations
}

export function getResourceBySlug(slug: string) {
  return resources.find((r) => r.slug === slug)
}

export function getFeaturedResources() {
  return resources.filter((r) => r.featured && r.status === 'active')
}
```

---

### Step 6: Build the Resources Page UI

Create the TouchDesigner Resources page with TanStack Table.

**Files to create:**

- `src/app/(with-nav)/touchdesigner/resources/page.tsx`
- `src/app/(with-nav)/touchdesigner/resources/[slug]/page.tsx` (detail page)
- `src/components/td-resources/ResourcesTable.tsx`
- `src/components/td-resources/ResourcesFilters.tsx`
- `src/components/td-resources/ResourceDetail.tsx`
- `src/components/td-resources/columns.tsx`

**Page structure:**

`src/app/(with-nav)/touchdesigner/resources/page.tsx`:

```typescript
import { Metadata } from 'next'
import { getResources, getCreators, getOrganizations } from '@/lib/td-resources'
import { ResourcesPageClient } from '@/components/td-resources/ResourcesPageClient'

export const metadata: Metadata = {
  title: 'TouchDesigner Resources | Robo Inspo',
  description: 'A curated database of TouchDesigner tutorials, courses, and learning resources.',
}

export default async function TouchDesignerResourcesPage() {
  const resources = getResources()
  const creators = getCreators()
  const organizations = getOrganizations()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">TouchDesigner Resources</h1>
      <p className="text-muted-foreground mb-8">
        A curated collection of tutorials, courses, and learning materials for TouchDesigner.
      </p>
      <ResourcesPageClient
        resources={resources}
        creators={creators}
        organizations={organizations}
      />
    </div>
  )
}
```

**Client component structure:**

`src/components/td-resources/ResourcesPageClient.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { ResourcesTable } from './ResourcesTable'
import { ResourcesFilters } from './ResourcesFilters'
import { ViewToggle } from './ViewToggle'
import type { Resource, Creator, Organization, FilterState } from '@/lib/td-resources'

interface Props {
  resources: Resource[]
  creators: Creator[]
  organizations: Organization[]
}

export function ResourcesPageClient({ resources, creators, organizations }: Props) {
  const [view, setView] = useState<'table' | 'grid'>('table')
  const [filters, setFilters] = useState<FilterState>({
    sourceType: [],
    pricingModel: [],
    skillLevels: [],
    topics: [],
    domains: [],
    status: ['active'], // Default to showing only active
    search: '',
  })

  // Filter logic
  const filteredResources = filterResources(resources, filters)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <ResourcesFilters filters={filters} onFiltersChange={setFilters} />
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {view === 'table' ? (
        <ResourcesTable resources={filteredResources} />
      ) : (
        <ResourcesGrid resources={filteredResources} />
      )}
    </div>
  )
}
```

**Detail page:**

`src/app/(with-nav)/touchdesigner/resources/[slug]/page.tsx`:

```typescript
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getResourceBySlug, getResources } from '@/lib/td-resources'
import { ResourceDetail } from '@/components/td-resources/ResourceDetail'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const resources = getResources()
  return resources.map(r => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const resource = getResourceBySlug(slug)
  if (!resource) return { title: 'Not Found' }

  return {
    title: `${resource.title} | TouchDesigner Resources`,
    description: resource.description,
  }
}

export default async function ResourceDetailPage({ params }: Props) {
  const { slug } = await params
  const resource = getResourceBySlug(slug)

  if (!resource) {
    notFound()
  }

  return <ResourceDetail resource={resource} />
}
```

**ResourceDetail component displays:**

- Title with prominent "Visit Resource" external link button
- Description (full markdown body if present)
- Metadata badges (source type, pricing, status, skill levels)
- Topics and domains as tags
- Creator card(s) with name, bio, socials
- Organization card if present
- Last verified date
- Back to resources link

**TanStack Table implementation:**

`src/components/td-resources/ResourcesTable.tsx`:

- Define columns for: Title, Source Type, Pricing, Skill Levels, Creator(s), Status
- Enable sorting on all columns
- Title links to detail page; small external link icon for direct URL access
- Responsive design with horizontal scroll on mobile

`src/components/td-resources/columns.tsx`:

- Column definitions with accessor functions
- Cell renderers for badges (status, pricing, source type)
- Link handling for external URLs

**Filter components:**

`src/components/td-resources/ResourcesFilters.tsx`:

- Multi-select dropdowns for each taxonomy
- Search input for text filtering
- Clear all filters button
- Responsive: collapsible on mobile

---

### Step 7: Update Homepage

Modify the homepage to show the new navigation options.

**Files to modify:**

- `src/app/page.tsx`

**Changes:**

1. Remove "THINGS" and "LOOKING" links
2. Change to "READING LIST" (→ `/reading`) and "TD RESOURCES" (→ `/touchdesigner/resources`)
3. Reduce font size from `12vw` to accommodate longer text (suggest `8vw` or responsive sizing)

**Updated homepage:**

```typescript
export default function Home() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col gap-[2vh] items-center justify-center">
        <Link
          href="/reading"
          className="text-[8vw] font-bold tracking-wider hover:opacity-70 transition-opacity duration-300 text-center leading-none"
        >
          READING LIST
        </Link>
        <Link
          href="/touchdesigner/resources"
          className="text-[8vw] font-bold tracking-wider hover:opacity-70 transition-opacity duration-300 text-center leading-none"
        >
          TD RESOURCES
        </Link>
      </div>
    </div>
  )
}
```

---

### Step 8: Update Navigation

Update the top navigation to reflect the new site structure.

**Files to modify:**

- `src/components/layouts/top-nav.tsx`

**Changes:**

1. Update `navItems` array to:

```typescript
const navItems = [
  { label: 'READING LIST', href: '/reading' },
  { label: 'TD RESOURCES', href: '/touchdesigner/resources' },
]
```

2. Adjust padding/font sizing if needed to accommodate longer labels

---

### Step 9: Add npm Scripts

Add convenience scripts for content management.

**Files to modify:**

- `package.json`

**Scripts to add:**

```json
{
  "scripts": {
    "content:build": "velite --clean",
    "content:watch": "velite --watch"
  }
}
```

---

## File Summary

### New Files to Create

| File                                                         | Purpose                                             |
| ------------------------------------------------------------ | --------------------------------------------------- |
| `velite.config.ts`                                           | Velite configuration with schemas and relationships |
| `content/creators/*.md`                                      | Creator markdown files                              |
| `content/organizations/*.md`                                 | Organization markdown files                         |
| `content/resources/*.md`                                     | Resource markdown files                             |
| `src/lib/td-resources/types.ts`                              | Type definitions                                    |
| `src/lib/td-resources/schemas.ts`                            | Taxonomy constants                                  |
| `src/lib/td-resources/data.ts`                               | Data access functions                               |
| `src/lib/td-resources/index.ts`                              | Barrel export                                       |
| `src/app/(with-nav)/touchdesigner/resources/page.tsx`        | Resources list page                                 |
| `src/app/(with-nav)/touchdesigner/resources/[slug]/page.tsx` | Resource detail page                                |
| `src/components/td-resources/ResourcesPageClient.tsx`        | Client wrapper for list                             |
| `src/components/td-resources/ResourcesTable.tsx`             | TanStack Table implementation                       |
| `src/components/td-resources/ResourcesFilters.tsx`           | Filter controls                                     |
| `src/components/td-resources/ResourceDetail.tsx`             | Detail page content                                 |
| `src/components/td-resources/columns.tsx`                    | Column definitions                                  |

### Files to Modify

| File                                 | Changes                                        |
| ------------------------------------ | ---------------------------------------------- |
| `package.json`                       | Add velite, @tanstack/react-table, npm scripts |
| `next.config.ts`                     | Add Velite build integration                   |
| `tsconfig.json`                      | Add `#content` path alias                      |
| `.gitignore`                         | Add `.velite/`                                 |
| `src/app/page.tsx`                   | Update homepage links                          |
| `src/components/layouts/top-nav.tsx` | Update navigation items                        |

---

## UI Components Detail

### ResourcesTable

The main table component using TanStack Table.

**Features:**

- Sortable columns (title, source type, pricing, status, last verified)
- Column visibility toggle
- Responsive horizontal scroll
- External link button for each resource
- Status badge with color coding (active=green, inactive=yellow, archived=gray)
- Source type icons (YouTube, Patreon, GitHub, etc.)
- Pricing badges (free=green, freemium=blue, paid=purple)

**Columns:**

1. **Title** - Resource title, clickable external link
2. **Source Type** - Icon + label (youtube, patreon, etc.)
3. **Pricing** - Badge (free, freemium, paid)
4. **Skill Levels** - Comma-separated or badges
5. **Creator(s)** - Linked creator names (if resolved)
6. **Status** - Badge with color
7. **Last Verified** - Relative date

### ResourcesFilters

Filter panel for narrowing results.

**Filter types:**

- **Search** - Text input, filters title/description
- **Source Type** - Multi-select (YouTube, Patreon, etc.)
- **Pricing Model** - Multi-select (Free, Freemium, Paid)
- **Skill Level** - Multi-select (Beginner, Intermediate, Advanced)
- **Topics** - Multi-select with search (many options)
- **Domains** - Multi-select (generative-art, vj-performance, etc.)
- **Status** - Multi-select, default = active only

**Behavior:**

- Filters are OR within category, AND across categories
- Active filter count shown on collapsed mobile view
- Clear all button resets to defaults

### ViewToggle

Simple toggle between table and grid views.

**States:**

- Table view (default) - compact data table
- Grid view - card-based layout (for future thumbnail support)

---

## Future Package Extraction

The content system is designed for eventual extraction to a separate package.

**What moves to the separate package:**

- `content/` directory (all markdown files)
- `velite.config.ts`
- Type definitions

**What stays in the website:**

- UI components
- Page implementations
- Styling

**Package structure (future):**

```
@tdog/td-resources/
├── content/
│   ├── creators/
│   ├── organizations/
│   └── resources/
├── velite.config.ts
├── package.json
└── dist/
    ├── index.js        # Exported data
    └── index.d.ts      # Types
```

**Integration pattern (future):**

```typescript
// In robo-inspo
import { resources, creators, organizations } from '@tdog/td-resources'
```

---

## Testing Checklist

After implementation, verify:

- [ ] `npm run dev` starts without errors
- [ ] Velite builds content on dev server start
- [ ] `/touchdesigner/resources` page loads
- [ ] Table displays all resources
- [ ] Sorting works on all columns
- [ ] Filters narrow results correctly
- [ ] Search filters by title/description
- [ ] Table title links to detail page
- [ ] Detail page shows full resource info
- [ ] External link button opens resource URL in new tab
- [ ] Homepage shows new links
- [ ] Navigation shows new items
- [ ] Active nav state works for `/touchdesigner/*` routes
- [ ] Mobile responsive design works
- [ ] No TypeScript errors
- [ ] Lint passes

---

## Decisions Made

1. **Grid view:** Table-only for initial launch. Grid view deferred until thumbnails are added.

2. **Detail pages:** Yes - create `/touchdesigner/resources/[slug]` detail pages showing full resource information. Table row title links to detail page; include small external link icon that goes directly to the resource URL.

3. **URL structure:** Use `/touchdesigner/resources` to allow for future `/touchdesigner/*` pages.

4. **Thumbnail support:** Deferred. Data model supports images but UI won't display them initially.

5. **Creator/Org pages:** Deferred. Creators and organizations displayed as related data on resources only.

---

## Implementation Order

Recommended order for implementation:

1. **Dependencies** - Install velite and @tanstack/react-table
2. **Velite config** - Create configuration and test with sample content
3. **Content structure** - Set up directories and seed files
4. **Data layer** - Create type exports and data access functions
5. **Basic page** - Create page with static table (no filters)
6. **TanStack Table** - Implement sorting and basic functionality
7. **Filters** - Add filter controls and logic
8. **Navigation updates** - Update homepage and top nav
9. **Polish** - Responsive design, loading states, edge cases
10. **Testing** - Full verification against checklist

---

## Implementation Notes (2026-01-15)

### Completed Steps (Steps 1-5)

**Step 1: Dependencies - COMPLETE**

- Installed `velite@0.3.1` (dev dependency)
- Installed `@tanstack/react-table@8.21.3` (dependency)

**Step 2: Velite Configuration - COMPLETE with divergence**

- Created `velite.config.ts` with all three collections
- Uses `defineCollection()` function from Velite (updated API)
- **Divergence:** Removed the `prepare` hook for relationship resolution. The original plan had bidirectional relationships (resources → creators AND creators → resources) which caused circular JSON reference errors during serialization. Relationships are now resolved at runtime in the data access layer instead.

**Step 3: Next.js Integration - COMPLETE**

- Updated `next.config.ts` with Velite build integration
- Added `#content` path alias to `tsconfig.json`
- Added `.velite/` to `.gitignore`
- Added npm scripts: `content:build` and `content:watch`

**Step 4: Content Structure - COMPLETE**

- Created `content/creators/`, `content/organizations/`, `content/resources/` directories
- Created seed files:
  - `content/creators/bileam-tschepe.md`
  - `content/creators/matthew-ragan.md`
  - `content/organizations/derivative.md`
  - `content/organizations/the-node-institute.md`
  - `content/resources/elekktronaut-youtube.md`
  - `content/resources/derivative-learn.md`
  - `content/resources/matthew-ragan-blog.md`
- ~~**Note:** Each file requires an explicit `slug` field in frontmatter. Velite's `s.slug()` validates but doesn't auto-generate from filename.~~
- **Updated:** Slugs now auto-generate from filename. Explicit `slug` field is optional (for overrides only).

**Step 5: Data Access Layer - COMPLETE with enhancements**

- Created `src/lib/td-resources/types.ts` - Type re-exports and FilterState
- Created `src/lib/td-resources/schemas.ts` - Taxonomy constants with human-readable labels
- Created `src/lib/td-resources/data.ts` - All data access functions including relationship resolution
- Created `src/lib/td-resources/index.ts` - Barrel export

**Enhancements beyond original plan:**

- Added `resolveCreators()` and `resolveOrganization()` functions for runtime relationship resolution
- Added `getResourceWithRelations()` and `getResourcesWithRelations()` functions
- Added human-readable label maps for all taxonomies (e.g., `sourceTypeLabels`, `skillLevelLabels`)
- Added `defaultFilterState` export

### Key Divergences from Plan

1. **Relationship Resolution Location:**
   - Plan: Use Velite `prepare` hook to embed full creator/org objects in resources
   - Actual: Resolve relationships at runtime in data access layer
   - Reason: Bidirectional relationships caused JSON circular reference errors
   - **Status: ACCEPTED** - Runtime resolution with Map lookups is O(1) and keeps the data layer flexible

2. **Slug Handling:**
   - Plan: Implied auto-generation from filename
   - Actual: ~~Explicit `slug` field required in frontmatter~~
   - **Status: RESOLVED** - Now auto-generates from filename via `.transform()` (see 2026-01-15 Update below)

3. **Output Path:**
   - Plan: `public/static/`
   - Actual: `public/static/content/` (more specific subdirectory)
   - **Status: ACCEPTED** - Minor organizational difference, no impact

### Remaining Steps (Steps 6-9)

- [ ] Step 6: Build Resources page and components (TanStack Table, filters)
- [ ] Step 7: Update Homepage
- [ ] Step 8: Update Navigation
- [ ] Step 9: (Already done - npm scripts were added in Step 3)

### Current State

The foundation is complete and verified:

- Velite builds successfully with `npm run content:build`
- Generated types are correct in `.velite/index.d.ts`
- Data access layer compiles with no TypeScript errors
- All seed content validates against schemas

---

## Update: Divergence Resolution (2026-01-15)

After reviewing the divergences from the original plan, implemented improvements to address the slug handling issue while keeping runtime relationship resolution.

### Changes Made

**1. Auto-Slug Generation from Filename**

Updated `velite.config.ts` to auto-generate slugs from filenames using Velite's `.transform()` with file metadata:

```typescript
schema: s
  .object({
    name: s.string(),
    slug: s.string().optional(), // Optional override
    // ... other fields
  })
  .transform((data, { meta }) => ({
    ...data,
    slug: data.slug ?? basename(meta.path, '.md'),
  })),
```

- Slugs are now derived from the markdown filename (e.g., `bileam-tschepe.md` → `slug: "bileam-tschepe"`)
- Explicit `slug` in frontmatter still works as an override when needed
- Removed redundant `slug` fields from all 7 seed content files

**2. Slug Uniqueness Validation**

Added a `prepare` hook to validate global slug uniqueness across all collections:

```typescript
prepare: ({ creators, organizations, resources }) => {
  const slugSources = new Map<string, string[]>()
  // ... track all slugs and their sources
  if (duplicates.length > 0) {
    throw new Error(`Duplicate slugs found...`)
  }
}
```

- Build fails immediately if duplicate slugs are detected
- Error message clearly identifies which items have conflicting slugs
- Enforces that slugs are globally unique (enabling clean URLs like `/resources/[slug]`)

**3. Relationship Resolution Decision**

Evaluated options for relationship resolution and confirmed the current runtime approach is appropriate:

- **Option A (Rejected):** Embed forward relationships + slug arrays for reverse
  - Would require type changes and more complex data layer
  - Marginal benefit for our use case

- **Option B (Accepted):** Keep runtime resolution in data access layer
  - Map-based lookups are O(1) - no performance concern
  - All resolution logic centralized in `data.ts`
  - Easy to extend with new patterns
  - No circular reference issues

### Files Modified

| File | Changes |
|------|---------|
| `velite.config.ts` | Added `basename` import, `.transform()` for auto-slug, `prepare` hook for uniqueness validation |
| `content/creators/*.md` | Removed explicit `slug` fields (2 files) |
| `content/organizations/*.md` | Removed explicit `slug` fields (2 files) |
| `content/resources/*.md` | Removed explicit `slug` fields (3 files) |

### Verification

- ✅ `npm run content:build` succeeds
- ✅ Generated JSON has correct slugs derived from filenames
- ✅ TypeScript compilation passes (`npx tsc --noEmit`)
- ✅ All existing functionality preserved

---

## References

- [Velite Documentation](https://velite.js.org)
- [TanStack Table Documentation](https://tanstack.com/table/latest)
- [Phase 1A: Tech Stack Decision](./01_tech-stack.md)
- [Phase 1B: Data Model Design](./02_data-model.md)
