"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setupTwoFactorApp, confirmTwoFactorApp } from "@/app/account/actions"
import Image from "next/image"

export function TwoFactorSetupDialog({ onComplete }: { onComplete: () => void }) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<"start" | "scan" | "confirm">("start")
    const [secret, setSecret] = useState("")
    const [qrCode, setQrCode] = useState("")
    const [code, setCode] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const startSetup = async () => {
        setLoading(true)
        const res = await setupTwoFactorApp()
        if (res.error) {
            setError(res.error)
        } else if (res.secret && res.qrCodeUrl) {
            setSecret(res.secret)
            setQrCode(res.qrCodeUrl)
            setStep("scan")
        }
        setLoading(false)
    }

    const confirmSetup = async () => {
        setLoading(true)
        setError("")
        const res = await confirmTwoFactorApp(secret, code)
        if (res.error) {
            setError(res.error)
        } else {
            setStep("confirm")
            onComplete()
            setTimeout(() => {
                setOpen(false)
                setStep("start")
                setCode("")
                setSecret("")
            }, 1000)
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                setStep("start")
                setCode("")
            }
            setOpen(val)
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Setup App</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Setup Authenticator App</DialogTitle>
                    <DialogDescription>
                        Use an app like Google Authenticator or Authy to scan the QR code.
                    </DialogDescription>
                </DialogHeader>

                {step === "start" && (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <p className="text-sm text-muted-foreground text-center">
                            Click below to generate a new QR code.
                        </p>
                        <Button onClick={startSetup} disabled={loading} variant="premium">
                            {loading ? "Generating..." : "Generate QR Code"}
                        </Button>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                )}

                {step === "scan" && (
                    <div className="flex flex-col items-center gap-6 py-4">
                        <div className="relative w-48 h-48 bg-white p-2 rounded-lg">
                            <Image src={qrCode} alt="QR Code" fill className="object-contain" unoptimized />
                        </div>
                        <div className="w-full space-y-2">
                            <Label>Verification Code</Label>
                            <Input
                                placeholder="123456"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="text-center tracking-widest text-lg"
                                maxLength={6}
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button onClick={confirmSetup} disabled={loading || code.length !== 6} className="w-full" variant="premium">
                            {loading ? "Verifying..." : "Verify & Activate"}
                        </Button>
                    </div>
                )}

                {step === "confirm" && (
                    <div className="flex flex-col items-center gap-4 py-4 text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        <p className="text-lg font-bold">Enabled!</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
