import { DocumentTextIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
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
      name: 'subtitle',
      type: 'string',
    }),
    defineField({
      name: 'intro',
      type: 'text',
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: { type: 'author' },
    }),
    defineField({
      name: 'category',
      type: 'reference',
      to: { type: 'category' },
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
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
      name: 'hideMainImageOnPost',
      title: 'Hide Main Image on Post',
      type: 'boolean',
      description:
        'If checked, the main image will be hidden on the post page but still used for meta tags and previews.',
      initialValue: false,
    }),
    defineField({
      name: 'mainVideo',
      title: 'Main video',
      type: 'mux.video',
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      validation: (rule) => rule.required(),
      initialValue: new Date().toISOString(),
    }),
    defineField({
      name: 'editedAt',
      type: 'datetime',
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const { author } = selection
      return { ...selection, subtitle: author && `by ${author}` }
    },
  },
})
