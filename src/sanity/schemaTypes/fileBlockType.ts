import { defineType, defineField } from 'sanity'
import { DocumentIcon } from '@sanity/icons'

export const fileBlockType = defineType({
  name: 'fileBlock',
  title: 'File',
  type: 'object',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'file',
      title: 'Upload',
      type: 'file',
      options: {
        storeOriginalFilename: true,
      },
      validation: (Rule) => Rule.required().assetRequired(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Visible link text in the article',
    }),
  ],
  preview: {
    select: {
      title: 'file.asset.originalFilename',
      subtitle: 'caption',
    },
    prepare({ title, subtitle }) {
      return {
        title: title,
        subtitle: subtitle,
        media: DocumentIcon,
      }
    },
  },
})
