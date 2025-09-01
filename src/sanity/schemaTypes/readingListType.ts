import { BookIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const readingListType = defineType({
  name: 'readingList',
  title: 'Reading List',
  type: 'document',
  icon: BookIcon,
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
