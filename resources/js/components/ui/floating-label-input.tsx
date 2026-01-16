import * as React from "react";
import { cn } from "@/lib/utils";

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
    ({ className, label, id, ...props }, ref) => {
        return (
            <div className={cn(
                "group relative rounded-lg border border-input bg-background px-3 py-1 shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring/50 focus-within:border-ring",
                className
            )}>
                <label
                    htmlFor={id}
                    className="block text-xs font-medium text-muted-foreground group-focus-within:text-foreground"
                >
                    {label}
                </label>
                <input
                    id={id}
                    ref={ref}
                    className="block w-full border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 h-6"
                    {...props}
                />
            </div>
        );
    }
);
FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };
