import { defineMigration, at, setIfMissing, append } from 'sanity/migrate'

export default defineMigration({
  title: 'Convert category to categories array',
  documentTypes: ['readingList'],
  filter: 'defined(category) && !defined(categories)',
  migrate: {
    document(doc) {
      return [
        // Initialize categories as empty array if not defined
        at('categories', setIfMissing([])),
        // Add the existing category reference to the categories array
        at('categories', append(doc.category)),
      ]
    },
  },
})
