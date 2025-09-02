import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'text-accent-foreground font-league-gothic uppercase border-3 border-accent bg-transparent hover:bg-accent/10 active:bg-accent/20 hover:border-accent/80 active:border-accent',
        destructive:
          'text-destructive-foreground font-league-gothic uppercase bg-destructive border-3 border-destructive shadow-xs hover:bg-destructive/80 active:bg-destructive/90 hover:border-destructive/80 active:border-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline:
          'text-accent-foreground font-league-gothic uppercase border-3 border-accent bg-transparent shadow-xs hover:bg-accent/10 active:bg-accent/20 hover:border-accent/80 active:border-accent',
        secondary:
          'text-secondary-foreground font-league-gothic uppercase bg-secondary border-3 border-secondary shadow-xs hover:bg-secondary/80 active:bg-secondary/90 hover:border-secondary/80 active:border-secondary',
        ghost:
          'text-accent-foreground font-league-gothic uppercase bg-transparent border-3 border-transparent hover:bg-accent/10 hover:border-accent/80 active:bg-accent/20 active:border-accent',
        link: 'text-accent-foreground font-league-gothic uppercase underline-offset-4 hover:underline active:underline active:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-2 sm:px-4 md:px-8 py-5 has-[>svg]:px-3 text-xl',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
