"use client"

import { useState } from "react"

interface AchievementIconProps {
    name: string
    icon: string
    className?: string
    size?: "sm" | "md" | "lg"
}

export function AchievementIcon({ name, icon, className = "", size = "md" }: AchievementIconProps) {
    const defaultIcon = "https://minecraft.wiki/images/Invicon_Knowledge_Book.png"

    // 1. Determine Local File Extension
    // We know sculk_sensor is a GIF, others are PNGs
    const isAnimated = icon === 'sculk_sensor';
    const extension = isAnimated ? 'gif' : 'png';
    const localSrc = `/images/advancements/items/${icon}.${extension}`

    // 2. Fallback to Wiki (For 3D blocks/complex items we couldn't download)
    const formattedIconName = (icon || 'knowledge_book')
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('_')
    const wikiSrc = `https://minecraft.wiki/images/Invicon_${formattedIconName}.png`

    const [src, setSrc] = useState(localSrc)
    const [hasFallenBackToWiki, setHasFallenBackToWiki] = useState(false)

    const handleError = () => {
        if (!hasFallenBackToWiki) {
            setSrc(wikiSrc)
            setHasFallenBackToWiki(true)
        } else {
            setSrc(defaultIcon)
        }
    }

    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    }

    return (
        <img
            src={src}
            alt={name}
            className={`${sizeClasses[size]} object-contain ${className}`}
            style={{ imageRendering: "pixelated" }}
            onError={handleError}
        />
    )
}
