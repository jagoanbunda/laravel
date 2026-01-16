import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertCircle, XCircle, Clock, HelpCircle } from "lucide-react"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        // Semantic status variants
        success: "bg-success-muted text-success-muted-foreground border-success/20",
        warning: "bg-warning-muted text-warning-muted-foreground border-warning/20",
        danger: "bg-danger-muted text-danger-muted-foreground border-danger/20",
        info: "bg-info-muted text-info-muted-foreground border-info/20",
        neutral: "bg-neutral-muted text-neutral-muted-foreground border-neutral/20",
        
        // Application-specific aliases
        sesuai: "bg-success-muted text-success-muted-foreground border-success/20",
        pantau: "bg-warning-muted text-warning-muted-foreground border-warning/20",
        perlu_rujukan: "bg-danger-muted text-danger-muted-foreground border-danger/20",
        pending: "bg-neutral-muted text-neutral-muted-foreground border-neutral/20",
        
        // Active/Inactive states
        active: "bg-success-muted text-success-muted-foreground border-success/20",
        inactive: "bg-neutral-muted text-neutral-muted-foreground border-neutral/20",
        
        // Portion-based (for PMT)
        habis: "bg-success-muted text-success-muted-foreground border-success/20",
        half: "bg-info-muted text-info-muted-foreground border-info/20",
        quarter: "bg-warning-muted text-warning-muted-foreground border-warning/20",
        none: "bg-danger-muted text-danger-muted-foreground border-danger/20",
      },
      size: {
        default: "h-5 text-xs",
        sm: "h-4 text-[10px] px-2 py-0",
        lg: "h-6 text-sm px-3",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
)

// Icon mapping for each variant
const variantIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  warning: AlertCircle,
  danger: XCircle,
  info: AlertCircle,
  neutral: HelpCircle,
  sesuai: CheckCircle2,
  pantau: AlertCircle,
  perlu_rujukan: XCircle,
  pending: Clock,
  active: CheckCircle2,
  inactive: Clock,
  habis: CheckCircle2,
  half: AlertCircle,
  quarter: AlertCircle,
  none: XCircle,
}

// Label mapping for Indonesian translations
const variantLabels: Record<string, string> = {
  success: "Success",
  warning: "Warning",
  danger: "Danger",
  info: "Info",
  neutral: "Neutral",
  sesuai: "Sesuai",
  pantau: "Pantau",
  perlu_rujukan: "Perlu Rujukan",
  pending: "Pending",
  active: "Active",
  inactive: "Inactive",
  habis: "Habis (100%)",
  half: "Setengah (50%)",
  quarter: "Seperempat (25%)",
  none: "Tidak Dimakan",
}

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof statusBadgeVariants> {
  showIcon?: boolean
  showDot?: boolean
  label?: string
}

function StatusBadge({
  className,
  variant = "neutral",
  size = "default",
  showIcon = false,
  showDot = false,
  label,
  ...props
}: StatusBadgeProps) {
  const Icon = variant ? variantIcons[variant] : null
  const displayLabel = label || (variant ? variantLabels[variant] : "")

  return (
    <span
      data-slot="status-badge"
      data-variant={variant}
      className={cn(statusBadgeVariants({ variant, size }), className)}
      {...props}
    >
      {showDot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      )}
      {showIcon && Icon && (
        <Icon className="h-3 w-3" />
      )}
      {displayLabel}
    </span>
  )
}

export { StatusBadge, statusBadgeVariants }
