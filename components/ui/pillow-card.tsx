import React from "react";
import { Squircle } from "@/components/ui/squircle";
import { cn } from "@/lib/utils";

interface PillowCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Classes to apply to the disconnected shadow background (mostly for color) */
    shadowClassName?: string;
    /** Classes to apply to the inner Squircle content container */
    contentClassName?: string;
    /** Tailwind class for top position of shadow (default: top-12) */
    shadowTop?: string;
    /** Tailwind class for bottom position of shadow (default: -bottom-3) */
    shadowBottom?: string;
    /** Tailwind class for left position of shadow (default: left-[1px]) */
    shadowLeft?: string;
    /** Tailwind class for right position of shadow (default: right-[1px]) */
    shadowRight?: string;
}

export function PillowCard({
    children,
    className,
    shadowClassName,
    contentClassName,
    shadowTop = "top-12",
    shadowBottom = "-bottom-3",
    shadowLeft = "left-[1px]",
    shadowRight = "right-[1px]",
    ...props
}: PillowCardProps) {
    return (
        <div className={cn("relative z-0", className)} {...props}>
            {/* Disconnected Shadow */}
            <div
                className={cn(
                    "absolute rounded-[50px] -z-10",
                    shadowTop,
                    shadowBottom,
                    shadowLeft,
                    shadowRight,
                    shadowClassName
                )}
            />

            {/* Main squircle card */}
            <Squircle
                cornerRadius={65}
                cornerSmoothing={1}
                className={cn(
                    "w-full h-full bg-white/80 dark:bg-white/90 backdrop-blur-md border border-white/20 p-8 dark:text-black",
                    contentClassName
                )}
            >
                {children}
            </Squircle>
        </div>
    );
}
