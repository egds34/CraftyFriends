"use client"
import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

import { motion } from "framer-motion"

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    const [rotation, setRotation] = React.useState(0)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <motion.div
                animate={{ rotate: rotation }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12 bg-background/80 backdrop-blur-sm border-border hover:bg-accent hover:scale-110 transition-all text-primary"
                    onClick={() => {
                        setRotation(prev => prev + 360)
                        setTheme(resolvedTheme === "dark" ? "light" : "dark")
                    }}
                >
                    {resolvedTheme === "dark" ? (
                        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
                    ) : (
                        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </motion.div>
        </div>
    )
}
