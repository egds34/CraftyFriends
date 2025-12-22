
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Loader2, Upload, Archive, RotateCcw, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { B2Image } from "@/lib/b2";
import { uploadB2Images, archiveB2Image, restoreB2Image, deleteB2ImageAction } from "@/app/actions/image-management";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ImageManagerProps {
    folder: string;
    activeImages: B2Image[];
    archivedImages: B2Image[];
    title: string;
    description: string;
}

export function ImageManager({
    folder,
    activeImages,
    archivedImages,
    title,
    description
}: ImageManagerProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Filter images so we don't show archived ones in active tab even if listed (though server should handle this mostly)
    // The props passed in should already be separated, but just in case.

    // -- Drag & Drop Handlers --
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await handleFiles(e.target.files);
        }
    };

    // -- Conflict Resolution State --
    const [conflictQueue, setConflictQueue] = useState<{ file: File, existingUrl: string }[]>([]);
    const [currentConflict, setCurrentConflict] = useState<{ file: File, existingUrl: string } | null>(null);
    const [renameValue, setRenameValue] = useState("");

    const processNextConflict = (queue: typeof conflictQueue) => {
        if (queue.length > 0) {
            const next = queue[0];
            setCurrentConflict(next);
            setRenameValue(next.file.name);
            setConflictQueue(queue.slice(1));
        } else {
            setCurrentConflict(null);
            router.refresh(); // Refresh after all processed
        }
    };

    const handleFiles = async (files: FileList) => {
        setUploading(true);
        try {
            const fileList = Array.from(files);
            const filenames = fileList.map(f => f.name);

            // 1. Check Conflicts
            const { checkImageConflicts } = await import("@/app/actions/image-management");
            const conflicts = await checkImageConflicts(folder, filenames);

            const safeFiles: File[] = [];
            const conflictingFiles: { file: File, existingUrl: string }[] = [];

            fileList.forEach(file => {
                if (conflicts.includes(file.name)) {
                    // Construct the existing URL based on our proxy convention: /api/images/proxy/{folder}/{filename}
                    const existingUrl = `/api/images/proxy/${folder}/${file.name}`;
                    conflictingFiles.push({ file, existingUrl });
                } else {
                    safeFiles.push(file);
                }
            });

            // 2. Upload Safe Files Immediately
            if (safeFiles.length > 0) {
                const formData = new FormData();
                safeFiles.forEach(file => formData.append("files", file));
                const result = await uploadB2Images(folder, formData);
                if (result.success) {
                    showNotification('success', `Uploaded ${safeFiles.length} images.`);
                } else {
                    showNotification('error', "Failed to upload some images.");
                }
            }

            // 3. Queue Conflicts
            if (conflictingFiles.length > 0) {
                setConflictQueue(conflictingFiles.slice(1));
                setCurrentConflict(conflictingFiles[0]);
                setRenameValue(conflictingFiles[0].file.name);
            } else {
                router.refresh();
            }

        } catch (error) {
            console.error("Client Upload Error:", error);
            showNotification('error', "Upload check failed.");
        } finally {
            setUploading(false);
        }
    };

    const resolveConflict = async (action: 'overwrite' | 'rename' | 'skip') => {
        if (!currentConflict) return;

        setUploading(true); // Show loading state on dialog

        try {
            if (action === 'overwrite') {
                const formData = new FormData();
                formData.append("files", currentConflict.file);
                await uploadB2Images(folder, formData);
                showNotification('success', `Overwritten ${currentConflict.file.name}`);
            } else if (action === 'rename') {
                if (!renameValue) return;
                // Create new file with new name
                const newFile = new File([currentConflict.file], renameValue, { type: currentConflict.file.type });

                // We should technically check conflict again, but for now let's assume user renamed to unique
                const formData = new FormData();
                formData.append("files", newFile);
                await uploadB2Images(folder, formData);
                showNotification('success', `Uploaded as ${renameValue}`);
            }
            // If skip, just do nothing

        } catch (e) {
            console.error(e);
            showNotification('error', "Failed to resolve conflict");
        } finally {
            setUploading(false);
            processNextConflict(conflictQueue);
        }
    };

    // -- Action Handlers --
    const handleArchive = (key: string) => {
        startTransition(async () => {
            const result = await archiveB2Image(key);
            if (result.success) {
                showNotification('success', 'Image archived');
            } else {
                showNotification('error', 'Failed to archive image');
            }
        });
    };

    const handleRestore = (key: string) => {
        startTransition(async () => {
            const result = await restoreB2Image(key);
            if (result.success) {
                showNotification('success', 'Image restored');
            } else {
                showNotification('error', 'Failed to restore image');
            }
        });
    };

    const handleDelete = async () => {
        if (!showDeleteDialog) return;

        const key = showDeleteDialog;
        setShowDeleteDialog(null);

        startTransition(async () => {
            const result = await deleteB2ImageAction(key);
            if (result.success) {
                showNotification('success', 'Image permanently deleted');
            } else {
                showNotification('error', 'Failed to delete image');
            }
        });
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const ImageGrid = ({ images, isArchiveTab }: { images: B2Image[], isArchiveTab?: boolean }) => {
        if (images.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                    <p>No images found in {isArchiveTab ? 'archive' : 'active list'}.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img) => (
                    <Card key={img.key} className="overflow-hidden group relative">
                        <div className="aspect-video relative bg-muted">
                            <Image
                                src={img.url}
                                alt={img.key}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                            />
                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {isArchiveTab ? (
                                    <>
                                        <Button size="sm" variant="outline" onClick={() => handleRestore(img.key)} disabled={isPending}>
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Restore
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => setShowDeleteDialog(img.key)} disabled={isPending}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => handleArchive(img.key)} disabled={isPending}>
                                        <Archive className="w-4 h-4 mr-2" />
                                        Archive
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="p-3 text-xs text-muted-foreground bg-card border-t flex justify-between items-center">
                            <span className="truncate max-w-[60%]" title={img.key.split('/').pop()}>{img.key.split('/').pop()}</span>
                            <span>{format(new Date(img.lastModified), 'MMM d, yyyy')}</span>
                        </div>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                    <p className="text-muted-foreground">{description}</p>
                </div>
            </div>

            {/* Notification Toast */}
            {notification && (
                <div className={cn(
                    "fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2",
                    notification.type === 'success' ? "bg-green-600 text-white" : "bg-red-600 text-white"
                )}>
                    {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {notification.message}
                </div>
            )}

            {/* Upload Area */}
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                    dragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                    uploading && !currentConflict ? "opacity-50 pointer-events-none" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center gap-2">
                    {uploading && !currentConflict ? (
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    ) : (
                        <Upload className="w-10 h-10 text-muted-foreground" />
                    )}
                    <h3 className="text-lg font-semibold">{uploading && !currentConflict ? "Uploading..." : "Drag & drop images here"}</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Or click the button below to select files. Supports multiple uploads.
                    </p>
                    <div className="mt-4">
                        <label htmlFor={`file-upload-${folder}`}>
                            <div className={cn(Button.displayName, "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer")}>
                                Select Files
                            </div>
                        </label>
                        <input
                            id={`file-upload-${folder}`}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileInput}
                            disabled={uploading}
                        />
                    </div>
                </div>
            </div>

            <Tabs defaultValue="active" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="active">Active ({activeImages.length})</TabsTrigger>
                    <TabsTrigger value="archived">Archived ({archivedImages.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                    <ImageGrid images={activeImages} />
                </TabsContent>

                <TabsContent value="archived" className="space-y-4">
                    <ImageGrid images={archivedImages} isArchiveTab />
                </TabsContent>
            </Tabs>

            {/* Conflict Resolution Dialog */}
            <Dialog open={!!currentConflict} onOpenChange={() => { }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>File Conflict: {currentConflict?.file.name}</DialogTitle>
                        <DialogDescription>
                            A file with this name already exists. Would you like to overwrite it or rename your upload?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-6 my-4">
                        {/* Existing Image */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Existing Image</h4>
                            <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                                {currentConflict && (
                                    <Image
                                        src={currentConflict.existingUrl}
                                        alt="Existing"
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                        </div>

                        {/* New Image Preview */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">New Upload</h4>
                            <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                                {currentConflict && (
                                    <Image
                                        src={URL.createObjectURL(currentConflict.file)}
                                        alt="New"
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rename New File:</label>
                            <input
                                type="text"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button variant="outline" onClick={() => resolveConflict('skip')} disabled={uploading}>
                            Skip
                        </Button>
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                            <Button variant="outline" onClick={() => resolveConflict('rename')} disabled={uploading || !renameValue}>
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Rename & Upload"}
                            </Button>
                            <Button variant="destructive" onClick={() => resolveConflict('overwrite')} disabled={uploading}>
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Overwrite"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!showDeleteDialog} onOpenChange={(open) => !open && setShowDeleteDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Permanently?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the image from your storage bucket.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete Forever</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
