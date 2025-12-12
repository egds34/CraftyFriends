import Navbar from "@/components/navbar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 bg-muted/20">
                <div className="container mx-auto py-10 px-4">
                    {children}
                </div>
            </div>
        </div>
    )
}
