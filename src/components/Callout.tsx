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
          'border-border text-muted-foreground': tone === 'neutral',
          'border-info/40 text-info': tone === 'info',
          'border-success/40 text-success': tone === 'success',
          'border-warning/40 text-warning': tone === 'warning',
          'border-destructive/40 text-destructive': tone === 'destructive',
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
