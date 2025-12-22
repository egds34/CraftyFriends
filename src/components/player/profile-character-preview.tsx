"use client"

import { useState } from "react"
import { SkinViewer } from "./skin-viewer"
import { motion } from "framer-motion"

interface ProfileCharacterPreviewProps {
    username: string
}

export function ProfileCharacterPreview({ username }: ProfileCharacterPreviewProps) {
    const [animation, setAnimation] = useState<'idle' | 'walk' | 'run' | 'fly' | 'wave' | 'crouch' | 'hit'>('idle')

    const animations: Array<{ id: typeof animation; label: string; icon: string }> = [
        { id: 'idle', label: 'Idle', icon: '👤' },
        { id: 'walk', label: 'Walk', icon: '🚶' },
        { id: 'run', label: 'Run', icon: '🏃' },
        { id: 'fly', label: 'Fly', icon: '🕊️' },
        { id: 'wave', label: 'Wave', icon: '👋' },
        { id: 'crouch', label: 'Sneak', icon: '🧘' },
        { id: 'hit', label: 'Hit', icon: '⚔️' },
    ]

    return (
        <div className="flex flex-col items-center justify-center bg-muted/30 rounded-xl p-4 min-w-[240px]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Character Preview</h4>

            <div className="relative group">
                <SkinViewer
                    username={username}
                    width={200}
                    height={280}
                    animation={animation}
                />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 max-w-[220px]">
                {animations.map((anim) => (
                    <button
                        key={anim.id}
                        onClick={() => setAnimation(anim.id)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${animation === anim.id
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-background hover:bg-muted text-muted-foreground border'
                            }`}
                        title={anim.label}
                    >
                        <span className="mr-1">{anim.icon}</span>
                        {anim.label}
                    </button>
                ))}
            </div>

            <p className="text-[10px] text-muted-foreground mt-4 font-mono">{username}</p>
        </div>
    )
}
