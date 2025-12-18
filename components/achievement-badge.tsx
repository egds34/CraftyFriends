import { AchievementIcon } from "./achievement-icon"

interface AchievementBadgeProps {
    name: string
    icon: string
    frameType?: 'task' | 'goal' | 'challenge'
    className?: string
}

export function AchievementBadge({ name, icon, frameType = 'task', className = "" }: AchievementBadgeProps) {
    // Determine the correct frame image
    // For now we assume all badges shown are "obtained" since they are in the user's list
    const frameSrc = `/images/advancements/frames/${frameType}_frame_obtained.png`

    return (
        <div className={`relative inline-flex items-center justify-center w-[52px] h-[52px] ${className}`}>
            {/* 1. The Frame Background */}
            {/* Pixel art scaling is crucial for the authentic look */}
            <img
                src={frameSrc}
                alt={`${frameType} frame`}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none rendering-pixelated"
                style={{ imageRendering: 'pixelated' }}
            />

            {/* 2. The Icon (Centered) */}
            {/* The icon is usually 16x16, scaled up. In our 52px frame (26x26 virtual pixels), 
                the icon should be about 32px visually to sit inside the padding. */}
            <div className="relative z-10 w-8 h-8 flex items-center justify-center">
                <AchievementIcon
                    name={name}
                    icon={icon}
                    size="md"
                    className="drop-shadow-sm" // Tiny shadow makes it pop from the background
                />
            </div>
        </div>
    )
}
