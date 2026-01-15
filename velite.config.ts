import { defineCollection, defineConfig, s } from 'velite'

// Taxonomy definitions (from data model)
const skillLevels = ['beginner', 'intermediate', 'advanced'] as const

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

const organizationTypes = ['company', 'platform', 'institution', 'community'] as const
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
  schema: s.object({
    name: s.string(),
    slug: s.slug('creators'),
    aliases: s.array(s.string()).optional(),
    bio: s.string().optional(),
    location: s.string().optional(),
    website: s.string().url().optional(),
    socials: socialsSchema,
    avatar: s.string().optional(),
    body: s.markdown(),
  }),
})

const organizations = defineCollection({
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
})

const resources = defineCollection({
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
  // Note: Relationships are resolved at runtime in the data access layer
  // to avoid circular JSON references. Resources store creatorSlugs and orgSlug,
  // and the data layer provides functions to resolve these to full objects.
})
