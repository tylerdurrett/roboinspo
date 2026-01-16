#!/usr/bin/env tsx
import { creators, organizations, resources } from '#content'

// Type definitions
type ExportType = 'creators' | 'resources' | 'organizations'
type OutputFormat = 'text' | 'json'

interface Options {
  fields: string[] | 'all' | 'default'
  format: OutputFormat
  resolve: boolean
}

// Available fields for each type (excluding body which is HTML content)
const FIELDS: Record<ExportType, string[]> = {
  creators: [
    'name',
    'slug',
    'aliases',
    'bio',
    'location',
    'website',
    'socials',
    'avatar',
  ],
  resources: [
    'title',
    'slug',
    'url',
    'status',
    'lastVerified',
    'sourceType',
    'pricingModel',
    'skillLevels',
    'topics',
    'domains',
    'platforms',
    'creatorSlugs',
    'orgSlug',
    'description',
    'featured',
  ],
  organizations: [
    'name',
    'slug',
    'type',
    'description',
    'website',
    'logo',
    'location',
  ],
}

// Parse CLI arguments
function parseArgs(args: string[]): {
  type: ExportType | null
  options: Options
} {
  const type = args[0] as ExportType | undefined
  const options: Options = {
    fields: 'default',
    format: 'text',
    resolve: false,
  }

  for (const arg of args.slice(1)) {
    if (arg === '--json') options.format = 'json'
    if (arg === '--full') options.fields = 'all'
    if (arg === '--resolve') options.resolve = true
    if (arg.startsWith('--fields=')) {
      const fieldsStr = arg.replace('--fields=', '')
      options.fields = fieldsStr === 'all' ? 'all' : fieldsStr.split(',')
    }
  }

  return { type: type && type in FIELDS ? type : null, options }
}

// Resolve slugs to names
function resolveCreatorSlugs(slugs: string[]): string[] {
  return slugs.map(
    (slug) => creators.find((c) => c.slug === slug)?.name ?? slug
  )
}

function resolveOrgSlug(slug: string | undefined): string | undefined {
  if (!slug) return undefined
  return organizations.find((o) => o.slug === slug)?.name ?? slug
}

// Format output
function formatValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (Array.isArray(value)) return value.join('; ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// Main export function
function exportData<T extends Record<string, unknown>>(
  data: T[],
  options: Options,
  availableFields: string[],
  resolvers?: { creatorSlugs?: boolean; orgSlug?: boolean }
) {
  // Determine fields to export
  let fields: string[]
  if (options.fields === 'default') {
    fields = [availableFields[0]] // Just the name/title
  } else if (options.fields === 'all') {
    fields = availableFields
  } else {
    fields = options.fields
  }

  // Transform data
  const rows = data.map((item) => {
    const row: Record<string, unknown> = {}
    for (const field of fields) {
      const value = item[field]

      // Resolve relationships if requested
      if (options.resolve && resolvers) {
        if (
          field === 'creatorSlugs' &&
          resolvers.creatorSlugs &&
          Array.isArray(value)
        ) {
          row['creators'] = resolveCreatorSlugs(value as string[])
          continue
        }
        if (field === 'orgSlug' && resolvers.orgSlug) {
          row['organization'] = resolveOrgSlug(value as string | undefined)
          continue
        }
      }

      row[field] = value
    }
    return row
  })

  // Adjust field names for resolved fields
  const outputFields = fields.map((f) => {
    if (options.resolve) {
      if (f === 'creatorSlugs') return 'creators'
      if (f === 'orgSlug') return 'organization'
    }
    return f
  })

  // Output
  if (options.format === 'json') {
    if (outputFields.length === 1) {
      // Single field: output as array of values
      console.log(
        JSON.stringify(
          rows.map((r) => r[outputFields[0]]),
          null,
          2
        )
      )
    } else {
      // Multiple fields: output as array of objects
      console.log(JSON.stringify(rows, null, 2))
    }
  } else {
    if (outputFields.length === 1) {
      // Single field: plain text, one per line
      rows.forEach((r) => console.log(formatValue(r[outputFields[0]])))
    } else {
      // Multiple fields: CSV format
      console.log(outputFields.join(','))
      rows.forEach((r) => {
        const values = outputFields.map((f) => escapeCSV(formatValue(r[f])))
        console.log(values.join(','))
      })
    }
  }
}

function showHelp() {
  console.log(`Usage: npm run export <type> [options]

Types:
  creators       Export creators
  resources      Export resources
  organizations  Export organizations

Options:
  --fields=f1,f2  Export specific fields (comma-separated)
  --full          Export all fields
  --json          Output as JSON (default: plain text/CSV)
  --resolve       Resolve relationship slugs to names

Examples:
  npm run export creators
  npm run export creators --json
  npm run export creators --fields=name,bio,website
  npm run export resources --full --resolve --json

Available fields:
  creators:      ${FIELDS.creators.join(', ')}
  resources:     ${FIELDS.resources.join(', ')}
  organizations: ${FIELDS.organizations.join(', ')}
`)
}

// Main
const args = process.argv.slice(2)
if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  showHelp()
  process.exit(0)
}

const { type, options } = parseArgs(args)

if (!type) {
  console.error(`Unknown type: ${args[0]}`)
  showHelp()
  process.exit(1)
}

switch (type) {
  case 'creators':
    exportData(creators, options, FIELDS.creators)
    break
  case 'resources':
    exportData(resources, options, FIELDS.resources, {
      creatorSlugs: true,
      orgSlug: true,
    })
    break
  case 'organizations':
    exportData(organizations, options, FIELDS.organizations)
    break
}
