# Adding TouchDesigner Resources

Quick guide for adding new creators and resources to the TD content database.

For full schema details, see [\_docs/td-resources-system.md](../_docs/td-resources-system.md).

## Research Checklist

When adding a new creator, gather:

- [ ] Real name and any aliases/handles
- [ ] Bio (1-2 sentences about their work/focus)
- [ ] Location
- [ ] Website URL
- [ ] Social links: YouTube, Patreon, Instagram, GitHub, Twitter, Discord, LinkedIn

When adding a resource, determine:

- [ ] Resource URL
- [ ] Source type (youtube, patreon, blog, course, github, website, etc.)
- [ ] Pricing model (free, freemium, paid)
- [ ] Skill levels covered (beginner, intermediate, advanced)
- [ ] Topics covered (see list below)
- [ ] Applicable domains (generative-art, vj-performance, installations, etc.)

## Quick Reference

### Creator File (content/creators/)

```yaml
---
name: Full Name # required
aliases: # optional
  - Handle
  - Other Name
bio: Short description of their work. # optional
location: City, Country # optional
website: https://example.com # optional
socials: # optional
  youtube: '@handle'
  patreon: handle
  instagram: handle
  github: handle
  twitter: handle
---
Optional extended bio in markdown.
```

### Resource File (content/resources/)

```yaml
---
title: Resource Name # required
url: https://example.com # required
status: active # required: active | inactive | archived
lastVerified: 2026-01-15 # required: ISO date
sourceType: youtube # required: youtube | patreon | blog | course | github | website | etc.
pricingModel: free # required: free | freemium | paid
skillLevels: # optional
  - beginner
  - intermediate
topics: # optional
  - particles
  - glsl
domains: # optional
  - generative-art
creatorSlugs: # optional - links to creator files by slug
  - creator-file-name
description: Brief description. # required
featured: true # optional, default false
---
Optional extended notes in markdown.
```

## Common Topics

Core: `fundamentals`, `python`, `glsl`, `shaders`

Visual: `audio-reactive`, `feedback-loops`, `particles`, `instancing`, `point-clouds`, `raymarching`, `procedural`, `textures`

Hardware: `projection-mapping`, `kinect`, `mediapipe`, `arduino`, `websockets`, `osc`, `dmx`

Workflow: `optimization`, `architecture`, `best-practices`, `tool-building`

## Common Domains

`generative-art`, `vj-performance`, `installations`, `live-performance`, `hardware-integration`, `ai-ml`, `projection-mapping`, `led-mapping`, `education`

## File Naming

- Use lowercase kebab-case: `simon-david-ryden.md`, `paketa12-youtube.md`
- Slug auto-generates from filename (minus `.md`)
- Slugs must be globally unique across all collections
