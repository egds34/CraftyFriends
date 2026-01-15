"use client";

import { useState, useEffect, useCallback } from "react";
import { getImages, uploadImageAction, deleteImageAction, ImageFolder } from "@/app/actions/upload-image";
import { B2Image } from "@/lib/s3-client"; // We might need to export this type or redefine it
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Trash2, Copy, Image as ImageIcon, Check, RefreshCw } from "lucide-react";
import Image from "next/image";

type ImageManagerProps = {
    folder: ImageFolder;
    title: string;
    description?: string;
};

export function ImageManager({ folder, title, description }: ImageManagerProps) {
    const [images, setImages] = useState<B2Image[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const loadImages = useCallback(async () => {
        setLoading(true);
        const res = await getImages(folder);
        if (res.success && res.data) {
            setImages(res.data);
        }
        setLoading(false);
    }, [folder]);

    useEffect(() => {
        loadImages();
    }, [loadImages]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert("File is too large. Maximum size is 10MB.");
                e.target.value = ""; // Clear input
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
            setDuplicateWarning(null);
        }
    };

    const handleUpload = async (overwrite = false) => {
        if (!selectedFile) return;
        setUploading(true);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            // timeout promise
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Upload timed out (30s). Check connection or file size.")), 30000)
            );

            // Race upload against timeout
            const res = await Promise.race([
                uploadImageAction(formData, folder, overwrite),
                timeout
            ]) as any;

            if (res.success) {
                setUploadOpen(false);
                setSelectedFile(null);
                setDuplicateWarning(null);
                loadImages();
            } else if (res.code === "EXISTS") {
                setDuplicateWarning(res.existingKey || "File exists");
            } else {
                alert(res.error || "Upload failed");
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            alert(error.message || "An unexpected error occurred");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (key: string) => {
        const isBanner = folder === "banner"; // Archive banners
        const res = await deleteImageAction(key, isBanner);
        if (res.success) {
            setDeleteConfirm(null);
            loadImages();
        } else {
            alert("Failed to delete");
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={loadImages} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                    <Button onClick={() => setUploadOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12 text-muted-foreground/50">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-xl bg-card/50">
                    <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                    <p>No images found in this folder.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {images.map((img) => (
                        <div key={img.key} className="group relative aspect-video bg-muted/50 rounded-lg overflow-hidden border hover:border-primary/50 transition-all">
                            {/* Image Preview */}
                            <div className="absolute inset-0">
                                <Image
                                    src={img.url}
                                    alt={img.key}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <p className="text-xs text-white/90 font-mono truncate mb-2" title={img.key.split('/').pop()}>
                                    {img.key.split('/').pop()}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 flex-1 text-xs"
                                        onClick={() => copyToClipboard(img.url)}
                                    >
                                        {copiedUrl === img.url ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                        {copiedUrl === img.url ? "Copied" : "Copy URL"}
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="h-8 w-8"
                                        onClick={() => setDeleteConfirm(img.key)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogContent onInteractOutside={(e) => uploading && e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Upload to {title}</DialogTitle>
                        <DialogDescription>
                            Upload a new image to the <strong>{folder}</strong> folder.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="picture">Image</Label>
                            <Input id="picture" type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading} />
                        </div>

                        {duplicateWarning && (
                            <div className="bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 p-3 rounded-md text-sm">
                                <p className="font-semibold mb-1">File already exists!</p>
                                <p>A file with this name already exists in this folder. Would you like to overwrite it?</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" disabled={uploading} onClick={() => {
                            setUploadOpen(false);
                            setSelectedFile(null);
                            setDuplicateWarning(null);
                        }}>Cancel</Button>

                        {duplicateWarning ? (
                            <Button onClick={() => handleUpload(true)} disabled={uploading} variant="destructive">
                                {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Overwrite
                            </Button>
                        ) : (
                            <Button onClick={() => handleUpload(false)} disabled={!selectedFile || uploading}>
                                {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Upload
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Image?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this image?
                            {folder === "banner" && " It will be moved to the archive."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
