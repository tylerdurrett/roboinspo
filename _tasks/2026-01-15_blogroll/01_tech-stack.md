# Phase 1A: Tech Stack Decision

## Decision: Velite

**Velite** is the recommended solution for building the markdown-based blogroll database.

- **Repository:** https://github.com/zce/velite
- **Documentation:** https://velite.js.org
- **Current Version:** ~0.2.x (active development)

---

## Problem Statement

We need a system that:

1. Stores data as **markdown + frontmatter** files (for community PR contributions)
2. Supports **multiple entity types** with relationships (Organizations, Creators, Resources)
3. Provides **type-safe** data access in the Next.js application
4. Can be **extracted into a separate package** in the future
5. Works with **Next.js 15** and the App Router

---

## Options Evaluated

### 1. Contentlayer (Rejected)

The former gold standard for markdown content in Next.js.

- **Status:** Unmaintained since Stackbit was acquired by Netlify
- **Issues:** Incompatible with Next.js App Router, no active development
- **Verdict:** Not viable for new projects

### 2. Content Collections (Considered)

Contentlayer-inspired replacement by Sebastian Sdorra.

- **Pros:** Drop-in Contentlayer replacement, transform functions for joining collections
- **Cons:** Less documentation on complex relationships, smaller community
- **Verdict:** Viable but less mature than Velite

### 3. Astro Content Collections (Reference Only)

Astro's built-in content system has first-class `reference()` support for relationships.

```ts
// Astro's ideal API (for reference)
const blog = defineCollection({
  schema: z.object({
    author: reference('authors'),  // Declarative relationship
  })
});
```

- **Verdict:** Best relationship API, but requires Astro framework (not Next.js)

### 4. Velite (Selected)

Contentlayer-inspired, framework-agnostic content layer with Zod schemas.

- **Pros:** Active development, powerful `prepare` hook for relationships, JSON output
- **Cons:** Relationships are manual (not declarative like Astro)
- **Verdict:** Best fit for our requirements

### 5. Custom Solution with gray-matter (Rejected)

Roll our own with `gray-matter` for parsing and custom build scripts.

- **Verdict:** Too much maintenance burden, reinventing the wheel

---

## Why Velite

### 1. Zod Schema Validation

Velite uses Zod for schema definition, which means:

- **Type inference:** Full TypeScript types generated automatically
- **Validation:** Community PRs are validated against the schema at build time
- **Transforms:** Computed fields (like permalinks, slugs) via `.transform()`

```ts
const resources = defineCollection({
  name: 'Resource',
  pattern: 'resources/**/*.md',
  schema: s.object({
    title: s.string(),
    url: s.string().url(),
    status: s.enum(['active', 'inactive', 'archived']),
    creatorSlug: s.string().optional(),
    orgSlug: s.string().optional(),
  })
});
```

### 2. Multiple Collections with Relationships

Velite supports organizing content into separate directories:

```
content/
├── creators/
│   ├── matthew-ragan.md
│   └── elekktronaut.md
├── organizations/
│   ├── derivative.md
│   └── node-institute.md
└── resources/
    ├── td-curriculum.md
    └── paketa12-glsl.md
```

The `prepare` hook allows wiring relationships after all collections load:

```ts
export default defineConfig({
  collections: { creators, organizations, resources },
  prepare: ({ creators, organizations, resources }) => {
    // Resolve creator references
    resources.forEach(resource => {
      if (resource.creatorSlug) {
        resource.creator = creators.find(c => c.slug === resource.creatorSlug);
      }
      if (resource.orgSlug) {
        resource.organization = organizations.find(o => o.slug === resource.orgSlug);
      }
    });

    // Build reverse relationships
    creators.forEach(creator => {
      creator.resources = resources.filter(r => r.creatorSlug === creator.slug);
    });
  }
});
```

### 3. Framework-Agnostic JSON Output

Velite outputs to `.velite/` as:

- **JSON files:** The processed data
- **TypeScript definitions:** Type declarations for imports
- **Entry points:** Clean imports like `import { resources } from '.velite'`

This is critical for **future package extraction**:

- The `content/` directory + `velite.config.ts` can become a standalone npm package
- The package exports JSON data that any consumer (your site, other sites) can import
- No coupling to Next.js internals

### 4. Build-Time Processing

Velite runs at build time (or in watch mode during development):

- Content is processed once, not on every request
- Output is static JSON, fast to import
- Works with Next.js static generation and ISR

---

## Comparison Summary

| Feature | Velite | Content Collections | Astro | Custom |
|---------|--------|---------------------|-------|--------|
| Next.js 15 Support | Yes | Yes | No | Yes |
| Zod Schemas | Yes | Yes | Yes | Manual |
| Multiple Collections | Yes | Yes | Yes | Manual |
| Relationship Support | Via `prepare` hook | Via transforms | Native `reference()` | Manual |
| Type Generation | Automatic | Automatic | Automatic | Manual |
| Package Extraction | Easy (JSON output) | Easy | Hard | Medium |
| Active Maintenance | Yes | Yes | Yes | N/A |
| Community/Docs | Good | Moderate | Excellent | N/A |

---

## Architecture Preview

```
robo-inspo/
├── content/                    # Markdown content (future: separate repo)
│   ├── creators/
│   ├── organizations/
│   └── resources/
├── velite.config.ts            # Schema definitions & relationships
├── .velite/                    # Generated output (gitignored)
│   ├── index.js
│   ├── index.d.ts
│   ├── creators.json
│   ├── organizations.json
│   └── resources.json
└── src/
    └── app/
        └── blogroll/           # Pages that consume the data
```

---

## Trade-offs Accepted

1. **Manual relationship wiring:** Unlike Astro's declarative `reference()`, we must manually resolve relationships in the `prepare` hook. This is more code but also more flexible.

2. **Beta software:** Velite is ~0.2.x. However, it's actively maintained and the API is stable for our use case.

3. **No built-in referential integrity:** If a resource references a non-existent creator slug, we need to handle that in the `prepare` hook (throw error or warn).

---

## Next Steps

- **Phase 1B:** Design the specific data models (Creator, Organization, Resource schemas)
- **Phase 1C:** Create the detailed implementation plan

---

## References

- [Velite Documentation](https://velite.js.org/guide/introduction)
- [Velite GitHub](https://github.com/zce/velite)
- [Velite Next.js Example](https://github.com/zce/velite/blob/main/examples/nextjs/velite.config.ts)
- [Contentlayer Alternatives Discussion](https://www.wisp.blog/blog/contentlayer-has-been-abandoned-what-are-the-alternatives)
- [Content Collections](https://www.content-collections.dev/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) (reference architecture)
