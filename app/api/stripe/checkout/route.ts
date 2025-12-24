import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { items } = body

        if (!items || !Array.isArray(items) || items.length === 0) {
            return new NextResponse("No items in cart", { status: 400 })
        }

        // Fetch user info for customer ID
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                stripeCustomerId: true,
                // We'd ideally fetch subscriptions here for conflict checks if needed
            }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        // Build Line Items
        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []
        let mode: Stripe.Checkout.SessionCreateParams.Mode = 'payment'

        for (const item of items) {
            if (!item.priceId) {
                console.warn(`[CHECKOUT] Item ${item.name} has no priceId, skipping.`)
                continue
            }

            // Logic to handle "premium" placeholder if it exists in data
            let actualPriceId = item.priceId
            if (actualPriceId === 'premium') {
                actualPriceId = process.env.STRIPE_PRICE_ID || ''
            }

            if (!actualPriceId) continue

            line_items.push({
                price: actualPriceId,
                quantity: 1, // Cart currently doesn't have quantity per item, just distinct items
            })

            // If ANY item is a subscription, the whole session must be subscription mode
            // (Stripe Checkout supports mixed cart in subscription mode)
            if (item.type === 'subscription') {
                mode = 'subscription'
            }
        }

        if (line_items.length === 0) {
            return new NextResponse("No valid items to checkout", { status: 400 })
        }

        // Check/Create Customer
        let stripeCustomerId = user.stripeCustomerId

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email!,
                metadata: {
                    userId: user.id
                }
            })
            stripeCustomerId = customer.id

            await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId }
            })
        }

        // Robust URL resolution: try public app url, then auth url, then localhost
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
        let sessionUrl: string | null = null

        try {
            const sessionParams: Stripe.Checkout.SessionCreateParams = {
                customer: stripeCustomerId,
                mode: mode,
                client_reference_id: user.id,
                line_items: line_items,
                success_url: `${baseUrl}/account?success=true`,
                cancel_url: `${baseUrl}/store?canceled=true`, // Redirect back to store on cancel
                metadata: {
                    userId: user.id,
                },
            }

            const session = await stripe.checkout.sessions.create(sessionParams)
            sessionUrl = session.url

        } catch (err: any) {
            // Self-healing: If customer is missing in Stripe but exists in DB (deleted in dashboard?)
            if (err.code === 'resource_missing' && err.param === 'customer') {
                console.log("[STRIPE_CHECKOUT] Customer ID invalid, creating new customer...")

                const newCustomer = await stripe.customers.create({
                    email: user.email!,
                    metadata: { userId: user.id }
                })

                await prisma.user.update({
                    where: { id: user.id },
                    data: { stripeCustomerId: newCustomer.id }
                })

                // Retry with new customer
                const retryParams: Stripe.Checkout.SessionCreateParams = {
                    customer: newCustomer.id,
                    mode: mode,
                    client_reference_id: user.id,
                    line_items: line_items,
                    success_url: `${baseUrl}/account?success=true`,
                    cancel_url: `${baseUrl}/store?canceled=true`,
                    metadata: {
                        userId: user.id,
                    },
                }

                const retrySession = await stripe.checkout.sessions.create(retryParams)
                sessionUrl = retrySession.url
            } else {
                throw err
            }
        }

        if (!sessionUrl) {
            return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
        }

        return NextResponse.json({ url: sessionUrl })

    } catch (error: any) {
        console.error("[STRIPE_CHECKOUT] Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
