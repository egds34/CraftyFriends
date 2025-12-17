import { auth } from "@/auth"
import { StoreClient } from "@/components/store-client"

export default async function StorePage() {
    const session = await auth()

    return (
        <>
            <StoreClient user={session?.user} />
        </>
    )
}
