"use client";

import { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "@/lib/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function DownloadImage() {
    const [imageUrl, setImageUrl] = useState<string>("");
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const sessionId = localStorage.getItem("harapLenteSessionId");
        if (!sessionId) {
            setImageUrl("");
            return;
        }
        const compositeRef = ref(
            database,
            `sessions/${sessionId}/compositeImage`
        );
        onValue(compositeRef, (snapshot) => {
            const url = snapshot.val();
            if (url) setImageUrl(url);
            else setImageUrl("");
        });
        // Remove selectedPhotos from Firebase (cleanup)
        const selectedRef = ref(
            database,
            `sessions/${sessionId}/selectedPhotos`
        );
        remove(selectedRef);
    }, []);

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement("a");
        link.download = `harap-lente-${Date.now()}.png`;
        link.href = imageUrl;
        link.click();
    };

    return (
        <>
            <div className="flex flex-col items-center justify-center py-8 w-full max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-amber-900 mb-6 drop-shadow-lg text-center">
                    🎉 Your Photo Strip is Ready!
                </h2>
                <div className="flex flex-col items-center justify-center gap-6 w-full">
                    <div className="flex flex-col items-center justify-center">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="Photo strip preview"
                                className="w-[800px] h-auto rounded-xl shadow-xl border-4 border-amber-200 hover:border-orange-400 transition-all duration-200 hover:scale-105 bg-white cursor-pointer"
                                style={{
                                    maxWidth: "100%",
                                    height: "auto",
                                    objectFit: "contain",
                                }}
                                onClick={() => setShowModal(true)}
                            />
                        ) : (
                            <div
                                className="w-[800px] h-auto aspect-[2210/6250] bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center rounded-xl border-4 border-dashed border-amber-300 animate-pulse"
                                style={{ maxWidth: "100%" }}
                            >
                                <span className="text-amber-500 text-lg">
                                    No image found
                                </span>
                            </div>
                        )}
                    </div>
                    <Button
                        onClick={handleDownload}
                        disabled={!imageUrl}
                        className="mt-4 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500 text-white py-3 px-6 font-semibold tracking-wide shadow-lg transition-all duration-200 scale-100 hover:scale-105 text-base flex items-center justify-center w-full max-w-xs"
                    >
                        <Download className="mr-2 h-5 w-5 animate-bounce" />
                        <span className="hidden md:inline">Download PNG</span>
                        <span className="md:hidden">Download</span>
                    </Button>
                </div>
                <div className="mt-8 text-amber-700 text-center text-base font-medium">
                    Tip: Download and share your masterpiece with friends!
                </div>
            </div>
            {/* Modal for preview */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                    <div className="relative bg-white rounded-xl shadow-2xl p-4 flex flex-col items-center w-full max-w-lg mx-4">
                        <button
                            className="absolute top-2 right-2 text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-full px-3 py-1 font-bold text-lg"
                            onClick={() => setShowModal(false)}
                        >
                            &times;
                        </button>
                        <div className="flex items-center justify-center w-full">
                            <img
                                src={imageUrl}
                                alt="Photo strip preview large"
                                className="w-[800px] h-auto rounded-xl shadow-xl border-4 border-amber-200 bg-white"
                                style={{
                                    maxWidth: "100%",
                                    height: "auto",
                                    objectFit: "contain",
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
