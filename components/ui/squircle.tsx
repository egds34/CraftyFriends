"use client"

import React, { useState, useEffect, useRef } from "react"
import { getSvgPath } from "figma-squircle"

export interface SquircleProps extends React.HTMLAttributes<HTMLDivElement> {
    cornerRadius?: number
    topLeftRadius?: number
    topRightRadius?: number
    bottomLeftRadius?: number
    bottomRightRadius?: number
    cornerSmoothing?: number
}

export const Squircle = React.forwardRef<HTMLDivElement, SquircleProps>((
    {
        children,
        cornerRadius = 20,
        topLeftRadius,
        topRightRadius,
        bottomLeftRadius,
        bottomRightRadius,
        cornerSmoothing = 1,
        className,
        style,
        ...props
    },
    ref
) => {
    const internalRef = useRef<HTMLDivElement>(null)
    const [path, setPath] = useState("")
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const node = internalRef.current
        if (!node) return

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect
                setDimensions({ width, height })
            }
        })

        observer.observe(node)

        const rect = node.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return

        const svgPath = getSvgPath({
            width: dimensions.width,
            height: dimensions.height,
            cornerRadius,
            topLeftCornerRadius: topLeftRadius,
            topRightCornerRadius: topRightRadius,
            bottomLeftCornerRadius: bottomLeftRadius,
            bottomRightCornerRadius: bottomRightRadius,
            cornerSmoothing,
        })
        setPath(svgPath)
    }, [dimensions, cornerRadius, cornerSmoothing, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius])

    return (
        <div
            ref={(node) => {
                // Handle both the forwarded ref and our internal ref
                // @ts-ignore
                internalRef.current = node
                if (typeof ref === "function") {
                    ref(node)
                } else if (ref) {
                    ref.current = node
                }
            }}
            className="w-full h-full relative"
        >
            <div
                className={className}
                style={{
                    ...style,
                    clipPath: path ? `path('${path}')` : undefined,
                }}
                {...props}
            >
                {children}
            </div>
        </div>
    )
})

Squircle.displayName = "Squircle"
