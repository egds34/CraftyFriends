"use client"

import * as React from "react"
import { motion, useAnimationControls } from "framer-motion"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "premium" | "destructive"
    size?: "default" | "sm" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", onClick, ...props }, ref) => {
        const controls = useAnimationControls()

        const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
            // Snap back with dramatic overshoot (happens on release)
            await controls.start({
                scaleY: 1.15,
                scaleX: 0.92,
                transition: { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }
            })

            // Dramatic wobble to settle
            controls.start({
                scaleY: [1.15, 0.95, 1.05, 1],
                scaleX: [0.92, 1.08, 0.98, 1],
                transition: {
                    duration: 0.5,
                    ease: "circOut"
                }
            })

            // Call original onClick
            onClick?.(e)
        }

        return (
            <motion.button
                ref={ref}
                animate={controls}
                whileTap={{
                    scaleY: 0.85,
                    scaleX: 1.1,
                    transition: { duration: 0.1, ease: "easeIn" }
                }}
                className={cn(
                    "inline-flex items-center justify-center rounded-full font-heading font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
                    {
                        "bg-primary text-white shadow-lg hover:shadow-xl": variant === "default",
                        "border-2 border-primary text-primary hover:bg-primary/10 shadow-md": variant === "outline",
                        "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
                        "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:opacity-90 hover:shadow-xl": variant === "premium",
                        "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg": variant === "destructive",
                        "h-10 px-4 py-2 text-xs": size === "default",
                        "h-9 px-3 text-xs": size === "sm",
                        "h-11 px-8 text-sm": size === "lg",
                        "h-10 w-10 text-xs": size === "icon",
                    },
                    className
                )}
                onClick={handleClick}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"
