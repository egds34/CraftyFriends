"use client"

import { JellyButton } from "@/components/ui/jelly-button"

export default function TestPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="space-y-8 text-center">
                <h1 className="text-4xl font-heading font-bold">Jelly Button Test</h1>

                <div className="flex flex-col gap-4 items-center">
                    <JellyButton size="lg" onClick={() => console.log("Clicked!")}>
                        Click Me!
                    </JellyButton>

                    <JellyButton size="md" variant="secondary">
                        Secondary
                    </JellyButton>

                    <JellyButton size="sm" variant="outline">
                        Outline
                    </JellyButton>
                </div>

                <p className="text-muted-foreground text-sm">
                    Click the buttons to see the jelly wobble effect!
                </p>
            </div>
        </div>
    )
}
