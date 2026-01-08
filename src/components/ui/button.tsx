import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from './utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium leading-normal transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50",
  {
    variants: {
      variant: {
        default:
          'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary/50 shadow-sm',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/50 shadow-sm',
        outline:
          'border border-border bg-background text-foreground hover:bg-muted focus-visible:ring-primary/50 shadow-sm',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:ring-secondary/50 shadow-sm',
        ghost: 'text-foreground hover:bg-muted hover:text-foreground focus-visible:ring-muted/50',
        link: 'text-primary-600 underline-offset-4 hover:underline hover:text-primary-700 focus-visible:ring-primary/50',
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-8 rounded-md px-4 text-xs leading-normal',
        lg: 'h-12 rounded-lg px-10 text-base leading-normal',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
    }
>(({ className, variant, size, asChild, ...props }, ref) => {
  if (asChild) {
    // If asChild is true, we need to handle this differently
    // For now, we'll just ignore the asChild prop and render normally
    return (
      <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
    )
  }

  return (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
})

Button.displayName = 'Button'

export { Button, buttonVariants }
