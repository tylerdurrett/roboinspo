import { InfoOutlineIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { toPlainText } from 'next-sanity'

export const calloutType = defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: 'tone',
      title: 'Tone',
      type: 'string',
      options: {
        list: [
          { title: 'Neutral', value: 'neutral' },
          { title: 'Info', value: 'info' },
          { title: 'Success', value: 'success' },
          { title: 'Warning', value: 'warning' },
          { title: 'Destructive', value: 'destructive' },
        ],
        layout: 'radio',
      },
      initialValue: 'neutral',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [], // No heading styles
          lists: [], // No lists
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      tone: 'tone',
      content: 'content',
    },
    prepare({ tone, content }) {
      const toneTitle = tone ? tone.charAt(0).toUpperCase() + tone.slice(1) : ''
      const plainText = content ? toPlainText(content) : 'No content'

      // Truncate to first 1-2 lines (roughly 100-120 characters)
      const subtitle =
        plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText

      return {
        title: `${toneTitle} Callout`,
        subtitle: subtitle,
        media: InfoOutlineIcon,
      }
    },
  },
})
