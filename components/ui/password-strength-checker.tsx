"use client"

import { Check, X } from "lucide-react"
import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface PasswordRequirement {
    label: string
    test: (password: string) => boolean
}

const requirements: PasswordRequirement[] = [
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
    { label: "One number", test: (p) => /[0-9]/.test(p) },
    { label: "One special character", test: (p) => /[^a-zA-Z0-9]/.test(p) },
]

interface PasswordStrengthCheckerProps {
    password: string
}

export function PasswordStrengthChecker({ password }: PasswordStrengthCheckerProps) {
    const results = useMemo(() => {
        return requirements.map((req) => ({
            label: req.label,
            met: req.test(password)
        }))
    }, [password])

    const allMet = results.every((r) => r.met)
    const metCount = results.filter((r) => r.met).length

    return (
        <AnimatePresence mode="wait">
            {password && (
                <motion.div
                    key="password-checker"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="space-y-2 text-sm pt-2"
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-muted-foreground">Password Requirements</span>
                            <span className="text-xs text-muted-foreground">
                                {metCount}/{requirements.length}
                            </span>
                        </div>
                        <div className="space-y-1.5">
                            {results.map((result, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + index * 0.05, duration: 0.2 }}
                                    className={`flex items-center gap-2 transition-colors ${result.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                                        }`}
                                >
                                    <motion.div
                                        className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all ${result.met
                                            ? "bg-green-100 dark:bg-green-900/30"
                                            : "bg-muted"
                                            }`}
                                        animate={result.met ? { scale: [1, 1.2, 1] } : {}}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {result.met ? (
                                            <Check className="w-3 h-3" strokeWidth={3} />
                                        ) : (
                                            <X className="w-3 h-3 opacity-30" strokeWidth={2} />
                                        )}
                                    </motion.div>
                                    <span className={`text-xs ${result.met ? "font-medium" : ""}`}>
                                        {result.label}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                        <AnimatePresence>
                            {allMet && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"
                                >
                                    <p className="text-xs text-green-700 dark:text-green-300 font-medium text-center">
                                        ✓ Password meets all requirements
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
