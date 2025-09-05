import { BookIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const readingListType = defineType({
  name: 'readingList',
  title: 'Reading List',
  type: 'document',
  icon: BookIcon,
  fieldsets: [
    {
      name: 'summaryFields',
      title: 'Article Summary & Analysis',
      options: {
        collapsible: true,
        collapsed: false,
      },
    },
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'originalUrl',
      title: 'Original Article URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'reference',
      to: { type: 'category' },
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
        }),
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption',
        }),
      ],
    }),
    defineField({
      name: 'savedAt',
      title: 'Added to Reading List',
      type: 'datetime',
      initialValue: new Date().toISOString(),
    }),
    defineField({
      name: 'editedAt',
      title: 'Last Edited',
      type: 'datetime',
    }),
    defineField({
      name: 'detailedSummary',
      title: 'Detailed Summary',
      type: 'text',
      description: 'A full summary, include all key information',
      fieldset: 'summaryFields',
    }),
    defineField({
      name: 'keyPoints',
      title: 'Key Points',
      type: 'array',
      description: '3-5 key points that the author makes',
      of: [{ type: 'string' }],
      fieldset: 'summaryFields',
    }),
    defineField({
      name: 'conclusion',
      title: 'Conclusion',
      type: 'text',
      description: "What's the final conclusion the author makes?",
      fieldset: 'summaryFields',
    }),
    defineField({
      name: 'shortSummary',
      title: 'Short Summary',
      type: 'text',
      description: 'A brief, 3 sentence summary',
      fieldset: 'summaryFields',
    }),
    defineField({
      name: 'gist',
      title: 'Gist',
      type: 'string',
      description: 'A one-liner that captures the essence in one sentence.',
      fieldset: 'summaryFields',
    }),
    defineField({
      name: 'newTitle',
      title: 'New Title',
      type: 'string',
      description:
        'Your version of a descriptive title based on the above. Try to communicate the gist in only a short headline.',
      fieldset: 'summaryFields',
    }),
    defineField({
      name: 'body',
      title: 'Summary & Notes',
      type: 'blockContent',
      description: 'Your summary, thoughts, and notes about this article',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category.title',
      media: 'featuredImage',
    },
    prepare(selection) {
      const { category } = selection
      return {
        ...selection,
        subtitle: category ? `${category}` : 'No category',
      }
    },
  },
})
