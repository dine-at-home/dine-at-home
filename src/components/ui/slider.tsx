'use client'

import * as React from 'react'
import RcSlider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { cn } from './utils'

type RcSliderProps = React.ComponentProps<typeof RcSlider>

interface SliderProps extends Omit<RcSliderProps, 'onChange' | 'range'> {
  onValueChange?: (value: number | number[]) => void
  range?: boolean
}

const Slider = React.forwardRef<any, SliderProps>(({ className, onValueChange, ...props }, ref) => {
  return (
    <div className={cn('relative w-full px-1', className)}>
      <RcSlider
        ref={ref}
        range
        allowCross={false}
        {...props}
        onChange={(val) => onValueChange?.(val)}
        styles={{
          track: { backgroundColor: 'hsl(var(--primary))', height: 6 },
          rail: { backgroundColor: 'hsl(var(--secondary))', height: 6 },
          handle: {
            borderColor: 'hsl(var(--primary))',
            backgroundColor: 'white',
            opacity: 1,
            height: 20,
            width: 20,
            marginTop: -7,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        }}
      />
      <style jsx global>{`
        .rc-slider-handle {
          cursor: grab !important;
        }
        .rc-slider-handle:active {
          cursor: grabbing !important;
          border-color: hsl(var(--primary)) !important;
          box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2) !important;
        }
        .rc-slider-handle-dragging {
          border-color: hsl(var(--primary)) !important;
          box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2) !important;
        }
      `}</style>
    </div>
  )
})

Slider.displayName = 'Slider'

export { Slider }
