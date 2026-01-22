import * as React from "react";
import { cn } from "@/lib/utils";

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: boolean;
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
    ({ className, label, id, error, ...props }, ref) => {
        return (
            <div className="relative">
                <input
                    id={id}
                    ref={ref}
                    className={cn(
                        "peer block w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm placeholder:text-transparent focus:border-foreground focus:outline-none focus:ring-0",
                        error && "border-red-500 focus:border-red-500",
                        className
                    )}
                    placeholder={label}
                    {...props}
                />
                <label
                    htmlFor={id}
                    className={cn(
                        "pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-muted-foreground transition-all",
                        "peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted-foreground",
                        "peer-focus:top-0 peer-focus:text-xs peer-focus:text-muted-foreground",
                        error && "text-red-500"
                    )}
                >
                    {label}
                </label>
            </div>
        );
    }
);
FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };
