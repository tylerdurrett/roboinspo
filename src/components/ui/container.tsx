import * as React from 'react'
import { cn } from '@/lib/utils'

const containerSizes = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: '',
} as const

export interface ContainerProps extends React.ComponentProps<'div'> {
  size?: keyof typeof containerSizes
  center?: boolean
}

export function Container({
  className,
  size = 'lg',
  center = true,
  ...props
}: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn(
        'w-full px-4 sm:px-6 lg:px-8',
        containerSizes[size],
        center && 'mx-auto',
        className
      )}
      {...props}
    />
  )
}
