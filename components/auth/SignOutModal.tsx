"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Loader2, CheckCircle2 } from "lucide-react"

interface SignOutModalProps {
    isOpen: boolean
    isSuccess: boolean
}

export function SignOutModal({ isOpen, isSuccess }: SignOutModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md"
                >
                    <div className="flex flex-col items-center gap-4 p-8 rounded-2xl relative">
                        {/* Optional: Add a subtle background glow or container if needed, 
                             but the full screen blur is often enough. 
                             Let's keep it clean. */}

                        <AnimatePresence mode="wait">
                            {!isSuccess ? (
                                <motion.div
                                    key="loading"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Loader2 className="w-12 h-12 text-primary" />
                                    </motion.div>
                                    <p className="text-xl font-medium text-muted-foreground animate-pulse">
                                        Signing out...
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    >
                                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                                    </motion.div>
                                    <p className="text-xl font-medium text-foreground">
                                        Sign out successful!
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
