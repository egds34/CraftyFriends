import Stripe from "stripe"

const apiKey = process.env.STRIPE_SECRET_KEY

if (!apiKey) {
    console.error("STRIPE_SECRET_KEY is missing in lib/stripe.ts")
} else {
    // console.log("Initializing Stripe with key starting:", apiKey.substring(0, 7))
}

export const stripe = new Stripe(apiKey || "sk_test_dummy", {
    apiVersion: '2025-11-17.clover',
    typescript: true,
})
