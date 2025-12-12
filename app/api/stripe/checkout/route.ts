import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                stripeCustomerId: true
            }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        // Check if user already has a Stripe Customer ID
        let stripeCustomerId = user.stripeCustomerId

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    userId: user.id
                }
            })
            stripeCustomerId = customer.id

            // Save to user
            await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId }
            })
        }

        const { priceId } = await req.json()
        let actualPriceId = priceId
        if (priceId === 'premium') {
            actualPriceId = process.env.STRIPE_PRICE_ID
        }

        if (!actualPriceId) {
            return new NextResponse("Missing Price ID", { status: 400 })
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

        let sessionUrl: string | null = null

        try {
            const session = await stripe.checkout.sessions.create({
                customer: stripeCustomerId,
                mode: "subscription",
                client_reference_id: user.id,
                line_items: [
                    {
                        price: actualPriceId,
                        quantity: 1,
                    },
                ],
                success_url: `${baseUrl}/dashboard?success=true`,
                cancel_url: `${baseUrl}?canceled=true`,
                metadata: {
                    userId: user.id,
                },
            })
            sessionUrl = session.url
        } catch (err: any) {
            // Self-healing: If customer is missing (deleted in Stripe or key mismatch), create a new one
            if (err.code === 'resource_missing' && err.param === 'customer') {
                console.log("[STRIPE_CHECKOUT] Customer ID invalid, creating new customer...")

                const newCustomer = await stripe.customers.create({
                    email: user.email,
                    metadata: { userId: user.id }
                })

                await prisma.user.update({
                    where: { id: user.id },
                    data: { stripeCustomerId: newCustomer.id }
                })

                // Retry with new customer
                const retrySession = await stripe.checkout.sessions.create({
                    customer: newCustomer.id,
                    mode: "subscription",
                    client_reference_id: user.id,
                    line_items: [
                        {
                            price: actualPriceId,
                            quantity: 1,
                        },
                    ],
                    success_url: `${baseUrl}/dashboard?success=true`,
                    cancel_url: `${baseUrl}?canceled=true`,
                    metadata: {
                        userId: user.id,
                    },
                })
                sessionUrl = retrySession.url
            } else {
                throw err // Re-throw other errors
            }
        }

        if (!sessionUrl) {
            console.error("[STRIPE_CHECKOUT] No URL generated")
            return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
        }

        return NextResponse.json({ url: sessionUrl })
    } catch (error: any) {
        console.error("[STRIPE_CHECKOUT] Error:", error)
        // Log key prefix safely to debug test/live mismatch
        const key = process.env.STRIPE_SECRET_KEY || ""
        console.log("[STRIPE_CHECKOUT] Key Prefix:", key.substring(0, 8) + "...")

        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
