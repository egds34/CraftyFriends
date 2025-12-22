import { getPlayerDetails } from "@/app/leaderboard/actions";
import { SkinViewer } from "@/components/player/skin-viewer";
import { AchievementBadge } from "@/components/achievements/achievement-badge";
import { formatDistanceToNow } from "date-fns";
import { Trophy, Activity, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

interface ProfilePageProps {
    params: Promise<{
        username: string;
    }>;
    searchParams: Promise<{
        q?: string;
    }>;
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
    const { username } = await params;
    const { q } = await searchParams;
    const profile = await getPlayerDetails(username);

    if (!profile) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-black text-foreground pt-24 pb-20 relative">
            {/* Background ambiance */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-indigo-900/10 to-transparent opacity-50" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                <Link
                    href={q ? `/search?q=${encodeURIComponent(q)}` : "/search"}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Search
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: 3D View & Basic Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-md relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10">
                                <div className="h-[400px] w-full mb-8">
                                    <SkinViewer
                                        username={profile.username}
                                        className="h-full w-full"
                                        animation="idle"
                                        zoom={1.5}
                                        offsetY={0}
                                        rotation={0}
                                        headOnly={false}
                                        mouseTracking={true}
                                    />
                                </div>

                                <div className="text-center space-y-2">
                                    <h1 className="text-4xl font-black tracking-tight">{profile.username}</h1>
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm uppercase tracking-wider">
                                        <Activity className="w-4 h-4 text-emerald-500" />
                                        Last seen {formatDistanceToNow(new Date(profile.lastSeen), { addSuffix: true })}
                                    </div>
                                    <div className="pt-4">
                                        <Badge variant="secondary" className="px-4 py-1.5 text-sm font-bold bg-white/10">
                                            {(profile.playTimeSeconds / 3600).toFixed(1)} Hours Explored
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats & Advancements */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {profile.keyStats.map((stat, i) => (
                                <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-sm">
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-3xl font-black text-primary">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Advancements Section */}
                        <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-md">
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <Trophy className="w-8 h-8 text-yellow-500" />
                                Recent Achievements
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile.recentAdvancements.length > 0 ? (
                                    profile.recentAdvancements.map((adv) => (
                                        <div key={adv.id} className="flex gap-4 items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="shrink-0">
                                                <AchievementBadge
                                                    name={adv.title}
                                                    icon={adv.icon || "minecraft:grass_block"}
                                                    frameType={adv.description?.includes("Challenge") ? "challenge" : adv.description?.includes("Goal") ? "goal" : "task"}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-foreground truncate">{adv.title}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-1">{adv.description}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter opacity-50">
                                                    Unlocked {formatDistanceToNow(new Date(adv.date), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-12 text-center text-muted-foreground border border-dashed border-white/10 rounded-2xl">
                                        This player hasn't unlocked any recent achievements.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
