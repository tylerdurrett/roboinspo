import { defineField, defineType } from 'sanity'
import { PlayIcon } from '@sanity/icons'

export const youtubeType = defineType({
  name: 'youtube',
  type: 'object',
  title: 'YouTube Embed',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'url',
      type: 'url',
      title: 'YouTube video URL',
      validation: (rule) => rule.uri({ scheme: ['http', 'https'] }).required(),
    }),
  ],
  preview: {
    select: { title: 'url' },
  },
})
