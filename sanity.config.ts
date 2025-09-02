'use client'

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/admin/[[...tool]]/page.tsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { RocketIcon } from '@sanity/icons'
import { table } from '@sanity/table'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './src/sanity/env'
import { schema } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'
import { muxInput } from 'sanity-plugin-mux-input'

export default defineConfig({
  basePath: '/admin',
  projectId,
  dataset,
  name: 'roboinspo',
  title: 'Robo Inspo',
  icon: RocketIcon,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({ structure }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
    muxInput({
      allowedRolesForConfiguration: ['administrator'],
      mp4_support: 'standard',
    }),
    table(),
  ],
})
