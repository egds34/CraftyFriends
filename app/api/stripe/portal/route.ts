import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

export async function POST() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { stripeCustomerId: true }
        })

        if (!user || !user.stripeCustomerId) {
            return new NextResponse("User or Customer not found", { status: 404 })
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${baseUrl}/dashboard`,
        })

        return NextResponse.json({ url: portalSession.url })
    } catch (error) {
        console.error("[STRIPE_PORTAL]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
