import * as React from "react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface FloatingLabelSelectProps extends React.ComponentProps<typeof Select> {
    label: string;
    placeholder?: string;
    className?: string;
    children: React.ReactNode;
    error?: boolean;
}

const FloatingLabelSelect = ({
    label,
    placeholder,
    className,
    children,
    error,
    ...props
}: FloatingLabelSelectProps) => {
    return (
        <div className="relative">
            <Select {...props}>
                <SelectTrigger
                    className={cn(
                        "!h-auto !w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm focus:border-foreground focus:ring-0",
                        error && "border-red-500 focus:border-red-500",
                        className
                    )}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {children}
                </SelectContent>
            </Select>
            <label
                className={cn(
                    "pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-muted-foreground",
                    error && "text-red-500"
                )}
            >
                {label}
            </label>
        </div>
    );
};

export { FloatingLabelSelect };
