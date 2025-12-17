
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const latest = await prisma.serverMetric.findFirst({
        orderBy: { timestamp: 'desc' }
    });
    console.log("Latest Metric (Raw):", latest);
}

check()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
