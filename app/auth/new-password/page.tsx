"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { newPassword } from "@/lib/actions";
import { PasswordStrengthChecker } from "@/components/ui/password-strength-checker";
import { passwordSchema } from "@/lib/password-validation";

const NewPasswordSchema = z.object({
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function NewPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver: zodResolver(NewPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            newPassword(values, token)
                .then((data) => {
                    setError(data?.error);
                    setSuccess(data?.success);
                });
        });
    };

    const passwordValue = form.watch("password");
    const confirmPasswordValue = form.watch("confirmPassword");

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-[400px] shadow-md">
                <CardHeader>
                    <CardTitle className="text-center">Enter a new password</CardTitle>
                    <CardDescription className="text-center">
                        Please enter a new password for your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isPending}
                                                placeholder="******"
                                                type="password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isPending}
                                                placeholder="******"
                                                type="password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        <AnimatePresence>
                                            {passwordValue && confirmPasswordValue && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="h-5 flex items-center">
                                                        <AnimatePresence mode="wait">
                                                            <motion.p
                                                                key={passwordValue === confirmPasswordValue ? "match" : "no-match"}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                transition={{ duration: 0.15 }}
                                                                className={`text-xs flex items-center gap-1 ${passwordValue === confirmPasswordValue
                                                                    ? "text-green-600 dark:text-green-400"
                                                                    : "text-red-500"
                                                                    }`}
                                                            >
                                                                {passwordValue === confirmPasswordValue ? (
                                                                    <>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                                        Passwords match
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                                        Passwords don't match
                                                                    </>
                                                                )}
                                                            </motion.p>
                                                        </AnimatePresence>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </FormItem>
                                )}
                            />

                            <PasswordStrengthChecker password={passwordValue} />
                            {error && (
                                <div className="p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive bg-destructive/15">
                                    <p>{error}</p>
                                </div>
                            )}
                            {success && (
                                <div className="p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500 bg-emerald-500/15">
                                    <p>{success}</p>
                                </div>
                            )}
                            <Button
                                disabled={isPending}
                                type="submit"
                                className="w-full"
                            >
                                Reset Password
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center">
                        <Link href="/?signin=true" className="text-sm text-muted-foreground hover:text-primary">
                            Back to login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
