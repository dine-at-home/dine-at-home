import * as React from 'react'

import { cn } from './utils'

function Label({ className, htmlFor, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'flex items-center gap-2 text-sm font-medium leading-normal select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Label }
