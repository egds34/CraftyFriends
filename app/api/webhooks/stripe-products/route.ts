import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
})

const webhookSecret = process.env.STRIPE_PRODUCT_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`)
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log('========================================')
    console.log('🔔 STRIPE WEBHOOK RECEIVED!')
    console.log('Event Type:', event.type)
    console.log('Event ID:', event.id)
    console.log('Timestamp:', new Date().toISOString())
    console.log('========================================')

    try {
        switch (event.type) {
            case "product.created":
            case "product.updated": {
                const product = event.data.object as Stripe.Product

                console.log('=== STRIPE WEBHOOK RECEIVED ===')
                console.log('Event Type:', event.type)
                console.log('Product ID:', product.id)
                console.log('Product Name:', product.name)
                console.log('Product Description:', product.description)
                console.log('Product Active:', product.active)
                console.log('Product Metadata:', JSON.stringify(product.metadata, null, 2))

                // Get the default price for this product
                let price: Stripe.Price | null = null
                let priceAmount = 0
                let stripePriceId: string | null = null

                if (product.default_price) {
                    const priceId = typeof product.default_price === 'string'
                        ? product.default_price
                        : product.default_price.id

                    price = await stripe.prices.retrieve(priceId)
                    priceAmount = price.unit_amount ? price.unit_amount / 100 : 0
                    stripePriceId = price.id
                    console.log('Price Amount:', priceAmount)
                    console.log('Price ID:', stripePriceId)
                }

                // Extract metadata
                const category = product.metadata?.category || "Misc"
                const type = product.metadata?.type || "one-time"
                const features = product.metadata?.features
                    ? JSON.parse(product.metadata.features)
                    : []
                const summary = product.metadata?.summary || product.description || ""
                const details = product.metadata?.details || product.description || ""
                const isActive = product.metadata?.isActive === "false" ? false : true // Default to true

                console.log('Extracted Values:')
                console.log('  - category:', category)
                console.log('  - type:', type)
                console.log('  - features:', features)
                console.log('  - summary:', summary)
                console.log('  - details:', details)
                console.log('  - isActive:', isActive)

                const upsertResult = await prisma.product.upsert({
                    where: { stripeProductId: product.id },
                    update: {
                        name: product.name,
                        description: product.description || "",
                        price: priceAmount,
                        stripePriceId: stripePriceId,
                        category,
                        type,
                        features,
                        active: product.active,
                        metadata: {
                            ...product.metadata,
                            summary,
                            details,
                            isActive,
                        } as any,
                        updatedAt: new Date(),
                    },
                    create: {
                        stripeProductId: product.id,
                        stripePriceId: stripePriceId,
                        name: product.name,
                        description: product.description || "",
                        price: priceAmount,
                        category,
                        type,
                        features,
                        active: product.active,
                        metadata: {
                            ...product.metadata,
                            summary,
                            details,
                            isActive,
                        } as any,
                    },
                })

                console.log('Database upsert result:', upsertResult)
                console.log(`Product ${event.type}: ${product.name} - SUCCESS`)
                console.log('=================================')
                break
            }

            case "product.deleted": {
                const product = event.data.object as Stripe.Product

                await prisma.product.update({
                    where: { stripeProductId: product.id },
                    data: { active: false },
                })

                console.log(`Product deleted: ${product.name}`)
                break
            }

            case "price.created":
            case "price.updated": {
                const price = event.data.object as Stripe.Price

                if (price.product && typeof price.product === 'string') {
                    const priceAmount = price.unit_amount ? price.unit_amount / 100 : 0

                    await prisma.product.updateMany({
                        where: { stripeProductId: price.product },
                        data: {
                            price: priceAmount,
                            stripePriceId: price.id,
                            updatedAt: new Date(),
                        },
                    })

                    console.log(`Price ${event.type} for product: ${price.product}`)
                }
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error(`Error processing webhook: ${error.message}`)
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        )
    }
}
