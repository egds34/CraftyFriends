"use client"

import React, { useState, useEffect, useRef } from "react"
import { getSvgPath } from "figma-squircle"

interface SquircleProps extends React.HTMLAttributes<HTMLDivElement> {
    cornerRadius?: number
    cornerSmoothing?: number
}

export function Squircle({
    children,
    cornerRadius = 20,
    cornerSmoothing = 1,
    className,
    style,
    ...props
}: SquircleProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [path, setPath] = useState("")
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    useEffect(() => {
        if (!containerRef.current) return

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect
                setDimensions({ width, height })
            }
        })

        observer.observe(containerRef.current)

        // Initial measurement
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return

        const svgPath = getSvgPath({
            width: dimensions.width,
            height: dimensions.height,
            cornerRadius,
            cornerSmoothing,
        })
        setPath(svgPath)
    }, [dimensions, cornerRadius, cornerSmoothing])

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative" // Wrapper ensures dimensions are captured
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
}
