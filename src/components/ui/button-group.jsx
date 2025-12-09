import * as React from "react"
import { cn } from "@/lib/utils"

const ButtonGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex -space-x-px rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse",
        "[&>*:first-child]:rounded-s-lg [&>*:first-child]:rounded-e-none",
        "[&>*:last-child]:rounded-e-lg [&>*:last-child]:rounded-s-none",
        "[&>*:not(:first-child):not(:last-child)]:rounded-none",
        "[&>*]:focus-visible:z-10",
        className
      )}
      {...props}
    />
  )
})
ButtonGroup.displayName = "ButtonGroup"

export { ButtonGroup }
