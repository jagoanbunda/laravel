import * as React from "react"
import { cn } from "@/lib/utils"

interface FloatingTextareaProps extends React.ComponentProps<"textarea"> {
  label: string
}

const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="relative">
        <textarea
          className={cn(
            "peer block w-full min-h-[140px] resize-none rounded-xl border border-[oklch(0.85_0.02_80)] bg-transparent px-4 py-3 text-base text-foreground focus:border-[oklch(0.60_0.12_163)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.60_0.12_163/0.2)] placeholder:text-transparent",
            className
          )}
          placeholder=" "
          ref={ref}
          {...props}
        />
        <label
          className={cn(
            "pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[oklch(0.50_0.02_60)] transition-all duration-200",
            "peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground peer-focus:top-0 peer-focus:text-xs peer-focus:text-[oklch(0.50_0.12_163)]"
          )}
        >
          {label}
        </label>
      </div>
    )
  }
)
FloatingTextarea.displayName = "FloatingTextarea"

export { FloatingTextarea }
