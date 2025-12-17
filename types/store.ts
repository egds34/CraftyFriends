export type ProductType = 'subscription' | 'one-time'

export interface Product {
    id: string
    name: string
    description: string
    price: number
    category: 'Memberships' | 'Boosts' | 'Chat' | 'Misc' | 'Donate'
    type: ProductType
    priceId?: string // Stripe Price ID
    image?: string // Path to image or icon name
    features?: string[]
}

export interface CartItem extends Product {
    cartId: string // Unique ID for this specific item in cart (timestamp or uuid)
}
