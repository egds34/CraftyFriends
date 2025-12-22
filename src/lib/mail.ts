// This mock email service simulates sending emails by logging to the console.
// In production, replace this with Resend or NodeMailer.

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const sendTwoFactorTokenEmail = async (
    email: string,
    token: string
) => {
    // Integration point for Resend
    // await resend.emails.send({ ... })

    console.log("=================================================");
    console.log(`[MAIL] Sending 2FA Code to ${email}`);
    console.log(`[MAIL] Code: ${token}`);
    console.log("=================================================");
};

export const sendPasswordResetEmail = async (
    email: string,
    token: string,
) => {
    const resetLink = `${domain}/auth/new-password?token=${token}`

    console.log("=================================================");
    console.log(`[MAIL] Sending Password Reset Link to ${email}`);
    console.log(`[MAIL] Link: ${resetLink}`);
    console.log("=================================================");
};

export const sendVerificationEmail = async (
    email: string,
    token: string
) => {
    const confirmLink = `${domain}/auth/new-verification?token=${token}`;

    console.log("=================================================");
    console.log(`[MAIL] Sending Verification Link to ${email}`);
    console.log(`[MAIL] Link: ${confirmLink}`);
    console.log("=================================================");
};
