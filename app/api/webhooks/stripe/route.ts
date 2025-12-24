import { headers } from "next/headers"
import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"
import Stripe from "stripe"

export async function POST(req: Request) {
    console.log("[WEBHOOK] HANDLER Ver 5.0")
    const body = await req.text()
    const headerPayload = await headers()
    const signature = headerPayload.get("Stripe-Signature") as string

    let event: Stripe.Event

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.error("[WEBHOOK_ERROR] Secret missing")
            return new NextResponse("Webhook Error: Secret Missing", { status: 400 })
        }

        console.log(`[WEBHOOK_DEBUG] Signature: ${signature ? signature.substring(0, 10) : 'MISSING'}...`)
        const secret = process.env.STRIPE_WEBHOOK_SECRET
        console.log(`[WEBHOOK_DEBUG] Secret Prefix: ${secret.substring(0, 8)}...`)

        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error: any) {
        console.error(`[WEBHOOK_ERROR] Signature verification failed: ${error.message}`)
        console.error(`[WEBHOOK_ERROR] Body length: ${body.length}`)
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session
    const subscription = event.data.object as Stripe.Subscription

    // Log event type for every request
    console.log(`[WEBHOOK] Received Event: ${event.type}`)

    try {
        // 1. Checkout Completed -> Create Subscription Record
        if (event.type === "checkout.session.completed") {
            const subscriptionId = typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id

            if (!session?.metadata?.userId || !subscriptionId) {
                console.error("[WEBHOOK_ERROR] Missing userId or subscriptionId in session")
                return new NextResponse("Missing metadata", { status: 400 })
            }

            console.log(`[WEBHOOK] Checkout completed for ${session.metadata.userId}`)

            // Expand product to get metadata
            const sub = await stripe.subscriptions.retrieve(subscriptionId, {
                expand: ['plan.product']
            })

            // Safe Date Parsing
            const rawPeriodEnd = (sub as any).current_period_end
            const expiryDate = rawPeriodEnd
                ? new Date(rawPeriodEnd * 1000)
                : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)

            const cancelAtPeriodEnd = (sub as any).cancel_at_period_end || false

            // Extract Metadata
            const stripeSub = sub as unknown as Stripe.Subscription
            const item = stripeSub.items.data[0]
            const product = item.price.product as Stripe.Product
            const category = product.metadata?.app_category || 'membership'
            const priceId = item.price.id

            console.log(`[WEBHOOK] Subscription Category: ${category}, Price: ${priceId}`)

            // Create/Upsert Subscription
            console.log(`[WEBHOOK] Upserting subscription record...`)
            await prisma.subscription.upsert({
                where: { transactionId: subscriptionId },
                create: {
                    id: session.metadata.userId,
                    transactionId: subscriptionId,
                    currentPeriodEnd: expiryDate,
                    cancelAtPeriodEnd: cancelAtPeriodEnd,
                    category: category,
                    priceId: priceId
                },
                update: {
                    currentPeriodEnd: expiryDate,
                    cancelAtPeriodEnd: cancelAtPeriodEnd,
                    category: category,
                    priceId: priceId
                }
            })

            // Grant Role (Only for memberships) & Handle Upgrades (Cancel old sub)
            if (category === 'membership') {
                console.log(`[WEBHOOK] Granting PREMIUM role...`)
                await prisma.user.update({
                    where: { id: session.metadata.userId },
                    data: {
                        role: 'PREMIUM',
                        stripeCustomerId: session.customer as string
                    }
                })

                // Auto-cancel PREVIOUS memberships (Upgrade Logic)
                const existingSubs = await prisma.subscription.findMany({
                    where: {
                        id: session.metadata.userId,
                        category: 'membership',
                        transactionId: { not: subscriptionId } // Don't cancel the one we just made
                    }
                })

                for (const oldSub of existingSubs) {
                    console.log(`[WEBHOOK] Auto-canceling old membership: ${oldSub.transactionId}`)
                    try {
                        await stripe.subscriptions.cancel(oldSub.transactionId)
                        // Optional: Delete from DB immediately or let webhook 'deleted' event handle it. 
                        // Letting 'deleted' handle it is safer for consistency.
                    } catch (err) {
                        console.error(`[WEBHOOK_ERROR] Failed to auto-cancel ${oldSub.transactionId}:`, err)
                    }
                }
            }
            revalidatePath('/dashboard')
        }

        // 2. Subscription Updated -> Update Dates / Status
        if (event.type === "customer.subscription.updated") {
            const subId = subscription.id
            console.log(`[WEBHOOK] Processing subscription update for ${subId}`)

            // Fetch fresh with product expansion
            const freshSub = await stripe.subscriptions.retrieve(subId, {
                expand: ['items.data.price.product'] // Changed expansion path for deep Access
            })
            console.log(`[WEBHOOK_DEBUG] Full Stripe Subscription Object:`, JSON.stringify(freshSub, null, 2))

            const freshStripeSub = freshSub as unknown as Stripe.Subscription
            const item = freshStripeSub.items.data[0]
            const product = item.price.product as Stripe.Product
            const category = product.metadata?.app_category || 'membership'
            const priceId = item.price.id

            // Derive cancellation status from cancel_at field as requested
            // If cancel_at is present, it means it's set to cancel (true). 
            // If update sent and cancel_at is null, it means reinstated (false).
            const isCancelled = !!(freshSub as any).cancel_at

            // Safe Date Parsing
            const freshPeriodEnd = (freshSub as any).current_period_end
            const freshExpiryDate = freshPeriodEnd
                ? new Date(freshPeriodEnd * 1000)
                : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)

            // Find the subscription by ID
            let dbSub = await prisma.subscription.findUnique({
                where: { transactionId: subId }
            })

            // Fallback: If not found, try to find via Customer ID (Self-healing)
            if (!dbSub && freshSub.customer) {
                console.log(`[WEBHOOK] Sub ID not found. Trying fallback via Customer ID: ${freshSub.customer}`)
                const user = await prisma.user.findUnique({
                    where: { stripeCustomerId: freshSub.customer as string },
                    include: { subscriptions: true }
                })

                // If user found, check if they have a matching sub by category, or just create new
                if (user) {
                    console.log(`[WEBHOOK] Found user ${user.id}. Creating/Linking subscription...`)
                    dbSub = await prisma.subscription.create({
                        data: {
                            id: user.id,
                            transactionId: subId,
                            currentPeriodEnd: freshExpiryDate,
                            cancelAtPeriodEnd: isCancelled,
                            category: category,
                            priceId: priceId
                        }
                    })
                }
            }



            if (dbSub) {
                // Update existing
                const updateData = {
                    currentPeriodEnd: freshExpiryDate,
                    cancelAtPeriodEnd: isCancelled,
                    category: category,
                    priceId: priceId
                }
                console.log(`[WEBHOOK_DEBUG] DB Update Payload for ${subId}:`, JSON.stringify(updateData, null, 2))

                await prisma.subscription.update({
                    where: { transactionId: subId },
                    data: updateData
                })
                console.log(`[WEBHOOK] Updated subscription ${subId}`)
                revalidatePath('/dashboard')

                // Notify client to refresh
                try {
                    await pusherServer.trigger(`user-${dbSub.id}`, 'dashboard-refresh', {})
                    console.log(`[WEBHOOK] Triggered refresh for user ${dbSub.id}`)
                } catch (error) {
                    console.error("[WEBHOOK_ERROR] Failed to trigger pusher event:", error)
                }
            } else {
                console.warn(`[WEBHOOK_WARN] Could not find or link subscription ${subId}.`)
            }
        }

        // 3. Subscription Deleted -> Revoke Access
        if (event.type === "customer.subscription.deleted") {
            console.log(`[WEBHOOK] Processing subscription deletion for ${subscription.id}`)
            const dbSub = await prisma.subscription.findUnique({
                where: { transactionId: subscription.id }
            })

            if (dbSub) {
                console.log(`[WEBHOOK] Revoking access for user ${dbSub.id}`)
                await prisma.user.update({
                    where: { id: dbSub.id }, // ID matches User ID
                    data: { role: 'BASIC' }
                })

                // Remove the subscription record to allow re-subscribing cleanly
                await prisma.subscription.delete({
                    where: { transactionId: subscription.id }
                })
                console.log(`[WEBHOOK] Revoked PREMIUM from user ${dbSub.id}`)
            } else {
                console.warn(`[WEBHOOK_WARN] Could not find subscription ${subscription.id} in database to delete.`)
            }
        }

        // 4. Payment Failed -> Log and Sync
        if (event.type === "invoice.payment_failed") {
            const invoice = event.data.object as Stripe.Invoice
            const subscriptionId = typeof (invoice as any).subscription === 'string'
                ? (invoice as any).subscription
                : (invoice as any).subscription?.id

            if (subscriptionId) {
                console.log(`[WEBHOOK] Payment failed for subscription ${subscriptionId}`)

                try {
                    // Retrieve latest state to ensure DB reflects any status changes (e.g. past_due)
                    const freshSub = await stripe.subscriptions.retrieve(subscriptionId)
                    const isCancelled = !!freshSub.cancel_at

                    await prisma.subscription.update({
                        where: { transactionId: subscriptionId },
                        data: {
                            cancelAtPeriodEnd: isCancelled,
                            currentPeriodEnd: new Date((freshSub as any).current_period_end * 1000)
                        }
                    })
                    console.log(`[WEBHOOK] Synced subscription ${subscriptionId} after payment failure`)
                } catch (err) {
                    console.error(`[WEBHOOK_ERROR] Failed to sync after payment failure: ${err}`)
                }
            }
        }

        // 5. Product Created/Updated -> Sync to Database
        if (event.type === "product.created" || event.type === "product.updated") {
            const product = event.data.object as Stripe.Product

            console.log(`[WEBHOOK] Processing ${event.type} for product: ${product.name}`)
            console.log(`[WEBHOOK] Product Metadata:`, JSON.stringify(product.metadata, null, 2))

            // Get the default price for this product
            let priceAmount = 0
            let stripePriceId: string | null = null
            let isRecurring = false

            if (product.default_price) {
                const priceId = typeof product.default_price === 'string'
                    ? product.default_price
                    : product.default_price.id

                const price = await stripe.prices.retrieve(priceId)
                priceAmount = price.unit_amount ? price.unit_amount / 100 : 0
                stripePriceId = price.id
                isRecurring = !!price.recurring
            }

            // Extract metadata
            const category = product.metadata?.category || "misc"
            const type = isRecurring ? "subscription" : (product.metadata?.type || "one-time")
            const features = product.metadata?.features
                ? JSON.parse(product.metadata.features)
                : []
            const summary = product.metadata?.summary || product.description || ""
            const details = product.metadata?.details || product.description || ""
            const isActive = product.metadata?.isActive === "false" ? false : true

            console.log(`[WEBHOOK] Extracted - category: ${category}, type: ${type}, isActive: ${isActive}`)

            await prisma.product.upsert({
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

            console.log(`[WEBHOOK] Product ${event.type} SUCCESS: ${product.name}`)
            revalidatePath('/store')
            revalidateTag('products')
        }

    } catch (error: any) {
        console.error(`[WEBHOOK_HANDLER_ERROR] ${error.message}`)
        return new NextResponse(`Handler Error: ${error.message}`, { status: 500 })
    }

    return new NextResponse(null, { status: 200 })
}
