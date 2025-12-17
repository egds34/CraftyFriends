import { authenticator } from "otplib";

export function generateTwoFactorSecret(email: string) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(email, "CraftyFriends", secret);
    return { secret, otpauth };
}

export function verifyTwoFactorToken(token: string, secret: string) {
    return authenticator.verify({ token, secret });
}
