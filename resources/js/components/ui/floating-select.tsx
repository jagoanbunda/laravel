import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface FloatingSelectProps {
  label: string
  options: { value: string; label: string }[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
}

export function FloatingSelect({
  label,
  options,
  value,
  onValueChange,
  placeholder = "Pilih opsi",
  className,
  required
}: FloatingSelectProps) {
  return (
    <div className="relative">
      <Select value={value} onValueChange={onValueChange} required={required}>
        <SelectTrigger
          className={cn(
            "h-14 w-full rounded-xl border-[oklch(0.85_0.02_80)] bg-transparent px-4 text-base focus:border-[oklch(0.60_0.12_163)] focus:ring-2 focus:ring-[oklch(0.60_0.12_163/0.2)]",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-[oklch(0.85_0.02_80)] bg-white p-1">
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="rounded-lg px-4 py-3 text-base cursor-pointer hover:bg-[oklch(0.97_0.02_163)] focus:bg-[oklch(0.95_0.03_163)] focus:text-[oklch(0.30_0.02_60)]"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <label
        className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[oklch(0.50_0.02_60)] z-10"
      >
        {label}
      </label>
    </div>
  )
}
