"use client";

import { useEffect, useRef, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "@/lib/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function DownloadImage() {
    const [imageUrl, setImageUrl] = useState<string>("");
    const [showModal, setShowModal] = useState(false);
    const [template, setTemplate] = useState<string>("");
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sessionId = localStorage.getItem("harapLenteSessionId");
        if (!sessionId) {
            setImageUrl("");
            return;
        }
        const OFFLINE_MODE = process.env.NEXT_PUBLIC_OFFLINE_MODE === "true";
        if (OFFLINE_MODE) {
            fetch(`/api/session?sessionId=${sessionId}`)
                .then((res) => res.json())
                .then((result) => {
                    const data = result.data || {};
                    setImageUrl(data.compositeImage || "");
                    setTemplate(data.template || "");
                });
        } else {
            const compositeRef = ref(
                database,
                `sessions/${sessionId}/compositeImage`
            );
            onValue(compositeRef, (snapshot) => {
                const url = snapshot.val();
                if (url) setImageUrl(url);
                else setImageUrl("");
            });
            // Get template type
            const templateRef = ref(database, `sessions/${sessionId}/template`);
            onValue(templateRef, (snapshot) => {
                const t = snapshot.val();
                if (t) setTemplate(t);
            });
            // Remove selectedPhotos from Firebase (cleanup)
            const selectedRef = ref(
                database,
                `sessions/${sessionId}/selectedPhotos`
            );
            remove(selectedRef);
        }
    }, []);

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement("a");
        link.download = `harap-lente-${Date.now()}.png`;
        link.href = imageUrl;
        link.click();
    };

    // Responsive style for modal image
    let modalImageStyle: React.CSSProperties = {
        maxWidth: "100%",
        width: "100%",
        objectFit: "contain",
    };
    if (template === "1x4-strip") {
        modalImageStyle = {
            ...modalImageStyle,
            maxHeight: "70vh",
            maxWidth: 350,
        };
    } else {
        modalImageStyle = {
            ...modalImageStyle,
            maxHeight: "60vh",
            maxWidth: 800,
        };
    }

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
                                className="rounded-xl shadow-xl border-4 border-amber-200 hover:border-orange-400 transition-all duration-200 hover:scale-105 bg-white cursor-pointer"
                                style={{
                                    maxWidth: "100%",
                                    height:
                                        template === "1x4-strip"
                                            ? "975px"
                                            : "auto",
                                    width:
                                        template === "1x4-strip"
                                            ? "350px"
                                            : "800px",
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
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
                    onMouseDown={(e) => {
                        if (
                            modalRef.current &&
                            !modalRef.current.contains(e.target as Node)
                        ) {
                            setShowModal(false);
                        }
                    }}
                >
                    <div
                        ref={modalRef}
                        className="relative bg-white rounded-xl shadow-2xl p-2 sm:p-4 flex flex-col items-center w-full max-w-xs sm:max-w-md md:max-w-lg mx-2 sm:mx-4"
                    >
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
                                className="rounded-xl shadow-xl border-4 border-amber-200 bg-white w-full h-auto object-contain"
                                style={modalImageStyle}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
