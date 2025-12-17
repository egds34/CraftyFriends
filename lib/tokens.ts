import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getVerificationTokenByEmail } from "@/data/verification-token";
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";

export const generateTwoFactorToken = async (email: string) => {
    const token = crypto.randomInt(100_000, 1_000_000).toString();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

    const existingToken = await getTwoFactorTokenByEmail(email);

    if (existingToken) {
        await prisma.twoFactorToken.delete({
            where: {
                id: existingToken.id,
            },
        });
    }

    const twoFactorToken = await prisma.twoFactorToken.create({
        data: {
            email,
            token,
            expires,
        },
    });

    return twoFactorToken;
};

export const generatePasswordResetToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000);

    const existingToken = await getPasswordResetTokenByEmail(email);

    if (existingToken) {
        await prisma.passwordResetToken.delete({
            where: { id: existingToken.id }
        });
    }

    const passwordResetToken = await prisma.passwordResetToken.create({
        data: {
            email,
            token,
            expires
        }
    });

    return passwordResetToken;
}

export const generateVerificationToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 Hour

    const existingToken = await getVerificationTokenByEmail(email);

    if (existingToken) {
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: existingToken.identifier,
                    token: existingToken.token
                }
            }
        });
    }

    // Since VerificationToken usually users @@unique([identifier, token]), 
    // and Prisma Auth Adapter standard is identifier = email.

    // However, my custom logic might want to use a model ID.
    // The standard default VerificationToken model uses composite key and no ID if valid NextAuth adapter...
    // But I see in my schema:
    /*
    model VerificationToken {
        identifier String
        token      String   @unique
        expires    DateTime
        
        @@unique([identifier, token])
    }
    */
    // It does not have an ID. So I must deleteMany or delete by composite.

    // Wait, the delete above `where: { identifier_token... }` relies on the compound unique constraint name.
    // Default name is likely `identifier_token`.

    const verificationToken = await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires
        }
    });

    return verificationToken;
}
