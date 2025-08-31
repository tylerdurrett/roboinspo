import { PortableText } from 'next-sanity'
import { cn } from '@/lib/utils'
import type { PortableTextBlock } from 'next-sanity'
import { match } from 'ts-pattern'
import {
  InfoCircledIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  CrossCircledIcon,
} from '@radix-ui/react-icons'

type CalloutProps = {
  value: {
    _key: string
    _type: 'callout'
    content: PortableTextBlock[]
    tone: 'info' | 'success' | 'warning' | 'destructive' | 'neutral'
  }
}

export const Callout = ({ value }: CalloutProps) => {
  const { tone, content } = value

  const icon = match(tone)
    .with('info', () => <InfoCircledIcon className="h-5 w-5" />)
    .with('success', () => <CheckCircledIcon className="h-5 w-5" />)
    .with('warning', () => <ExclamationTriangleIcon className="h-5 w-5" />)
    .with('destructive', () => <CrossCircledIcon className="h-5 w-5" />)
    .with('neutral', () => null)
    .exhaustive()

  return (
    <div
      className={cn(
        'my-6 flex items-start rounded-xl border p-4',
        icon && 'gap-4',
        'bg-background',
        {
          'border-neutral-200 text-neutral-800 dark:border-neutral-800 dark:text-neutral-200':
            tone === 'neutral',
          'border-blue-200 text-blue-800 dark:border-blue-800 dark:text-blue-200':
            tone === 'info',
          'border-green-200 text-green-800 dark:border-green-800 dark:text-green-200':
            tone === 'success',
          'border-yellow text-yellow-800 dark:border-yellow dark:text-yellow-200':
            tone === 'warning',
          'border-red-200 text-red-800 dark:border-red-800 dark:text-red-200':
            tone === 'destructive',
        }
      )}
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="prose prose-neutral max-w-none dark:prose-invert text-lg md:text-2xl [&_p:only-child]:m-0 [&_p:first-child]:mt-0 p-2">
        <PortableText value={content} />
      </div>
    </div>
  )
}
