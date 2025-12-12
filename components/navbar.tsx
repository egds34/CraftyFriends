import Link from "next/link"
import Image from "next/image"
import { auth, signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { SideMenu } from "@/components/side-menu"
import { NavbarAuthButtons } from "@/components/navbar-auth"
import { UserNav } from "@/components/user-nav"

export default async function Navbar() {
    const session = await auth()

    return (
        <nav className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-50">
            <div className="w-full flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <SideMenu blueMapUrl={process.env.BLUEMAP_URL}>
                        <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <Image src="/images/logo.png" alt="Logo" width={32} height={32} className="rounded-full" />
                            <span>Crafty <span className="text-primary">Friends</span></span>
                        </Link>
                    </SideMenu>
                </div>

                <div className="flex items-center gap-4">
                    {session?.user ? (
                        <UserNav user={session.user} />
                    ) : (
                        <NavbarAuthButtons />
                    )}
                </div>
            </div>
        </nav>
    )
}
