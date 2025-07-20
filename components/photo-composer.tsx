"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Share2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PhotoComposerProps {
    photos: string[];
    templateId: string;
    subTemplateId: string;
    templateImage?: string;
    onCompositeReady: (compositeDataUrl: string) => void;
}

export function PhotoComposer({
    photos,
    templateId,
    subTemplateId,
    templateImage,
    onCompositeReady,
}: PhotoComposerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [compositeImage, setCompositeImage] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);

    const generateComposite = async () => {
        if (!canvasRef.current) return;

        setIsGenerating(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas dimensions to match template image aspect ratio but with lower resolution
        let stripWidth = 350;
        let stripHeight = 1200;
        if (templateId.includes("1x3") || templateId.includes("1x4")) {
            // Original: 2210x6250, aspect ≈ 0.3536
            stripWidth = 340;
            stripHeight = Math.round(stripWidth * (6250 / 2210)); // ≈ 1132
        } else if (templateId.includes("1x2")) {
            // Original: 350x600, aspect ≈ 0.583
            stripWidth = 350;
            stripHeight = Math.round(stripWidth * (600 / 350)); // ≈ 600
        } else {
            // Default aspect
            stripWidth = 350;
            stripHeight = 300;
        }

        canvas.width = stripWidth;
        canvas.height = stripHeight;

        // Draw template image as background if provided
        let templateImageData: ImageData | null = null;
        if (templateImage) {
            const templateImg = new window.Image();
            templateImg.crossOrigin = "anonymous";
            await new Promise((resolve) => {
                templateImg.onload = () => {
                    ctx.drawImage(templateImg, 0, 0, stripWidth, stripHeight);
                    // Save template image data for chroma key
                    templateImageData = ctx.getImageData(
                        0,
                        0,
                        stripWidth,
                        stripHeight
                    );
                    // Fill green boxes with gray as loading placeholder
                    if (photos.length === 0 || photos[0] === "") {
                        const tData = templateImageData.data;
                        // Find all green box bounding rectangles
                        let boxes = [];
                        let visited = new Uint8Array(stripWidth * stripHeight);
                        for (let y = 0; y < stripHeight; y++) {
                            for (let x = 0; x < stripWidth; x++) {
                                const idx = y * stripWidth + x;
                                if (visited[idx]) continue;
                                const tIdx = idx * 4;
                                const r = tData[tIdx];
                                const g = tData[tIdx + 1];
                                const b = tData[tIdx + 2];
                                if (g > 180 && r < 120 && b < 120) {
                                    // Start flood fill to find box
                                    let minX = x,
                                        minY = y,
                                        maxX = x,
                                        maxY = y;
                                    let stack = [[x, y]];
                                    while (stack.length) {
                                        const [sx, sy] = stack.pop()!;
                                        const sidx = sy * stripWidth + sx;
                                        if (visited[sidx]) continue;
                                        visited[sidx] = 1;
                                        const stIdx = sidx * 4;
                                        const sr = tData[stIdx];
                                        const sg = tData[stIdx + 1];
                                        const sb = tData[stIdx + 2];
                                        if (sg > 150 && sr < 120 && sb < 120) {
                                            minX = Math.min(minX, sx);
                                            minY = Math.min(minY, sy);
                                            maxX = Math.max(maxX, sx);
                                            maxY = Math.max(maxY, sy);
                                            // Add neighbors
                                            if (sx > 0)
                                                stack.push([sx - 1, sy]);
                                            if (sx < stripWidth - 1)
                                                stack.push([sx + 1, sy]);
                                            if (sy > 0)
                                                stack.push([sx, sy - 1]);
                                            if (sy < stripHeight - 1)
                                                stack.push([sx, sy + 1]);
                                        }
                                    }
                                    // Only add if box is big enough
                                    if (maxX - minX > 10 && maxY - minY > 10) {
                                        // Expand left/top/bottom by 16px, right by 10px
                                        boxes.push({
                                            x1: Math.max(0, minX - 20),
                                            y1: Math.max(0, minY - 16),
                                            x2: Math.min(
                                                stripWidth - 1,
                                                maxX + 10
                                            ),
                                            y2: Math.min(
                                                stripHeight - 1,
                                                maxY + 16
                                            ),
                                        });
                                    }
                                }
                            }
                        }
                        // Fill expanded boxes with gray
                        for (const box of boxes) {
                            for (let y = box.y1; y <= box.y2; y++) {
                                for (let x = box.x1; x <= box.x2; x++) {
                                    const tIdx = (y * stripWidth + x) * 4;
                                    const r = tData[tIdx];
                                    const g = tData[tIdx + 1];
                                    const b = tData[tIdx + 2];
                                    if (g > 180 && r < 120 && b < 120) {
                                        tData[tIdx] = 180;
                                        tData[tIdx + 1] = 180;
                                        tData[tIdx + 2] = 180;
                                        tData[tIdx + 3] = 255;
                                    }
                                }
                            }
                        }
                        ctx.putImageData(templateImageData, 0, 0);
                    }
                    resolve(null);
                };
                templateImg.src = templateImage;
            });
        } else {
            // Fallback: fill with gradient and border
            let backgroundColor = "#fef3c7";
            let borderColor = "#92400e";
            if (subTemplateId.includes("vintage")) {
                backgroundColor = "#f3e8d0";
                borderColor = "#8b4513";
            } else if (subTemplateId.includes("modern")) {
                backgroundColor = "#ffffff";
                borderColor = "#6b7280";
            } else if (subTemplateId.includes("retro")) {
                backgroundColor = "#fef3c7";
                borderColor = "#dc2626";
            }
            const gradient = ctx.createLinearGradient(0, 0, 0, stripHeight);
            gradient.addColorStop(0, backgroundColor);
            gradient.addColorStop(1, "#fed7aa");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, stripWidth, stripHeight);
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 8;
            ctx.strokeRect(4, 4, stripWidth - 8, stripHeight - 8);
        }

        // Only draw photos if there are any selected
        if (photos.length > 0 && photos[0] !== "" && templateImageData) {
            // Detect all green boxes once
            const tData = (templateImageData as ImageData).data;
            let boxes = [];
            let visited = new Uint8Array(stripWidth * stripHeight);
            for (let y = 0; y < stripHeight; y++) {
                for (let x = 0; x < stripWidth; x++) {
                    const idx = y * stripWidth + x;
                    if (visited[idx]) continue;
                    const tIdx = idx * 4;
                    const r = tData[tIdx];
                    const g = tData[tIdx + 1];
                    const b = tData[tIdx + 2];
                    if (g > 180 && r < 120 && b < 120) {
                        // Start flood fill to find box
                        let minX = x,
                            minY = y,
                            maxX = x,
                            maxY = y;
                        let stack = [[x, y]];
                        while (stack.length) {
                            const [sx, sy] = stack.pop()!;
                            const sidx = sy * stripWidth + sx;
                            if (visited[sidx]) continue;
                            visited[sidx] = 1;
                            const stIdx = sidx * 4;
                            const sr = tData[stIdx];
                            const sg = tData[stIdx + 1];
                            const sb = tData[stIdx + 2];
                            if (sg > 180 && sr < 120 && sb < 120) {
                                minX = Math.min(minX, sx);
                                minY = Math.min(minY, sy);
                                maxX = Math.max(maxX, sx);
                                maxY = Math.max(maxY, sy);
                                // Add neighbors
                                if (sx > 0) stack.push([sx - 1, sy]);
                                if (sx < stripWidth - 1)
                                    stack.push([sx + 1, sy]);
                                if (sy > 0) stack.push([sx, sy - 1]);
                                if (sy < stripHeight - 1)
                                    stack.push([sx, sy + 1]);
                            }
                        }
                        // Only add if box is big enough
                        if (maxX - minX > 10 && maxY - minY > 10) {
                            // Expand left/top/bottom by 16px, right by 10px
                            boxes.push({
                                x1: Math.max(0, minX - 40),
                                y1: Math.max(0, minY - 16),
                                x2: Math.min(stripWidth - 1, maxX + 10),
                                y2: Math.min(stripHeight - 1, maxY + 16),
                            });
                        }
                    }
                }
            }

            // For each box, load the corresponding photo and composite
            for (let b = 0; b < boxes.length; b++) {
                const box = boxes[b];
                if (b < photos.length && photos[b]) {
                    const img = new window.Image();
                    img.crossOrigin = "anonymous";
                    await new Promise((resolve) => {
                        img.onload = () => {
                            // Draw photo to offscreen canvas
                            const photoWidth = box.x2 - box.x1 + 1;
                            const photoHeight = box.y2 - box.y1 + 1;
                            const offCanvas = document.createElement("canvas");
                            offCanvas.width = photoWidth;
                            offCanvas.height = photoHeight;
                            const offCtx = offCanvas.getContext("2d");
                            if (!offCtx) return resolve(null);
                            offCtx.drawImage(
                                img,
                                0,
                                0,
                                photoWidth,
                                photoHeight
                            );
                            const photoData = offCtx.getImageData(
                                0,
                                0,
                                photoWidth,
                                photoHeight
                            );
                            const pData = photoData.data;
                            // Fill box with photo
                            for (let y = box.y1; y <= box.y2; y++) {
                                for (let x = box.x1; x <= box.x2; x++) {
                                    const tIdx = (y * stripWidth + x) * 4;
                                    const r = tData[tIdx];
                                    const g = tData[tIdx + 1];
                                    const b_ = tData[tIdx + 2];
                                    if (g > 180 && r < 120 && b_ < 120) {
                                        // Map to photo pixel
                                        const relY = y - box.y1;
                                        const relX = x - box.x1;
                                        const pIdx =
                                            (relY * photoWidth + relX) * 4;
                                        tData[tIdx] = pData[pIdx];
                                        tData[tIdx + 1] = pData[pIdx + 1];
                                        tData[tIdx + 2] = pData[pIdx + 2];
                                        tData[tIdx + 3] = pData[pIdx + 3];
                                    }
                                }
                            }
                            resolve(null);
                        };
                        img.src = photos[b];
                    });
                } else {
                    // Fill with gray placeholder
                    for (let y = box.y1; y <= box.y2; y++) {
                        for (let x = box.x1; x <= box.x2; x++) {
                            const tIdx = (y * stripWidth + x) * 4;
                            const r = tData[tIdx];
                            const g = tData[tIdx + 1];
                            const b_ = tData[tIdx + 2];
                            if (g > 180 && r < 120 && b_ < 120) {
                                tData[tIdx] = 180;
                                tData[tIdx + 1] = 180;
                                tData[tIdx + 2] = 180;
                                tData[tIdx + 3] = 255;
                            }
                        }
                    }
                }
            }
            ctx.putImageData(templateImageData, 0, 0);
        } else if (photos.length > 0 && photos[0] !== "") {
            // Fallback: no template image data, just draw photos
            const photoHeight = (stripHeight - 80) / photos.length;
            const photoWidth = stripWidth - 60;
            const photoStartX = 30;
            let photoStartY = 40;
            for (let i = 0; i < photos.length; i++) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                await new Promise((resolve) => {
                    img.onload = () => {
                        ctx.save();
                        ctx.filter =
                            "sepia(0.3) contrast(1.1) brightness(0.95)";
                        ctx.drawImage(
                            img,
                            photoStartX,
                            photoStartY,
                            photoWidth,
                            photoHeight - 20
                        );
                        ctx.filter = "none";
                        ctx.strokeStyle = "#78350f";
                        ctx.lineWidth = 2;
                        ctx.strokeRect(
                            photoStartX,
                            photoStartY,
                            photoWidth,
                            photoHeight - 20
                        );
                        ctx.restore();
                        photoStartY += photoHeight;
                        resolve(null);
                    };
                    img.src = photos[i];
                });
            }
        }

        const dataUrl = canvas.toDataURL("image/png");
        setCompositeImage(dataUrl);
        onCompositeReady(dataUrl);
        setIsGenerating(false);
    };

    useEffect(() => {
        generateComposite();
    }, [photos, templateId, subTemplateId]);

    const downloadImage = () => {
        if (!compositeImage) return;

        const link = document.createElement("a");
        link.download = `harap-lente-${Date.now()}.png`;
        link.href = compositeImage;
        link.click();
    };

    const shareImage = async () => {
        if (!compositeImage) return;

        try {
            const response = await fetch(compositeImage);
            const blob = await response.blob();
            const file = new File([blob], "harap-lente-photo.png", {
                type: "image/png",
            });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: "My Harap Lente Photo",
                    files: [file],
                });
            } else {
                // Fallback: copy to clipboard or download
                downloadImage();
            }
        } catch (error) {
            console.error("Error sharing:", error);
            downloadImage();
        }
    };

    return (
        <div className="pt-8">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-amber-900 mb-2">
                    Your Vintage Photo Strip
                </h2>
                <p className="text-amber-700">Ready to download and share!</p>
            </div>

            <div className="max-w-md mx-auto">
                <Card className="mb-6 overflow-hidden">
                    <CardContent className="p-4">
                        {isGenerating ? (
                            <div className="aspect-[1/3] bg-amber-100 flex items-center justify-center">
                                <div className="text-amber-600">
                                    <RotateCcw className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    <p>Creating your vintage masterpiece...</p>
                                </div>
                            </div>
                        ) : compositeImage ? (
                            <img
                                src={compositeImage || "/placeholder.svg"}
                                alt="Vintage photo strip"
                                className="w-full h-auto rounded-lg shadow-lg"
                            />
                        ) : (
                            <div className="aspect-[1/3] bg-gray-200 flex items-center justify-center">
                                <p className="text-gray-500">
                                    Generating photo strip...
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Download and Share buttons removed as requested */}
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
