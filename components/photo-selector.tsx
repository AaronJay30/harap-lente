"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhotoComposer } from "@/components/photo-composer";
import { database } from "@/lib/firebaseConfig";
import { ref, set } from "firebase/database";

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

    const handleConfirm = async () => {
        if (compositeImage) {
            const sessionId = localStorage.getItem("harapLenteSessionId");
            if (sessionId) {
                try {
                    await set(
                        ref(database, `sessions/${sessionId}/compositeImage`),
                        compositeImage
                    );
                } catch (e) {
                    console.error("Failed to save image to Firebase", e);
                }
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
                    <div
                        className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6 rounded-xl"
                        style={{
                            background:
                                '#fef3c7 url(\'data:image/svg+xml;utf8,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2"/></filter><rect width="100%" height="100%" filter="url(%23noise)" opacity="0.12"/></svg>\')',
                            border: "4px dashed #f59e0b ",
                            boxShadow: "0 4px 24px 0 rgba(220,38,38,0.08)",
                            position: "relative",
                        }}
                    >
                        {photos.map((photo, idx) => (
                            <Card
                                key={idx}
                                className={`cursor-pointer border-2 transition-all duration-200 ${
                                    isSelected(photo)
                                        ? "border-amber-600 ring-2 ring-amber-500"
                                        : "border-gray-300 hover:border-amber-300"
                                }`}
                                style={{
                                    borderStyle: "dashed",
                                    borderColor: isSelected(photo)
                                        ? "#f59e0b"
                                        : "#fde68a",
                                }}
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
