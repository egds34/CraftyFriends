
import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({
    // @ts-ignore
    accelerateUrl: process.env.DATABASE_URL
})

async function checkDb() {
    console.log("Checking DB for players...");

    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: 'Parrot', mode: 'insensitive' } },
                    { minecraftUsername: { contains: 'Parrot', mode: 'insensitive' } },
                    { name: { contains: 'Birdy', mode: 'insensitive' } },
                    { minecraftUsername: { contains: 'Birdy', mode: 'insensitive' } },
                ]
            }
        });

        console.log("Users found:", users.map(u => ({ id: u.id, name: u.name, mc: u.minecraftUsername })));

        const stats = await prisma.playerStatistic.findMany({
            where: {
                username: { contains: 'Parrot', mode: 'insensitive' }
            },
            select: { username: true },
            distinct: ['username']
        });

        console.log("Stats players found:", stats);
    } catch (e) {
        console.error("Query error:", String(e));
    } finally {
        await prisma.$disconnect();
    }
}

checkDb();
