"use strict";
import { motion } from "framer-motion";
import { ServerUpdate } from "@/lib/updates-data";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, ArrowRight, User } from "lucide-react";

interface UpdatesFeedProps {
    updates: ServerUpdate[];
}

export function UpdatesFeed({ updates }: UpdatesFeedProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-12">
            {updates.map((update, idx) => (
                <motion.div
                    key={update.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    className="group"
                >
                    <Link href={`/updates/${update.id}`} className="block relative">
                        {/* Image Container */}
                        <div className="relative h-[300px] md:h-[400px] w-full rounded-3xl overflow-hidden mb-6 border border-white/5 bg-muted/10">
                            <Image
                                src={update.image}
                                alt={update.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Overlay Badge */}
                            <div className="absolute top-4 left-4 md:top-6 md:left-6">
                                <Badge className="bg-background/90 backdrop-blur text-foreground border-white/10 text-sm py-1.5 px-4 shadow-lg">
                                    {update.category.replace('-', ' ')}
                                </Badge>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-2 md:px-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1.5">
                                    <CalendarDays className="w-4 h-4 text-primary" />
                                    <span>{new Date(update.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-white/20" />
                                <div className="flex items-center gap-1.5">
                                    <User className="w-4 h-4 text-primary" />
                                    <span>{update.author}</span>
                                </div>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 group-hover:text-primary transition-colors">
                                {update.title}
                            </h2>

                            <p className="text-lg text-muted-foreground mb-6 line-clamp-2 md:line-clamp-3 leading-relaxed">
                                {update.excerpt}
                            </p>

                            <div className="flex items-center text-primary font-medium group/btn">
                                <span className="mr-2">Read Full Update</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
