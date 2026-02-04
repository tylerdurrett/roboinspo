import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Category } from '@/models/category'

interface CategoryPillsBaseProps {
  categories: Category[]
  selectedCategory: string | null
}

interface CategoryPillsLinkProps extends CategoryPillsBaseProps {
  basePath: string
  onCategorySelect?: never
}

interface CategoryPillsCallbackProps extends CategoryPillsBaseProps {
  basePath?: never
  onCategorySelect: (categorySlug: string | null) => void
}

type CategoryPillsProps = CategoryPillsLinkProps | CategoryPillsCallbackProps

export function CategoryPills({
  categories,
  selectedCategory,
  basePath,
  onCategorySelect,
}: CategoryPillsProps) {
  const isLinkMode = basePath !== undefined

  return (
    <div className="flex flex-wrap gap-2 mb-8 justify-center">
      {isLinkMode ? (
        <Button
          variant={selectedCategory === null ? 'default' : 'ghost'}
          asChild
          className="rounded-full"
        >
          <Link href={basePath}>All</Link>
        </Button>
      ) : (
        <Button
          variant={selectedCategory === null ? 'default' : 'ghost'}
          onClick={() => onCategorySelect(null)}
          className="rounded-full"
        >
          All
        </Button>
      )}
      {categories.map((category) =>
        isLinkMode ? (
          <Button
            key={category._id}
            variant={
              selectedCategory === category.slug.current ? 'default' : 'ghost'
            }
            asChild
            className="rounded-full"
          >
            <Link
              href={`${basePath}?category=${category.slug.current}`}
            >
              {category.title}
            </Link>
          </Button>
        ) : (
          <Button
            key={category._id}
            variant={
              selectedCategory === category.slug.current ? 'default' : 'ghost'
            }
            onClick={() => onCategorySelect(category.slug.current)}
            className="rounded-full"
          >
            {category.title}
          </Button>
        )
      )}
    </div>
  )
}
