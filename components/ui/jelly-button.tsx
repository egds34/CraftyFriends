"use client"

import { motion, useAnimationControls } from "framer-motion"
import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, ReactNode } from "react"

interface JellyButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "ref"> {
    children: ReactNode
    variant?: "primary" | "secondary" | "outline"
    size?: "sm" | "md" | "lg"
}

export function JellyButton({
    children,
    className,
    variant = "primary",
    size = "md",
    onClick,
    ...props
}: JellyButtonProps) {

    const controls = useAnimationControls()

    const baseStyles = "relative font-heading font-bold uppercase tracking-widest rounded-full transition-colors overflow-hidden"

    const variantStyles = {
        primary: "bg-primary text-white shadow-lg hover:shadow-xl",
        secondary: "bg-secondary text-secondary-foreground shadow-md hover:shadow-lg",
        outline: "border-2 border-primary text-primary hover:bg-primary/10"
    }

    const sizeStyles = {
        sm: "px-6 py-2 text-xs",
        md: "px-8 py-3 text-sm",
        lg: "px-10 py-4 text-base"
    }

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

        // Call original onClick after animation starts
        onClick?.(e)
    }

    return (
        <motion.button
            className={cn(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            animate={controls}
            whileHover={{
                scale: 1.05,
                transition: { duration: 0.2, ease: "easeOut" }
            }}
            whileTap={{
                scaleY: 0.85,
                scaleX: 1.1,
                transition: { duration: 0.1, ease: "easeIn" }
            }}
            onClick={handleClick}
            {...props}
        >
            {/* Shine effect overlay */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{
                    x: "100%",
                    transition: { duration: 0.6, ease: "easeInOut" }
                }}
            />

            {/* Content */}
            <span className="relative z-10">{children}</span>
        </motion.button>
    )
}
