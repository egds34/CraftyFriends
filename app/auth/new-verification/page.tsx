"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewVerificationPage() {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const searchParams = useSearchParams();
    const router = useRouter();

    const token = searchParams.get("token");

    const onSubmit = useCallback(async () => {
        if (success || error) return;

        if (!token) {
            setError("Missing token!");
            return;
        }

        try {
            const result = await signIn("credentials", {
                token,
                redirect: false,
            });

            if (result?.error) {
                setError("Verification failed or expired token.");
            } else if (result?.ok) {
                setSuccess("Email verified! Redirecting...");
                router.push("/account");
            }
        } catch {
            setError("Something went wrong!");
        }
    }, [token, success, error, router]);

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-[400px] shadow-md">
                <CardHeader>
                    <CardTitle className="text-center">Confirming your verification</CardTitle>
                    <CardDescription className="text-center">
                        Please wait while we verify your email.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4">
                    {!success && !error && (
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    )}

                    {success && (
                        <div className="p-3 bg-emerald-500/15 text-emerald-500 rounded-md text-sm border border-emerald-500/20 text-center w-full">
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/15 text-red-500 rounded-md text-sm border border-red-500/20 text-center w-full">
                            {error}
                        </div>
                    )}

                    <Link href="/auth/signin" className="text-sm text-center text-muted-foreground hover:text-primary transition-colors">
                        Back to login
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
};
