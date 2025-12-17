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

        const { priceId } = await req.json()
        let actualPriceId = priceId
        if (priceId === 'premium') {
            actualPriceId = process.env.STRIPE_PRICE_ID
        }

        if (!actualPriceId) {
            return new NextResponse("Missing Price ID", { status: 400 })
        }

        // Retrieve price details to check product metadata
        const priceObj = await stripe.prices.retrieve(actualPriceId, {
            expand: ['product']
        });

        const productObj = priceObj.product as Stripe.Product;
        const newCategory = productObj.metadata?.app_category || 'membership';
        const newTierRank = parseInt(productObj.metadata?.tier_rank || '0', 10);

        // Fetch user AND their active subscriptions
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                stripeCustomerId: true,
                subscriptions: {
                    where: {
                        currentPeriodEnd: { gt: new Date() }
                    }
                }
            }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        // CONFLICT & UPGRADE CHECK
        if (newCategory === 'membership') {
            const currentMembership = user.subscriptions.find((sub: any) => sub.category === 'membership');

            if (currentMembership) {
                // Determine rank of current membership
                let oldTierRank = 0;
                if (currentMembership.priceId) {
                    try {
                        const oldPrice = await stripe.prices.retrieve(currentMembership.priceId, {
                            expand: ['product']
                        });
                        const oldProduct = oldPrice.product as Stripe.Product;
                        oldTierRank = parseInt(oldProduct.metadata?.tier_rank || '0', 10);
                    } catch (e) {
                        console.error("[CHECKOUT] Failed to fetch old subscription details:", e);
                        // Fallback: If we can't verify rank, we might want to fail safe or block.
                        // For now, defaulting to 0 means we might allow a duplicate if Stripe fails, 
                        // but blocking is safer to prevent double billing.
                        oldTierRank = 999;
                    }
                }

                console.log(`[CHECKOUT] Upgrade Check: New Rank (${newTierRank}) vs Old Rank (${oldTierRank})`);

                if (newTierRank <= oldTierRank) {
                    return NextResponse.json(
                        { error: "You already have an active membership at this tier or higher. Manage your subscription to change plans." },
                        { status: 409 }
                    );
                }
                // If New > Old, we allow it (Upgrade)
            }
        }

        // Check if user already has a Stripe Customer ID
        let stripeCustomerId = user.stripeCustomerId

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email!,
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
            // Self-healing: If customer is missing
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
                throw err
            }
        }

        if (!sessionUrl) {
            console.error("[STRIPE_CHECKOUT] No URL generated")
            return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
        }

        return NextResponse.json({ url: sessionUrl })
    } catch (error: any) {
        console.error("[STRIPE_CHECKOUT] Error:", error)
        const key = process.env.STRIPE_SECRET_KEY || ""
        console.log("[STRIPE_CHECKOUT] Key Prefix:", key.substring(0, 8) + "...")

        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
