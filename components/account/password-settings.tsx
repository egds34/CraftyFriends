"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setUserPassword, toggleTwoFactor } from "@/app/account/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { KeyRound } from "lucide-react"
import { Switch } from "@/components/ui/switch"

import { TwoFactorSetupDialog } from "./two-factor-setup-dialog"
import { removeAuthenticatorApp } from "@/app/account/actions"

interface PasswordSettingsProps {
    hasPassword: boolean
    isTwoFactorEnabled: boolean
    hasAuthenticator: boolean
}

export function PasswordSettings({ hasPassword, isTwoFactorEnabled, hasAuthenticator }: PasswordSettingsProps) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [is2FA, setIs2FA] = useState(isTwoFactorEnabled)

    const handle2FAToggle = async (checked: boolean) => {
        setIs2FA(checked)
        const result = await toggleTwoFactor(checked)
        if (result?.error) {
            setIs2FA(!checked)
            setMessage({ type: 'error', text: result.error })
        }
    }

    const handleRemoveApp = async () => {
        if (!confirm("Are you sure you want to remove the authenticator app? You will fall back to email verification.")) return
        setLoading(true)
        const res = await removeAuthenticatorApp()
        if (res.error) {
            setMessage({ type: 'error', text: res.error })
        } else {
            setMessage({ type: 'success', text: "Authenticator app removed" })
        }
        setLoading(false)
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setMessage(null)

        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match" })
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: "Password must be at least 6 characters" })
            setLoading(false)
            return
        }

        const result = await setUserPassword(formData)

        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: "Password updated successfully" })
            setIsEditing(false)
        }
        setLoading(false)
    }

    if (!isEditing) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-primary" />
                        Security
                    </CardTitle>
                    <CardDescription>Manage your password and security settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Password</p>
                            <p className="text-sm text-muted-foreground">
                                {hasPassword ? "Password is set" : "No password set"}
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            {hasPassword ? "Change Password" : "Set Password"}
                        </Button>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="space-y-0.5">
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">
                                Secure your account with Email or App.
                            </p>
                        </div>
                        <Switch
                            checked={is2FA}
                            onCheckedChange={handle2FAToggle}
                        />
                    </div>

                    {is2FA && (
                        <div className="flex items-center justify-between pt-4 border-t border-dashed">
                            <div className="space-y-0.5">
                                <p className="font-medium text-sm">Authenticator App</p>
                                <p className="text-xs text-muted-foreground">
                                    {hasAuthenticator ? "App configured and active." : "Use an app (Google Auth, Authy) instead of email."}
                                </p>
                            </div>
                            {hasAuthenticator ? (
                                <Button variant="outline" size="sm" onClick={handleRemoveApp} disabled={loading} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200">
                                    Remove App
                                </Button>
                            ) : (
                                <TwoFactorSetupDialog onComplete={() => setMessage({ type: 'success', text: "App setup successful!" })} />
                            )}
                        </div>
                    )}

                    {message && (
                        <div className={`text-sm ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                            {message.text}
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {hasPassword ? "Change Password" : "Set Password"}
                </CardTitle>
                <CardDescription>
                    {hasPassword ? "Enter your new password below." : "Create a password to enable sign in with email."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            disabled={loading}
                            placeholder="******"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            disabled={loading}
                            placeholder="******"
                        />
                    </div>

                    {message && (
                        <div className={`text-sm ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button type="submit" disabled={loading} variant="premium">
                            {loading ? "Saving..." : "Save Password"}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} disabled={loading}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
