
import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({
    // @ts-ignore
    accelerateUrl: process.env.DATABASE_URL
})

async function main() {
    console.log("Checking posts...")
    const count = await prisma.post.count()
    console.log(`Total posts: ${count}`)

    if (count > 0) {
        const posts = await prisma.post.findMany({
            select: { id: true, image: true }
        })
        console.log("Sample post images:", posts.slice(0, 3))
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
