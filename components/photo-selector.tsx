"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhotoComposer } from "@/components/photo-composer";

interface PhotoSelectorProps {
    photos: string[];
    templateId: string;
    subTemplateId: string;
    onConfirm: (selectedPhotos: string[]) => void;
}

export function PhotoSelector({
    photos,
    templateId,
    subTemplateId,
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

    // Default: select first N photos
    const [selectedPhotos, setSelectedPhotos] = useState<string[]>(
        photos.slice(0, maxPhotos)
    );

    const handleSelect = (photo: string) => {
        if (selectedPhotos.includes(photo)) {
            setSelectedPhotos(selectedPhotos.filter((p) => p !== photo));
        } else if (selectedPhotos.length < maxPhotos) {
            setSelectedPhotos([...selectedPhotos, photo]);
        }
    };

    const isSelected = (photo: string) => selectedPhotos.includes(photo);

    return (
        <div className="flex flex-col md:flex-row gap-8 py-8">
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
                    disabled={selectedPhotos.length !== maxPhotos}
                    onClick={() => onConfirm(selectedPhotos)}
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
                        photos={selectedPhotos}
                        templateId={templateId}
                        subTemplateId={subTemplateId}
                        onCompositeReady={() => {}}
                    />
                </div>
            </div>
        </div>
    );
}
