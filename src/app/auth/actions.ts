"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function signInWithCredentials(formData: FormData) {
    try {
        await signIn("credentials", formData)
    } catch (error) {
        const errorString = String(error);

        // Debugging: Write error to file to inspect structure
        const fs = require('fs');
        try {
            fs.writeFileSync('/home/christy/.gemini/antigravity/scratch/CraftyFriends/login_error_log.json', JSON.stringify({
                message: (error as Error).message,
                name: (error as Error).name,
                code: (error as any).code,
                stack: (error as Error).stack,
                cause: (error as any).cause,
                fullString: errorString,
                obj: error
            }, null, 2));
        } catch (e) {
            console.error("Failed to write log", e);
        }

        console.log("LOGIN ERROR STRING:", errorString);

        console.log("LOGIN ERROR STRING:", errorString);

        // Helper to check object recursively for 2FA signal
        const checkErrorFor2FA = (err: any): "APP" | "EMAIL" | null => {
            if (!err) return null;
            const s = String(err);
            if (s.includes("2FA_REQUIRED_APP")) return "APP";
            if (s.includes("2FA_REQUIRED_EMAIL")) return "EMAIL";

            // Fallback for older errors or just generic 2FA trigger
            if (s.includes("2FA_REQUIRED") || s.includes("TwoFactorRequired")) return "EMAIL"; // Default to email if unknown

            if (err.cause) return checkErrorFor2FA(err.cause);
            return null;
        };

        const twoFactorType = checkErrorFor2FA(error);

        console.log("Is 2FA Error?", twoFactorType);

        if (twoFactorType) {
            console.log("Caught 2FA error, returning flag:", twoFactorType);
            return { error: "2FA", twoFactorType }
        }

        // Log full structure for debugging if we miss it again
        if (errorString.includes("CallbackRouteError") || errorString.includes("CredentialsSignin")) {
            console.log("FULL ERROR OBJ:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        }

        throw error
    }
}

export async function signInWithGoogle() {
    await signIn("google")
}

export async function signInWithGithub() {
    await signIn("github")
}

import { generateTwoFactorToken } from "@/lib/tokens"
import { sendTwoFactorTokenEmail } from "@/lib/mail"
import { prisma } from "@/lib/prisma"

export async function requestTwoFactorEmail(email: string) {
    if (!email) return { error: "Email required" }

    // Security: Check if user exists and has email verified
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.emailVerified) {
        return { error: "User not found" }
    }

    const twoFactorToken = await generateTwoFactorToken(email);
    await sendTwoFactorTokenEmail(
        twoFactorToken.email,
        twoFactorToken.token
    );

    return { success: true }
}
