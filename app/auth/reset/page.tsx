"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

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
import { reset } from "@/lib/actions";

const ResetSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
});

export default function ResetPage() {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof ResetSchema>>({
        resolver: zodResolver(ResetSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = (values: z.infer<typeof ResetSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            reset(values)
                .then((data) => {
                    setError(data?.error);
                    setSuccess(data?.success);
                });
        });
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-[400px] shadow-md">
                <CardHeader>
                    <CardTitle className="text-center">Forgot your password?</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to reset it.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isPending}
                                                placeholder="john.doe@example.com"
                                                type="email"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                Send reset email
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
