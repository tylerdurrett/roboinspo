# TouchDesigner Resources System

A markdown-based content management system for curating TouchDesigner learning resources.

## Architecture

```
content/                          # Markdown content (source of truth)
├── creators/*.md                 # People who create content
├── organizations/*.md            # Companies, institutions, communities
└── resources/*.md                # Learning resources (YouTube, courses, etc.)

velite.config.ts                  # Schema definitions & validation
.velite/                          # Generated output (gitignored)

src/lib/td-resources/             # Data access layer
├── types.ts                      # TypeScript types
├── schemas.ts                    # Taxonomy constants & labels
├── data.ts                       # Data access functions
└── index.ts                      # Barrel export

src/app/(with-nav)/touchdesigner/resources/
├── page.tsx                      # Resources index
└── [slug]/page.tsx               # Resource detail page

src/components/td-resources/      # UI components
├── ResourcesPageClient.tsx       # Filter state management
├── ResourcesFilters.tsx          # Filter controls
├── ResourcesTable.tsx            # TanStack Table
├── columns.tsx                   # Column definitions
├── MultiSelect.tsx               # Reusable filter dropdown
└── ResourceDetail.tsx            # Detail page layout
```

## Content Collections

### Creators

Individual people who produce content.

```yaml
# content/creators/bileam-tschepe.md
---
name: Bileam Tschepe
aliases:
  - Elekktronaut
bio: Berlin-based artist and educator.
location: Berlin, Germany
website: https://elekktronaut.com
socials:
  youtube: '@elekktronaut'
  patreon: elekktronaut
---
Optional markdown body for extended bio.
```

### Organizations

Companies, platforms, institutions, or communities.

```yaml
# content/organizations/derivative.md
---
name: Derivative
type: company # company | platform | institution | community
description: Creator of TouchDesigner software.
website: https://derivative.ca
location: Toronto, Canada
---
Optional markdown body.
```

### Resources

Learning resources (the primary collection users browse).

```yaml
# content/resources/elekktronaut-youtube.md
---
title: Elekktronaut YouTube Channel
url: https://www.youtube.com/@elekktronaut
status: active # active | inactive | archived
lastVerified: 2026-01-15
sourceType: youtube # youtube | patreon | blog | course | github | aggregator | forum | discord | website | social
pricingModel: freemium # free | freemium | paid
skillLevels:
  - beginner
  - intermediate
topics:
  - audio-reactive
  - feedback-loops
domains:
  - generative-art
creatorSlugs:
  - bileam-tschepe
description: Design-focused TouchDesigner tutorials.
featured: true
---
Optional markdown body with additional notes.
```

## Relationships

Resources reference creators and organizations by slug:

- `creatorSlugs: string[]` - References to creator file slugs (many-to-many)
- `orgSlug: string` - Reference to organization file slug (many-to-one)

Relationships are resolved at runtime via the data access layer:

```typescript
import { getResourceWithRelations } from '@/lib/td-resources'

const resource = getResourceWithRelations('elekktronaut-youtube')
// resource.creators → [{ name: 'Bileam Tschepe', ... }]
// resource.organization → undefined (no org assigned)
```

## Taxonomies

Predefined enum values validated at build time:

| Field          | Values                                                                              |
| -------------- | ----------------------------------------------------------------------------------- |
| `skillLevels`  | beginner, intermediate, advanced                                                    |
| `sourceType`   | youtube, patreon, blog, course, github, aggregator, forum, discord, website, social |
| `pricingModel` | free, freemium, paid                                                                |
| `status`       | active, inactive, archived                                                          |
| `topics`       | 36 values (fundamentals, python, glsl, audio-reactive, etc.)                        |
| `domains`      | 11 values (generative-art, vj-performance, installations, etc.)                     |

Full lists in [schemas.ts](../src/lib/td-resources/schemas.ts).

## Slug Handling

- Slugs auto-generate from filename (e.g., `bileam-tschepe.md` → `slug: "bileam-tschepe"`)
- Optional explicit `slug` field for overrides
- Global uniqueness enforced across all collections (build fails on duplicates)

## Data Access Layer

```typescript
import {
  // Basic getters
  getResources,
  getCreators,
  getOrganizations,
  getResourceBySlug,
  getFeaturedResources,

  // With relationships resolved
  getResourceWithRelations,
  getResourcesWithRelations,

  // Lookups
  getResourcesByCreator,
  getResourcesByOrganization,

  // Filtering
  filterResources,
  defaultFilterState,

  // Taxonomy constants & labels
  sourceTypes,
  sourceTypeLabels,
  skillLevels,
  // etc.
} from '@/lib/td-resources'
```

## Filtering

The UI supports multi-select filtering with:

- **Search**: Matches title and description (case-insensitive)
- **Source Type, Pricing, Status**: OR within category
- **Skill Levels, Topics, Domains**: OR within category (resource must have ANY selected value)
- Categories combine with AND logic

Default filter: `status: ['active']` (hides inactive/archived resources)

## Build Process

Velite runs automatically with Next.js dev/build:

```bash
npm run dev              # Velite watches content/ and rebuilds on changes
npm run build            # Full production build
npm run content:build    # Manual Velite build
npm run content:watch    # Manual Velite watch mode
```

Build-time validation:

- Schema validation (required fields, URL format, date format, enum values)
- Global slug uniqueness check
- Output to `.velite/` directory

## Exporting Data

Export content to stdout for external use:

```bash
npm run export <type> [options]

# Types: creators, resources, organizations

# Options:
#   --fields=f1,f2  Export specific fields
#   --full          Export all fields
#   --json          Output as JSON (default: plain text/CSV)
#   --resolve       Resolve relationship slugs to names

# Examples:
npm run export creators                              # Names, one per line
npm run export creators -- --json                    # JSON array
npm run export creators -- --fields=name,bio        # CSV with headers
npm run export resources -- --full --resolve --json  # Full objects with resolved creators

# Save to file:
npm run export creators > creators.txt
```

Run `npm run export` for help and available fields.

## Adding Content

1. Create a markdown file in the appropriate `content/` subdirectory
2. Add required frontmatter fields per schema
3. Save — Velite rebuilds automatically in dev mode
4. Verify at `/touchdesigner/resources`

Example workflow for a new resource:

```bash
# 1. Create the resource file
# content/resources/paketa12-youtube.md

# 2. Optionally create creator file if new
# content/creators/aurelian-ionus.md

# 3. Reference creator in resource
# creatorSlugs: [aurelian-ionus]
```

## Key Design Decisions

| Decision                | Choice                                 | Rationale                                     |
| ----------------------- | -------------------------------------- | --------------------------------------------- |
| Relationship storage    | Slug references (not embedded objects) | Avoids circular JSON, clean data model        |
| Relationship resolution | Runtime via data layer                 | Flexible, efficient Map-based O(1) lookups    |
| Taxonomy approach       | Predefined enums in config             | Type-safe, validated at build time            |
| Slug generation         | Auto from filename                     | Reduces friction, explicit override available |

## Related Files

- Velite config: [velite.config.ts](../velite.config.ts)
- Data layer: [src/lib/td-resources/](../src/lib/td-resources/)
- Components: [src/components/td-resources/](../src/components/td-resources/)
