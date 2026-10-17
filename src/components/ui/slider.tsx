import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none",
        "data-[disabled]:opacity-50",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-full",

          // 🎧 soft dark base
          "bg-zinc-800/70 backdrop-blur-sm",

          // size
          "data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full",
          "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute rounded-full",

            // 💚 premium gradient green
            "bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600",

            // ✨ glow effect
            "shadow-[0_0_10px_rgba(34,197,94,0.6)]",

            "data-[orientation=horizontal]:h-full",
            "data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>

      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={cn(
            "block size-4 shrink-0 rounded-full transition-all duration-200",

            // 💎 glassy green thumb
            "bg-gradient-to-br from-emerald-300 to-green-500",
            "border border-emerald-400/60",

            // ✨ soft glow
            "shadow-[0_0_8px_rgba(34,197,94,0.7)]",

            // 🎧 hover effect
            "hover:scale-110 hover:shadow-[0_0_14px_rgba(34,197,94,0.9)]",

            // focus
            "focus-visible:ring-4 focus-visible:ring-emerald-400/40 focus-visible:outline-none",

            "disabled:pointer-events-none disabled:opacity-50"
          )}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }