"use client"

import { AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ErrorModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    message: string
}

export function ErrorModal({ isOpen, onClose, title = "Something went wrong", message }: ErrorModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] border-destructive/50">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertCircle className="h-6 w-6" />
                        <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-foreground/90 text-sm leading-relaxed">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
