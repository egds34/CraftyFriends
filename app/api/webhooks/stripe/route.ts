import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
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

    try {
        // 1. Checkout Completed -> Grant Premium
        if (event.type === "checkout.session.completed") {
            const subscriptionId = typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id

            if (!session?.metadata?.userId || !subscriptionId) {
                console.error("[WEBHOOK_ERROR] Missing userId or subscriptionId in session")
                return new NextResponse("Missing metadata", { status: 400 })
            }

            console.log(`[WEBHOOK] Checkout completed for ${session.metadata.userId}`)

            // Fetch full subscription for dates
            // Fetch full subscription for dates
            console.log(`[WEBHOOK] Retrieving subscription ${subscriptionId}...`)
            const sub = await stripe.subscriptions.retrieve(subscriptionId)

            // Safe Date Parsing
            const rawPeriodEnd = (sub as any).current_period_end
            console.log(`[WEBHOOK] Raw Period End: ${rawPeriodEnd}`)

            const expiryDate = rawPeriodEnd
                ? new Date(rawPeriodEnd * 1000)
                : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days fallback if missing

            // Upsert Subscription Record
            console.log(`[WEBHOOK] Upserting subscription record...`)
            await prisma.subscription.upsert({
                where: { id: session.metadata.userId }, // One sub per user enforced by 1:1 relation
                create: {
                    id: session.metadata.userId,
                    transactionId: subscriptionId,
                    currentPeriodEnd: expiryDate,
                },
                update: {
                    transactionId: subscriptionId,
                    currentPeriodEnd: expiryDate,
                }
            })

            // Grant Role
            console.log(`[WEBHOOK] Updating user role...`)
            await prisma.user.update({
                where: { id: session.metadata.userId },
                data: {
                    role: 'PREMIUM',
                    stripeCustomerId: session.customer as string
                }
            })
            console.log(`[WEBHOOK] Role updated to PREMIUM for ${session.metadata.userId}`)
        }

        // 2. Subscription Updated -> Update Dates / Status
        if (event.type === "customer.subscription.updated") {
            // Find the user by the subscription ID (transactionId)
            const dbSub = await prisma.subscription.findUnique({
                where: { transactionId: subscription.id }
            })

            if (dbSub) {
                await prisma.subscription.update({
                    where: { transactionId: subscription.id },
                    data: {
                        // @ts-ignore
                        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                    }
                })
                console.log(`[WEBHOOK] Updated expiry for sub ${subscription.id}`)
            }
        }

        // 3. Subscription Deleted -> Revoke Access
        if (event.type === "customer.subscription.deleted") {
            const dbSub = await prisma.subscription.findUnique({
                where: { transactionId: subscription.id }
            })

            if (dbSub) {
                await prisma.user.update({
                    where: { id: dbSub.id }, // ID matches User ID
                    data: { role: 'BASIC' }
                })

                // Remove the subscription record to allow re-subscribing cleanly
                await prisma.subscription.delete({
                    where: { transactionId: subscription.id }
                })
                console.log(`[WEBHOOK] Revoked PREMIUM from user ${dbSub.id}`)
            }
        }

    } catch (error: any) {
        console.error(`[WEBHOOK_HANDLER_ERROR] ${error.message}`)
        return new NextResponse(`Handler Error: ${error.message}`, { status: 500 })
    }

    return new NextResponse(null, { status: 200 })
}
