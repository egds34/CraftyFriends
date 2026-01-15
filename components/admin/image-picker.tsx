"use client";

import { useState, useEffect } from "react";
import { getImages, ImageFolder } from "@/app/actions/upload-image";
import { B2Image } from "@/lib/s3-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImagePickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (url: string) => void;
    folder: ImageFolder;
}

export function ImagePicker({ open, onOpenChange, onSelect, folder }: ImagePickerProps) {
    const [images, setImages] = useState<B2Image[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open) {
            setLoading(true);
            getImages(folder).then((res) => {
                if (res.success && res.data) {
                    setImages(res.data);
                }
                setLoading(false);
            });
        }
    }, [open, folder]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Image</DialogTitle>
                </DialogHeader>

                <div className="flex-1 min-h-0 bg-muted/20 rounded-lg border">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : images.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground p-6 text-center">
                            No images found in {folder}. Go to Admin &gt; Image Manager to upload some.
                        </div>
                    ) : (
                        <ScrollArea className="h-full p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {images.map((img) => (
                                    <button
                                        key={img.key}
                                        className="relative aspect-video bg-muted rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary focus:outline-none group text-left"
                                        onClick={() => {
                                            onSelect(img.url);
                                            onOpenChange(false);
                                        }}
                                    >
                                        <Image
                                            src={img.url}
                                            alt={img.key}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[10px] text-white truncate font-mono">
                                                {img.key.split("/").pop()}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
