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
    error?: string;
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
        <div className={cn(
            "group relative rounded-lg border border-input bg-background px-3 py-1 shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring/50 focus-within:border-ring",
            error && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
            className
        )}>
            <label className="block text-xs font-medium text-muted-foreground group-focus-within:text-foreground">
                {label}
            </label>
            <div className="-ml-3 -mr-2">
                <Select {...props}>
                    <SelectTrigger
                        className="h-6 w-full rounded-none border-0 bg-transparent px-3 py-0 shadow-none focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-muted-foreground/50"
                    >
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {children}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export { FloatingLabelSelect };
