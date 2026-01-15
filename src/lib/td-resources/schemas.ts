/**
 * Taxonomy constants for TouchDesigner Resources
 * These match the enums defined in velite.config.ts
 */

export const skillLevels = ['beginner', 'intermediate', 'advanced'] as const
export type SkillLevel = (typeof skillLevels)[number]

export const topics = [
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
export type Topic = (typeof topics)[number]

export const domains = [
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
export type Domain = (typeof domains)[number]

export const organizationTypes = ['company', 'platform', 'institution', 'community'] as const
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
  'website',
  'social',
] as const
export type SourceType = (typeof sourceTypes)[number]

export const pricingModels = ['free', 'freemium', 'paid'] as const
export type PricingModel = (typeof pricingModels)[number]

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
