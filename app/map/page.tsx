import { redirect } from "next/navigation";

export default function MapPage() {
    const mapUrl = process.env.BLUEMAP_URL;

    if (!mapUrl) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Map Unavailable</h1>
                    <p className="text-muted-foreground">The world map is not currently configured.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-black pt-16">
            <iframe
                src={mapUrl}
                className="w-full h-full border-none"
                title="World Map"
                allow="geolocation"
            />
        </div>
    );
}
