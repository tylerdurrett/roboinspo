/**
 * Taxonomy constants for Resource Hubs
 * These match the enums defined in velite.config.ts
 */

// Hub definitions
export const hubs = ['creative-coding', 'agentic-systems'] as const
export type Hub = (typeof hubs)[number]

export const skillLevels = ['beginner', 'intermediate', 'advanced'] as const
export type SkillLevel = (typeof skillLevels)[number]

export const topics = [
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
export type Topic = (typeof topics)[number]

export const domains = [
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
export type Domain = (typeof domains)[number]

export const organizationTypes = [
  'company',
  'platform',
  'institution',
  'community',
] as const
export type OrganizationType = (typeof organizationTypes)[number]

export const resourceStatuses = ['active', 'inactive', 'archived'] as const
export type ResourceStatus = (typeof resourceStatuses)[number]

export const sourceTypes = [
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
export type SourceType = (typeof sourceTypes)[number]

/**
 * Source Type Categories
 * Logical groupings of source types for filtering and display
 */
export const sourceTypeCategories = ['websites', 'social'] as const
export type SourceTypeCategory = (typeof sourceTypeCategories)[number]

/** Mapping of categories to their constituent source types */
export const sourceTypeCategoryMap: Record<
  SourceTypeCategory,
  readonly SourceType[]
> = {
  websites: ['website', 'blog', 'course', 'aggregator', 'forum', 'github'],
  social: ['youtube', 'patreon', 'discord', 'reddit', 'social'],
} as const

/** Human-readable labels for categories */
export const sourceTypeCategoryLabels: Record<SourceTypeCategory, string> = {
  websites: 'Websites',
  social: 'Social & Platforms',
}

/** Get all source types for a category */
export function getSourceTypesForCategory(
  category: SourceTypeCategory
): SourceType[] {
  return [...sourceTypeCategoryMap[category]]
}

export const pricingModels = ['free', 'freemium', 'paid'] as const
export type PricingModel = (typeof pricingModels)[number]

export const platforms = [
  // Creative coding platforms
  'touchdesigner',
  'processing',
  'p5js',
  'openframeworks',
  'cables',
  'unity',
  'unreal',
  'general',
  // Agentic coding platforms
  'langchain',
  'llamaindex',
  'autogen',
  'crewai',
  'claude-code',
  'cursor',
] as const
export type Platform = (typeof platforms)[number]

/** Human-readable labels for hubs */
export const hubLabels: Record<Hub, string> = {
  'creative-coding': 'Creative Coding',
  'agentic-systems': 'Agentic Systems',
}

/** Human-readable labels for source types */
export const sourceTypeLabels: Record<SourceType, string> = {
  youtube: 'YouTube',
  patreon: 'Patreon',
  blog: 'Blog',
  course: 'Course',
  github: 'GitHub',
  aggregator: 'Aggregator',
  forum: 'Forum',
  discord: 'Discord',
  reddit: 'Reddit',
  website: 'Website',
  social: 'Social',
}

/** Human-readable labels for pricing models */
export const pricingModelLabels: Record<PricingModel, string> = {
  free: 'Free',
  freemium: 'Freemium',
  paid: 'Paid',
}

/** Human-readable labels for skill levels */
export const skillLevelLabels: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

/** Human-readable labels for statuses */
export const statusLabels: Record<ResourceStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
}

/** Human-readable labels for organization types */
export const organizationTypeLabels: Record<OrganizationType, string> = {
  company: 'Company',
  platform: 'Platform',
  institution: 'Institution',
  community: 'Community',
}

/** Human-readable labels for platforms */
export const platformLabels: Record<Platform, string> = {
  touchdesigner: 'TouchDesigner',
  processing: 'Processing',
  p5js: 'p5.js',
  openframeworks: 'openFrameworks',
  cables: 'Cables.gl',
  unity: 'Unity',
  unreal: 'Unreal Engine',
  general: 'General',
  langchain: 'LangChain',
  llamaindex: 'LlamaIndex',
  autogen: 'AutoGen',
  crewai: 'CrewAI',
  'claude-code': 'Claude Code',
  cursor: 'Cursor',
}
