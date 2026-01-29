import { basename } from 'node:path'
import { defineCollection, defineConfig, s } from 'velite'

// Hub definitions
const hubs = ['creative-coding', 'agentic-systems'] as const

// Taxonomy definitions (from data model)
const skillLevels = ['beginner', 'intermediate', 'advanced'] as const

const topics = [
  // Core fundamentals (shared)
  'fundamentals',
  'python',
  'glsl',
  'shaders',
  // Visual techniques (creative-coding)
  'audio-reactive',
  'feedback-loops',
  'particles',
  'instancing',
  'point-clouds',
  'raymarching',
  'procedural',
  'textures',
  // Hardware integration (creative-coding)
  'projection-mapping',
  'kinect',
  'leap-motion',
  'mediapipe',
  'arduino',
  'websockets',
  'osc',
  'dmx',
  // Workflow & architecture (shared)
  'optimization',
  'architecture',
  'best-practices',
  'tool-building',
  // Agentic coding topics
  'llm-integration',
  'prompt-engineering',
  'agent-architectures',
  'tool-use',
  'rag-retrieval',
  'memory-systems',
  'multi-agent',
  'code-generation',
] as const

const domains = [
  // Creative coding domains
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
  // Agentic coding domains
  'developer-tools',
  'automation',
  'research-assistants',
  'productivity',
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
  'reddit',
  'website',
  'social',
] as const
const pricingModels = ['free', 'freemium', 'paid'] as const

const platforms = [
  // Creative coding platforms
  'touchdesigner',
  'processing',
  'p5js',
  'openframeworks',
  'cables',
  'unity',
  'unreal',
  'general', // Platform-agnostic
  // Agentic coding platforms
  'langchain',
  'llamaindex',
  'autogen',
  'crewai',
  'claude-code',
  'cursor',
] as const

// Socials schema for creators
const socialsSchema = s
  .object({
    youtube: s.string().optional(),
    patreon: s.string().optional(),
    github: s.string().optional(),
    twitter: s.string().optional(),
    instagram: s.string().optional(),
    linkedin: s.string().optional(),
    discord: s.string().optional(),
  })
  .optional()

// Collections
const creators = defineCollection({
  name: 'Creator',
  pattern: 'creators/*.md',
  schema: s
    .object({
      name: s.string(),
      slug: s.string().optional(), // Optional: derived from filename if not provided
      hubs: s.array(s.enum(hubs)).default(['creative-coding']),
      aliases: s.array(s.string()).optional(),
      bio: s.string().optional(),
      location: s.string().optional(),
      website: s.string().url().optional(),
      socials: socialsSchema,
      avatar: s.string().optional(),
      body: s.markdown(),
    })
    .transform((data, { meta }) => ({
      ...data,
      slug: data.slug ?? basename(meta.path, '.md'),
    })),
})

const organizations = defineCollection({
  name: 'Organization',
  pattern: 'organizations/*.md',
  schema: s
    .object({
      name: s.string(),
      slug: s.string().optional(), // Optional: derived from filename if not provided
      hubs: s.array(s.enum(hubs)).default(['creative-coding']),
      type: s.enum(organizationTypes),
      description: s.string().optional(),
      website: s.string().url(),
      logo: s.string().optional(),
      location: s.string().optional(),
      body: s.markdown(),
    })
    .transform((data, { meta }) => ({
      ...data,
      slug: data.slug ?? basename(meta.path, '.md'),
    })),
})

const resources = defineCollection({
  name: 'Resource',
  pattern: 'resources/*.md',
  schema: s
    .object({
      title: s.string(),
      slug: s.string().optional(), // Optional: derived from filename if not provided
      hubs: s.array(s.enum(hubs)).default(['creative-coding']),
      url: s.string().url(),
      status: s.enum(resourceStatuses),
      lastVerified: s.isodate(),
      sourceType: s.enum(sourceTypes),
      pricingModel: s.enum(pricingModels),
      skillLevels: s.array(s.enum(skillLevels)).optional(),
      topics: s.array(s.enum(topics)).optional(),
      domains: s.array(s.enum(domains)).optional(),
      platforms: s.array(s.enum(platforms)).default(['touchdesigner']),
      creatorSlugs: s.array(s.string()).optional(),
      orgSlug: s.string().optional(),
      description: s.string(),
      featured: s.boolean().default(false),
      body: s.markdown(),
    })
    .transform((data, { meta }) => ({
      ...data,
      slug: data.slug ?? basename(meta.path, '.md'),
    })),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static/content',
    base: '/static/content/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { creators, organizations, resources },
  prepare: ({ creators, organizations, resources }) => {
    // Validate slug uniqueness across all collections
    // Slugs must be globally unique to enable clean URLs
    const slugSources = new Map<string, string[]>()

    const trackSlug = (slug: string, source: string) => {
      const existing = slugSources.get(slug) ?? []
      slugSources.set(slug, [...existing, source])
    }

    creators.forEach((c) => trackSlug(c.slug, `creator: ${c.name}`))
    organizations.forEach((o) => trackSlug(o.slug, `organization: ${o.name}`))
    resources.forEach((r) => trackSlug(r.slug, `resource: ${r.title}`))

    const duplicates = [...slugSources.entries()].filter(
      ([, sources]) => sources.length > 1
    )

    if (duplicates.length > 0) {
      const errorMessages = duplicates.map(
        ([slug, sources]) =>
          `  "${slug}" used by:\n${sources.map((s) => `    - ${s}`).join('\n')}`
      )
      throw new Error(
        `Duplicate slugs found. Each slug must be unique across all collections.\n\n${errorMessages.join('\n\n')}`
      )
    }

    // Note: Relationships are resolved at runtime in the data access layer
    // to avoid circular JSON references. Resources store creatorSlugs and orgSlug,
    // and the data layer provides functions to resolve these to full objects.
  },
})
