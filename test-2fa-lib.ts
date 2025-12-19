
import { generateTwoFactorSecret, verifyTwoFactorToken } from "./lib/two-factor";

console.log("Testing two-factor lib...");

try {
    const { secret, otpauth } = generateTwoFactorSecret("test@example.com");
    console.log("Secret generated:", secret);
    console.log("OTP Auth:", otpauth);

    const isValid = verifyTwoFactorToken("123456", secret);
    console.log("Verification (should be false):", isValid);

    console.log("Success!");
} catch (error) {
    console.error("Error in two-factor lib:", error);
}
