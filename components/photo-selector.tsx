"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhotoComposer } from "@/components/photo-composer";

interface PhotoSelectorProps {
    photos: string[];
    templateId: string;
    subTemplateId: string;
    templateImage: string;
    onConfirm: (selectedPhotos: string[]) => void;
    onBack?: () => void;
}

export function PhotoSelector({
    photos,
    templateId,
    subTemplateId,
    templateImage,
    onConfirm,
}: PhotoSelectorProps) {
    // Determine how many photos are needed for the template
    const templatePhotoCount: Record<string, number> = {
        "1x1-classic": 1,
        "1x2-duo": 2,
        "1x3-triple": 3,
        "1x4-strip": 4,
    };
    const maxPhotos = templatePhotoCount[templateId] || photos.length;
    // Get onBack from props
    const { onBack } = arguments[0] || {};

    // Default: no photos selected so template is visible
    const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
    const [compositeImage, setCompositeImage] = useState<string>("");

    const handleSelect = (photo: string) => {
        if (selectedPhotos.includes(photo)) {
            setSelectedPhotos(selectedPhotos.filter((p) => p !== photo));
        } else if (selectedPhotos.length < maxPhotos) {
            setSelectedPhotos([...selectedPhotos, photo]);
        }
    };

    const isSelected = (photo: string) => selectedPhotos.includes(photo);

    const handleConfirm = () => {
        if (compositeImage) {
            try {
                localStorage.setItem(
                    "harapLenteCompositeImage",
                    compositeImage
                );
            } catch (e) {
                // Handle localStorage error (quota exceeded, etc.)
                console.error("Failed to save image to localStorage", e);
            }
            onConfirm(selectedPhotos);
        }
    };

    return (
        <div className="flex flex-col gap-8 py-8">
            {/* Back button at the top */}
            {onBack && (
                <div className="flex justify-start mb-4">
                    <Button
                        type="button"
                        onClick={onBack}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-6 py-2 text-base font-medium rounded shadow"
                    >
                        &larr; Back to Templates
                    </Button>
                </div>
            )}
            {/* Photo selection and live preview side by side */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* Photo selection grid */}
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-amber-900 mb-4">
                        Select Photos
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {photos.map((photo, idx) => (
                            <Card
                                key={idx}
                                className={`cursor-pointer border-2 transition-all duration-200 ${
                                    isSelected(photo)
                                        ? "border-amber-600 ring-2 ring-amber-500"
                                        : "border-gray-300 hover:border-amber-300"
                                }`}
                                onClick={() => handleSelect(photo)}
                            >
                                <CardContent className="p-2 flex items-center justify-center aspect-square">
                                    <img
                                        src={photo || "/placeholder.svg"}
                                        alt={`Photo ${idx + 1}`}
                                        className="w-full h-full object-cover rounded"
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                        {selectedPhotos.length} of {maxPhotos} selected
                    </div>
                    <Button
                        className="mt-6 bg-amber-800 hover:bg-amber-700 text-white px-6 py-2 text-lg font-medium shadow"
                        disabled={
                            selectedPhotos.length !== maxPhotos ||
                            !compositeImage
                        }
                        onClick={handleConfirm}
                    >
                        Confirm Selection
                    </Button>
                </div>
                {/* Live preview */}
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-amber-900 mb-4">
                        Live Preview
                    </h2>
                    <div className="border rounded-lg p-4 bg-white shadow">
                        <PhotoComposer
                            photos={
                                selectedPhotos.length > 0
                                    ? selectedPhotos
                                    : [""]
                            }
                            templateId={templateId}
                            subTemplateId={subTemplateId}
                            templateImage={templateImage}
                            onCompositeReady={setCompositeImage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
