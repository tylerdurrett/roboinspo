# Phase 1B: Data Model Design

## Overview

This document defines the data model for the markdown-based blogroll database. The system uses **Velite** to process markdown files with frontmatter into type-safe JSON.

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Creator vs Organization | Separate entities | Organizations can have multiple creators; frontend handles display logic |
| Resource granularity | Channel/site level | Individual tutorials deferred to future "Content" collection |
| Taxonomy approach | Predefined enum fields | Type-safe validation without over-engineering separate tag files |
| Multi-creator support | Yes (array) | Supports collaborative resources |
| Freshness tracking | lastVerified date | Helps identify stale links |

---

## Collections

### 1. Creator

Represents an individual person who produces content.

**Directory:** `content/creators/`
**Pattern:** `*.md`

#### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name of the person |
| `slug` | string | Auto | URL-safe identifier (derived from filename) |
| `aliases` | string[] | No | Brand names or alternate identities (e.g., "Elekktronaut") |
| `bio` | string | No | Short biography (1-2 sentences) |
| `location` | string | No | City, Country format |
| `website` | string (URL) | No | Primary personal website |
| `socials` | object | No | Social media handles (see below) |
| `avatar` | string (path) | No | Path to avatar image |
| `body` | markdown | No | Long-form bio (from markdown body) |

#### Field Rationale

- **aliases**: Many creators operate under brand names (Bileam Tschepe → "Elekktronaut"). This allows searching/displaying by either name without creating duplicate entities.
- **socials**: Structured object rather than freeform links enables consistent rendering of social icons and validation of handles.
- **body**: Markdown body allows rich formatting for detailed bios without cluttering frontmatter.

#### Socials Object

```typescript
{
  youtube?: string;   // handle (e.g., "@elekktronaut") or channel ID
  patreon?: string;   // username
  github?: string;    // username
  twitter?: string;   // handle without @
  instagram?: string; // handle
  linkedin?: string;  // profile slug
  discord?: string;   // username
}
```

#### Example

```yaml
# content/creators/bileam-tschepe.md
---
name: Bileam Tschepe
aliases:
  - Elekktronaut
bio: Berlin-based artist and educator known for design-focused TouchDesigner tutorials.
location: Berlin, Germany
website: https://elekktronaut.com
socials:
  youtube: "@elekktronaut"
  patreon: elekktronaut
  instagram: elekktronaut
avatar: /images/creators/bileam-tschepe.jpg
---

Bileam Tschepe, known online as Elekktronaut, has produced over 84 TouchDesigner
tutorials focusing on audio-reactive and aesthetic-driven projects. His work
emphasizes the intersection of design theory and real-time graphics.
```

---

### 2. Organization

Represents a company, platform, institution, or community.

**Directory:** `content/organizations/`
**Pattern:** `*.md`

#### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name |
| `slug` | string | Auto | URL-safe identifier (derived from filename) |
| `type` | enum | Yes | Category of organization |
| `description` | string | No | Short description (1-2 sentences) |
| `website` | string (URL) | Yes | Primary website |
| `logo` | string (path) | No | Path to logo image |
| `location` | string | No | City, Country (for physical orgs) |
| `body` | markdown | No | Long-form description (from markdown body) |

#### Field Rationale

- **type**: Distinguishes between commercial entities, learning platforms, educational institutions, and community-run projects. Enables filtering and appropriate UI treatment.
- **location**: Optional because many orgs are online-only, but useful for institutions like The NODE Institute (Berlin).

#### Organization Types

| Type | Description | Examples |
|------|-------------|----------|
| `company` | Commercial entity, software vendor | Derivative, LZX Industries |
| `platform` | Online learning/content platform | Udemy, LinkedIn Learning |
| `institution` | Educational institution, workshop provider | The NODE Institute, Gray Area |
| `community` | Community-run aggregator or forum | AllTD, TouchDesigner Discord |

#### Example

```yaml
# content/organizations/the-node-institute.md
---
name: The NODE Institute
type: institution
description: Berlin-based training hub offering advanced TouchDesigner workshops.
website: https://thenodeinstitute.org
logo: /images/orgs/node-institute.png
location: Berlin, Germany
---

The NODE Institute hosts live and recorded TouchDesigner courses taught by
world-class experts including Josef Pelz, Chagall van den Berg, and others.
Their curriculum spans beginner fundamentals to cutting-edge AI integration.
```

---

### 3. Resource

Represents a linkable resource (channel, site, course, repository, etc.). This is the primary entity users will browse.

**Directory:** `content/resources/`
**Pattern:** `*.md`

#### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Display title |
| `slug` | string | Auto | URL-safe identifier (derived from filename) |
| `url` | string (URL) | Yes | Primary URL to the resource |
| `status` | enum | Yes | Current availability status |
| `lastVerified` | date | Yes | Date the resource was last confirmed active |
| `sourceType` | enum | Yes | Type of resource |
| `pricingModel` | enum | Yes | Cost structure |
| `skillLevels` | enum[] | No | Target audience skill levels |
| `topics` | string[] | No | Content topics and techniques covered |
| `domains` | string[] | No | Application domains and use cases |
| `creatorSlugs` | string[] | No | References to Creator slugs |
| `orgSlug` | string | No | Reference to Organization slug |
| `description` | string | Yes | Short description (1-3 sentences) |
| `featured` | boolean | No | Highlight on homepage (default: false) |
| `body` | markdown | No | Long-form notes (from markdown body) |

#### Field Rationale

- **status + lastVerified**: Together these solve the "link rot" problem. `status` is the current state; `lastVerified` tells you when someone last checked. A resource can be `active` but have an old `lastVerified` date, signaling it needs review.
- **sourceType**: Enables filtering ("show me all YouTube channels") and appropriate UI treatment (video icon vs. book icon).
- **pricingModel**: Critical for user expectations. "Freemium" means free content exists but premium tiers are available (common Patreon model).
- **creatorSlugs** (array): Supports collaborative resources. Most resources have one creator, but courses or channels can have multiple.
- **orgSlug**: Optional because many resources are independent (personal YouTube channels), but some belong to organizations (Derivative's official curriculum).
- **featured**: Simple boolean for editorial curation without complex ranking systems.

#### Status Values

| Status | Description | When to Use |
|--------|-------------|-------------|
| `active` | Currently available and maintained | Default for working resources |
| `inactive` | No longer updated but still accessible | Abandoned channels, archived blogs |
| `archived` | Historical reference, may be unavailable | Removed content, dead links preserved for reference |

#### Source Types

| Type | Description | Examples |
|------|-------------|----------|
| `youtube` | YouTube channel | Elekktronaut, Paketa12 |
| `patreon` | Patreon page | PPPanik, Function Store |
| `blog` | Personal blog or website | Matthew Ragan's site |
| `course` | Structured course/curriculum | TD Official Curriculum, Udemy courses |
| `github` | GitHub repository | Awesome TouchDesigner |
| `aggregator` | Tutorial aggregator/search engine | AllTD.org |
| `forum` | Discussion forum | TouchDesigner Forum |
| `discord` | Discord server | TouchDesigner Discord |
| `website` | General website (catch-all) | Interactive & Immersive HQ |
| `social` | Social media presence | Facebook Group, Instagram |

#### Pricing Models

| Model | Description | Examples |
|-------|-------------|----------|
| `free` | Completely free, no paid tiers | Official docs, most GitHub repos |
| `freemium` | Free content with optional paid extras | YouTube + Patreon for project files |
| `paid` | Requires payment to access | Udemy courses, premium memberships |

---

## Taxonomies

Rather than a separate Tag collection (which would be over-engineered), we use **predefined enum fields** validated at build time. This provides type safety while remaining simple.

### Skill Levels

Fixed enum - these are stable and unlikely to change.

```typescript
const skillLevels = ['beginner', 'intermediate', 'advanced'] as const;
```

| Level | Description |
|-------|-------------|
| `beginner` | No prior TouchDesigner experience assumed |
| `intermediate` | Familiar with basics, learning specific techniques |
| `advanced` | Complex topics: GLSL, optimization, system architecture |

### Topics

Extensible list of techniques and subjects. Add new topics to the config as needed.

```typescript
const topics = [
  // Core fundamentals
  'fundamentals',
  'python',
  'glsl',
  'shaders',

  // Visual techniques
  'audio-reactive',
  'feedback-loops',
  'particles',
  'instancing',
  'point-clouds',
  'raymarching',
  'procedural',
  'textures',

  // Hardware integration
  'projection-mapping',
  'kinect',
  'leap-motion',
  'mediapipe',
  'arduino',
  'websockets',
  'osc',
  'dmx',

  // Workflow & architecture
  'optimization',
  'architecture',
  'best-practices',
  'tool-building',
] as const;
```

### Domains

Application areas and use cases. Helps users find resources relevant to their field.

```typescript
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
] as const;
```

### Extensibility

To add a new taxonomy category in the future:

1. Add the field to the Resource schema in `velite.config.ts`
2. Define allowed values as a const array
3. Existing resources without the field will have `undefined` (all taxonomy fields are optional)

---

## Resource Example

```yaml
# content/resources/elekktronaut-youtube.md
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
  - textures
domains:
  - generative-art
  - vj-performance
creatorSlugs:
  - bileam-tschepe
description: Design-focused TouchDesigner tutorials emphasizing aesthetic visuals, feedback systems, and audio reactivity.
featured: true
---

Bileam's channel is renowned for high production value and approachable explanations
of complex visual techniques. Videos are free; Patreon subscribers get project files.

## Notable Series
- Feedback loop techniques
- Audio-reactive fundamentals
- Dark aesthetic workflows
```

---

## Relationships

```
┌─────────────────┐
│     Creator     │
│    (person)     │
└────────┬────────┘
         │
         │ 1:N (creatorSlugs[])
         ▼
┌─────────────────┐
│    Resource     │
│ (channel/site)  │
└────────┬────────┘
         │
         │ N:1 (orgSlug)
         ▼
┌─────────────────┐
│  Organization   │
│   (company)     │
└─────────────────┘
```

### Relationship Rules

1. **Resource → Creator**: Many-to-many via `creatorSlugs[]` array
   - A resource can have multiple creators (collaborations)
   - A creator can have multiple resources (common)

2. **Resource → Organization**: Many-to-one via `orgSlug` (optional)
   - A resource belongs to at most one organization
   - An organization can have many resources

3. **Creator → Organization**: No direct relationship
   - Inferred through shared Resources when needed
   - Keeps the model simple; frontend can compute "creators affiliated with org X"

### Computed Relationships (Velite `prepare` hook)

At build time, Velite will compute reverse relationships:

```typescript
// In velite.config.ts prepare hook
creators.forEach(creator => {
  creator.resources = resources.filter(r =>
    r.creatorSlugs?.includes(creator.slug)
  );
});

organizations.forEach(org => {
  org.resources = resources.filter(r => r.orgSlug === org.slug);
});
```

This enables queries like:
- "All resources by Matthew Ragan"
- "All resources from The NODE Institute"

---

## Directory Structure

```
content/
├── creators/
│   ├── matthew-ragan.md
│   ├── bileam-tschepe.md
│   ├── aurelian-ionus.md
│   ├── josef-pelz.md
│   └── ...
├── organizations/
│   ├── derivative.md
│   ├── the-node-institute.md
│   ├── alltd.md
│   ├── interactive-immersive-hq.md
│   └── ...
└── resources/
    ├── derivative-learn.md
    ├── derivative-forum.md
    ├── elekktronaut-youtube.md
    ├── elekktronaut-patreon.md
    ├── paketa12-youtube.md
    └── ...
```

### Naming Convention

- Filenames are kebab-case and become the `slug`
- Resources: `{creator-or-org}-{platform}.md` (e.g., `elekktronaut-youtube.md`)
- Keep filenames descriptive but concise

---

## Validation Rules

Enforced at build time via Zod schemas:

| Rule | Enforcement |
|------|-------------|
| Required fields present | Error on missing |
| URLs are valid format | Error on invalid |
| Enums match allowed values | Error on invalid |
| Dates are ISO format (YYYY-MM-DD) | Error on invalid |
| Slugs are URL-safe | Auto-generated from filename |
| References resolve to existing entities | Warning (not error) on invalid |

### Why Warnings for References?

Invalid `creatorSlugs` or `orgSlug` references produce warnings rather than errors because:
- Allows incremental content addition (add resource before creator file exists)
- Prevents build failures from typos while still surfacing issues
- Can be escalated to errors in CI/CD if desired

---

## Future: Content Collection

When individual tutorials/articles/videos are needed, add a fourth collection:

```yaml
# content/content/feedback-loops-masterclass.md (future)
---
title: Feedback Loops Masterclass
url: https://www.youtube.com/watch?v=xyz123
contentType: video  # video | article | tutorial | course-module
resourceSlug: elekktronaut-youtube  # parent resource
publishedDate: 2025-06-15
duration: "45:00"
skillLevels:
  - intermediate
topics:
  - feedback-loops
  - texture-synthesis
description: Deep dive into creating organic feedback textures...
---
```

This is deferred but the model is designed to accommodate it cleanly.

---

## Next Steps

- **Phase 1C**: Create detailed implementation plan
- **Phase 2**: Implement Velite configuration, seed content, integrate with Next.js
