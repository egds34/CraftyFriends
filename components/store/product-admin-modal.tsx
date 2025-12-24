"use client"

import { useState, useEffect, ChangeEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createStripeProduct, updateStripeProduct, deleteStripeProduct, ProductFormData } from "@/app/store/actions"
import { Product } from "@/types/store"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ProductAdminModalProps {
    isOpen: boolean
    onClose: () => void
    product?: Product // If provided, we are in Edit mode
}

export function ProductAdminModal({ isOpen, onClose, product }: ProductAdminModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        description: "",
        summary: "",
        details: "",
        price: 0,
        category: "Misc",
        type: "one-time",
        features: ""
    })

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                summary: product.summary || "",
                details: product.details || "",
                price: product.price,
                category: product.category,
                type: product.type,
                features: product.features?.join('\n') || ""
            })
        } else {
            // Reset for Create mode
            setFormData({
                name: "",
                description: "",
                summary: "",
                details: "",
                price: 0,
                category: "Misc",
                type: "one-time",
                features: ""
            })
        }
    }, [product, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (product && product.stripeProductId) {
                const result = await updateStripeProduct(product.stripeProductId, product.priceId, formData)
                if (!result.success) throw new Error(result.error)
            } else if (product) {
                console.error("Missing Stripe ID for edit")
                alert("Cannot edit this product: Missing Stripe ID")
                return
            } else {
                // Create
                const result = await createStripeProduct(formData)
                if (!result.success) throw new Error(result.error)
            }
            onClose()
            router.refresh()
        } catch (error: any) {
            console.error(error)
            alert("Failed to save product: " + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Helper to update fields
    const updateField = (field: keyof ProductFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const inputStyles = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    const textareaStyles = "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('name', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <select
                                className={inputStyles}
                                value={formData.category}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateField('category', e.target.value)}
                            >
                                <option value="Memberships">Memberships</option>
                                <option value="Boosts">Boosts</option>
                                <option value="Chat">Chat</option>
                                <option value="Donate">Donate</option>
                                <option value="Misc">Misc</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Price ($)</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('price', parseFloat(e.target.value))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <select
                                className={inputStyles}
                                value={formData.type}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateField('type', e.target.value)}
                            >
                                <option value="one-time">One-time</option>
                                <option value="subscription">Subscription</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Short Summary (Card)</Label>
                        <Input
                            value={formData.summary}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('summary', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Full Details (Modal)</Label>
                        <textarea
                            value={formData.details}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateField('details', e.target.value)}
                            className={cn(textareaStyles, "h-24")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Features (One per line)</Label>
                        <textarea
                            value={formData.features}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateField('features', e.target.value)}
                            className={cn(textareaStyles, "h-24 font-mono text-xs")}
                            placeholder={`Feature 1\nFeature 2\nFeature 3`}
                        />
                    </div>
                </form>

                <DialogFooter>
                    {product && (
                        <Button
                            variant="destructive"
                            type="button"
                            className="mr-auto"
                            onClick={async () => {
                                if (confirm('Are you sure you want to delete this product?')) {
                                    if (!product.stripeProductId) return;
                                    setIsLoading(true)
                                    await deleteStripeProduct(product.stripeProductId)
                                    onClose()
                                    router.refresh()
                                    setIsLoading(false)
                                }
                            }}
                        >
                            Delete
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Saving..." : (product ? "Update Product" : "Create Product")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
