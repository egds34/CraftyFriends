
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getB2Images } from "@/app/actions/image-management";
import { ImageManager } from "@/components/admin/image-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function AdminCMSPage() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        redirect("/");
    }

    // Parallel fetch
    const [bannersResult, featuredResult, archiveBannerResult, archiveFeaturedResult] = await Promise.all([
        getB2Images("banner"),
        getB2Images("featured"),
        getB2Images("archive/banner"),
        getB2Images("archive/featured")
    ]);

    const activeBanners = bannersResult.success ? bannersResult.images : [];
    const archivedBanners = archiveBannerResult.success ? archiveBannerResult.images : [];

    const activeFeatured = featuredResult.success ? featuredResult.images : [];
    const archivedFeatured = archiveFeaturedResult.success ? archiveFeaturedResult.images : [];

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-muted">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-heading font-black tracking-tight">
                            Content Management
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Manage dynamic images for the landing page.
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="banners" className="space-y-8">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                        <TabsTrigger
                            value="banners"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1"
                        >
                            Hero Banners
                        </TabsTrigger>
                        <TabsTrigger
                            value="featured"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1"
                        >
                            Featured Builds
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="banners">
                        <ImageManager
                            folder="banner"
                            title="Hero Banners"
                            description="Images displayed in the main hero slider on the homepage. Use high-quality 1920x1080 images."
                            activeImages={activeBanners}
                            archivedImages={archivedBanners}
                        />
                    </TabsContent>

                    <TabsContent value="featured">
                        <ImageManager
                            folder="featured"
                            title="Featured Builds"
                            description="Community builds displayed in the 'Featured Builds' gallery. Use consistent aspect ratios."
                            activeImages={activeFeatured}
                            archivedImages={archivedFeatured}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
