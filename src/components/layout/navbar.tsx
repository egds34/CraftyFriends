import { auth } from "@/auth"
import { NavbarClient } from "@/components/layout/navbar-client"

export default async function Navbar() {
    const session = await auth()

    return (
        <NavbarClient
            sessionUser={session?.user}
            blueMapUrl={process.env.BLUEMAP_URL}
        />
    )
}
