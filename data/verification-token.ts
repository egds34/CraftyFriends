import { prisma } from "@/lib/prisma";

export const getVerificationTokenByToken = async (
    token: string
) => {
    try {
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token }
        });

        return verificationToken;
    } catch {
        return null;
    }
}

export const getVerificationTokenByEmail = async (
    email: string
) => {
    try {
        // Since email is identifier
        // But verificationToken doesn't have email field, it has 'identifier'.
        // And it's not unique on identifier alone. So we findFirst?
        const verificationToken = await prisma.verificationToken.findFirst({
            where: { identifier: email }
        });

        return verificationToken;
    } catch {
        return null;
    }
}
