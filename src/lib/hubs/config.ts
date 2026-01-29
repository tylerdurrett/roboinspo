import type { Hub, SourceType, Topic, Domain, Platform } from '../td-resources/schemas'

export interface TabConfig {
  path: string
  label: string
  sourceType?: SourceType // For single source type pages (youtube, patreon)
  sourceTypes?: SourceType[] // For category pages (websites, discords, reddits)
}

export interface HubConfig {
  slug: Hub
  name: string
  description: string
  basePath: string
  defaultPlatforms: Platform[]
  tabs: TabConfig[]
  relevantTopics: Topic[]
  relevantDomains: Domain[]
  relevantPlatforms: Platform[]
}

// Topics relevant to each hub
const creativeCodingTopics: Topic[] = [
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
]

const agenticCodingTopics: Topic[] = [
  'fundamentals',
  'python',
  'optimization',
  'architecture',
  'best-practices',
  'tool-building',
  'llm-integration',
  'prompt-engineering',
  'agent-architectures',
  'tool-use',
  'rag-retrieval',
  'memory-systems',
  'multi-agent',
  'code-generation',
]

// Domains relevant to each hub
const creativeCodingDomains: Domain[] = [
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
]

const agenticCodingDomains: Domain[] = [
  'ai-ml',
  'education',
  'developer-tools',
  'automation',
  'research-assistants',
  'productivity',
]

// Platforms relevant to each hub
const creativeCodingPlatforms: Platform[] = [
  'touchdesigner',
  'processing',
  'p5js',
  'openframeworks',
  'cables',
  'unity',
  'unreal',
  'general',
]

const agenticCodingPlatforms: Platform[] = [
  'general',
  'langchain',
  'llamaindex',
  'autogen',
  'crewai',
  'claude-code',
  'cursor',
]

export const hubConfigs: Record<Hub, HubConfig> = {
  'creative-coding': {
    slug: 'creative-coding',
    name: 'Creative Coding',
    description: 'TouchDesigner and generative visuals',
    basePath: '/creative-coding/resources',
    defaultPlatforms: ['touchdesigner'],
    tabs: [
      { path: '', label: 'All' },
      { path: '/creators', label: 'Creators' },
      { path: '/youtube', label: 'YouTube', sourceType: 'youtube' },
      { path: '/patreon', label: 'Patreon', sourceType: 'patreon' },
      {
        path: '/websites',
        label: 'Websites',
        sourceTypes: ['website', 'blog', 'course', 'aggregator', 'forum', 'github'],
      },
    ],
    relevantTopics: creativeCodingTopics,
    relevantDomains: creativeCodingDomains,
    relevantPlatforms: creativeCodingPlatforms,
  },
  'agentic-coding': {
    slug: 'agentic-coding',
    name: 'Agentic Coding',
    description: 'Programming and agentic systems',
    basePath: '/agentic-coding/resources',
    defaultPlatforms: ['general'],
    tabs: [
      { path: '', label: 'All' },
      { path: '/creators', label: 'Creators' },
      { path: '/youtube', label: 'YouTube', sourceType: 'youtube' },
      { path: '/discords', label: 'Discords', sourceType: 'discord' },
      { path: '/reddits', label: 'Reddits', sourceType: 'reddit' },
    ],
    relevantTopics: agenticCodingTopics,
    relevantDomains: agenticCodingDomains,
    relevantPlatforms: agenticCodingPlatforms,
  },
}

export function getHubConfig(slug: Hub): HubConfig {
  return hubConfigs[slug]
}

export function getAllHubs(): HubConfig[] {
  return Object.values(hubConfigs)
}

export function isValidHub(slug: string): slug is Hub {
  return slug in hubConfigs
}

export function getTabForPath(hub: Hub, pathname: string): TabConfig | undefined {
  const config = hubConfigs[hub]
  // Find the matching tab by checking if the pathname ends with the tab path
  // Handle both exact match and with trailing content (like /[slug])
  return config.tabs.find((tab) => {
    const fullTabPath = `${config.basePath}${tab.path}`
    return pathname === fullTabPath || pathname.startsWith(`${fullTabPath}/`)
  })
}
