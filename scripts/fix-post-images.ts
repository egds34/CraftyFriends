
import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({
    // @ts-ignore
    accelerateUrl: process.env.DATABASE_URL
})

async function main() {
    console.log("Fixing post images...")

    // 1. Fix Winter Wonderland
    const winterResult = await prisma.post.updateMany({
        where: {
            image: {
                contains: "photo-1547402830-1a74d1a019d3"
            }
        },
        data: {
            image: "https://images.unsplash.com/photo-1483664852095-d6cc6870705d?q=80&w=1000&auto=format&fit=crop"
        }
    })
    console.log(`Updated ${winterResult.count} winter posts.`)

    // 2. Fix Community Showcase
    const communityResult = await prisma.post.updateMany({
        where: {
            image: {
                contains: "photo-1627798358248-c8375ae54443"
            }
        },
        data: {
            image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=1000&auto=format&fit=crop"
        }
    })
    console.log(`Updated ${communityResult.count} community posts.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
