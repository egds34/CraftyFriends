import { Product } from "@/types/store"

export const mockProducts: Product[] = [
    // Memberships
    {
        id: "mem_basic",
        name: "Member",
        description: "The classic Minecraft experience with basic access.",
        price: 0,
        category: "Memberships",
        type: "subscription",
        features: ["Server Access", "Discord Role", "Basic Claims"]
    },
    {
        id: "mem_premium",
        name: "Premium",
        description: "Unlock the full potential with gold chat, cosmetics, and more.",
        price: 9.99,
        category: "Memberships",
        type: "subscription",
        priceId: "premium",
        features: ["Gold Name", "30+ Cosmetics", "Priority Queue", "HD Skins"]
    },
    {
        id: "mem_elite",
        name: "Elite",
        description: "Status and power. Private channels and custom colors.",
        price: 19.99,
        category: "Memberships",
        type: "subscription",
        features: ["All Premium Features", "Private Channel", "Custom Chat Color"]
    },

    // Boosts
    {
        id: "boost_xp_1h",
        name: "1 Hour XP Boost",
        description: "Double XP gain for yourself for 1 hour.",
        price: 2.99,
        category: "Boosts",
        type: "one-time"
    },
    {
        id: "boost_fly_24h",
        name: "24h Fly Pass",
        description: "Enable flight in the lobby and survival spawn for 24 hours.",
        price: 4.99,
        category: "Boosts",
        type: "one-time"
    },
    {
        id: "boost_drop_party",
        name: "Drop Party Summon",
        description: "Trigger a drop party at spawn for everyone!",
        price: 14.99,
        category: "Boosts",
        type: "one-time"
    },

    // Chat
    {
        id: "chat_color_pack",
        name: "Rainbow Chat Pack",
        description: "Unlock 5 exclusive chat colors.",
        price: 4.99,
        category: "Chat",
        type: "one-time"
    },
    {
        id: "chat_tag_legend",
        name: "[LEGEND] Tag",
        description: "Exclusive chat prefix title.",
        price: 9.99,
        category: "Chat",
        type: "one-time"
    },
    {
        id: "chat_emoji_pack",
        name: "Custom Emojis",
        description: "Access to server-custom emojis in chat.",
        price: 1.99,
        category: "Chat",
        type: "one-time"
    },

    // Misc
    {
        id: "misc_pet_dragon",
        name: "Mini Dragon Pet",
        description: "A cute little dragon that follows you around.",
        price: 7.99,
        category: "Misc",
        type: "one-time"
    },
    {
        id: "misc_plot_extension",
        name: "+1 Plot Extension",
        description: "Add an extra claimable plot to your allowance.",
        price: 5.99,
        category: "Misc",
        type: "one-time"
    },

    // Donate
    {
        id: "don_small",
        name: "Small Tip",
        description: "Buy the devs a coffee.",
        price: 5.00,
        category: "Donate",
        type: "one-time"
    },
    {
        id: "don_large",
        name: "Large Donation",
        description: "Support server hosting costs directly.",
        price: 25.00,
        category: "Donate",
        type: "one-time"
    }
]
