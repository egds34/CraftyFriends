import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: Request) {
    let priceId: string | undefined

    try {
        console.log("[CREATE_SUBSCRIPTION] Starting...")
        const session = await auth()
        console.log("[CREATE_SUBSCRIPTION] Session:", session?.user?.id)

        if (!session?.user?.id || !session?.user?.email) {
            console.log("[CREATE_SUBSCRIPTION] Unauthorized")
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        console.log("[CREATE_SUBSCRIPTION] Body:", body)
        priceId = body.priceId

        if (!priceId) {
            return new NextResponse("Price ID is required", { status: 400 })
        }

        // Resolve shorthand alias to env var
        if (priceId === 'premium') {
            priceId = process.env.STRIPE_PRICE_ID
        }

        if (!priceId) {
            return new NextResponse("Server configuration error: Missing Price ID", { status: 500 })
        }

        console.log("[CREATE_SUBSCRIPTION] Fetching user from DB...")
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                stripeCustomerId: true,
                email: true,
                name: true
            }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }
        console.log("[CREATE_SUBSCRIPTION] User found:", user.id)

        // FORCE NEW CUSTOMER FOR DEBUGGING
        // let stripeCustomerId = user.stripeCustomerId
        const newCustomer = await stripe.customers.create({
            email: user.email,
            name: user.name || undefined,
            metadata: {
                userId: user.id,
                debug: "forced_new"
            }
        })
        const stripeCustomerId = newCustomer.id
        console.log("[CREATE_SUBSCRIPTION] Created FRESH customer:", stripeCustomerId)

        // Create the subscription. Note: we don't need to check for existing active subs 
        // strictly here because Stripe handles upgrades/downgrades usually, 
        // but for simplicity we assume a new sub.
        const subscriptionOptions: Stripe.SubscriptionCreateParams = {
            customer: stripeCustomerId,
            items: [{ price: priceId }],
            expand: ['latest_invoice.payment_intent'],
            payment_behavior: 'default_incomplete',
            payment_settings: {
                save_default_payment_method: 'on_subscription',
                payment_method_types: ['card']
            },
            trial_period_days: 0,
            metadata: {
                userId: user.id
            }
        }

        console.log("[CREATE_SUBSCRIPTION] Options:", JSON.stringify(subscriptionOptions, null, 2))

        const subscription = await stripe.subscriptions.create(subscriptionOptions)

        // DETAILED DEBUGGING
        console.log("[CREATE_SUBSCRIPTION] Full subscription object:", JSON.stringify(subscription, null, 2))
        console.log("[CREATE_SUBSCRIPTION] Subscription status:", subscription.status)
        console.log("[CREATE_SUBSCRIPTION] Latest invoice type:", typeof subscription.latest_invoice)
        console.log("[CREATE_SUBSCRIPTION] Latest invoice value:", subscription.latest_invoice)

        if (typeof subscription.latest_invoice === 'object' && subscription.latest_invoice !== null) {
            console.log("[CREATE_SUBSCRIPTION] Invoice status:", subscription.latest_invoice.status)
            console.log("[CREATE_SUBSCRIPTION] Payment intent type:", typeof subscription.latest_invoice.payment_intent)
            console.log("[CREATE_SUBSCRIPTION] Payment intent value:", subscription.latest_invoice.payment_intent)
        }

        console.log("[CREATE_SUBSCRIPTION] Subscription created:", subscription.id)
        console.log("[CREATE_SUBSCRIPTION] Latest invoice:", typeof subscription.latest_invoice)
        console.log("[CREATE_SUBSCRIPTION] Payment intent:", typeof subscription.latest_invoice?.payment_intent)

        // Explicitly fetch the invoice if it's not expanded
        let clientSecret: string | null = null

        if (typeof subscription.latest_invoice === 'string') {
            console.log("[CREATE_SUBSCRIPTION] Invoice not expanded, fetching manually...")
            const invoice = await stripe.invoices.retrieve(subscription.latest_invoice, {
                expand: ['payment_intent']
            })
            // @ts-ignore
            clientSecret = invoice.payment_intent?.client_secret
        } else {
            // @ts-ignore
            clientSecret = subscription.latest_invoice?.payment_intent?.client_secret
        }

        console.log("[CREATE_SUBSCRIPTION] Client secret exists?", !!clientSecret)

        if (!clientSecret) {
            console.error("Stripe Error: Missing clientSecret in subscription response", subscription.id)
            return new NextResponse("Failed to generate payment intent", { status: 500 })
        }

        return NextResponse.json({
            subscriptionId: subscription.id,
            clientSecret
        })

    } catch (error: any) {
        console.error("[CREATE_SUBSCRIPTION] Error:", error)
        console.error("[CREATE_SUBSCRIPTION] Config:", {
            priceId,
            hasKey: !!process.env.STRIPE_SECRET_KEY,
            keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7)
        })
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
