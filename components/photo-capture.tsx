"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ref, set } from "firebase/database";
import { database } from "@/lib/firebaseConfig";
import { Camera, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PhotoCaptureProps {
    onPhotosComplete: (photos: string[]) => void;
    countdownTime?: number;
    photoCount?: number;
}

export function PhotoCapture({
    onPhotosComplete,
    countdownTime = 10,
    photoCount = 5,
}: PhotoCaptureProps) {
    // Remove expired photos from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem("harapLentePhotos");
            if (raw) {
                const payload = JSON.parse(raw);
                if (payload.expiresAt && Date.now() > payload.expiresAt) {
                    localStorage.removeItem("harapLentePhotos");
                }
            }
        } catch (e) {
            // Ignore JSON parse errors
        }
    }, []);
    // Modal state for preview
    const [modalOpen, setModalOpen] = useState(false);
    const [modalPhoto, setModalPhoto] = useState<string | null>(null);

    // Helper to overlay logo on captured image
    const overlayLogo = useCallback((photoDataUrl: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.src = photoDataUrl;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                if (!ctx) return resolve(photoDataUrl);
                ctx.drawImage(img, 0, 0);
                const logo = new window.Image();
                logo.src = "/images/harap-lente-logo.png";
                logo.onload = () => {
                    // Place logo at lower right, offset -right-5 (move 5px outside the right edge) and move it down by 5px
                    const logoWidth = 208; // 13rem * 16px
                    const logoHeight = logo.height * (logoWidth / logo.width);
                    ctx.globalAlpha = 0.9;
                    ctx.drawImage(
                        logo,
                        img.width - logoWidth + 30, // move 5px outside the right edge
                        img.height - logoHeight + 5,
                        logoWidth,
                        logoHeight
                    );
                    resolve(canvas.toDataURL("image/png"));
                };
                logo.onerror = () => resolve(photoDataUrl);
            };
            img.onerror = () => resolve(photoDataUrl);
        });
    }, []);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [currentPhoto, setCurrentPhoto] = useState(0);
    const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
    const [flashActive, setFlashActive] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    const totalPhotos = Math.max(1, Math.min(10, photoCount));

    const [videoReady, setVideoReady] = useState(false);

    useEffect(() => {
        let activeStream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, facingMode: "user" },
                });
                setStream(mediaStream);
                activeStream = mediaStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.onloadedmetadata = () => {
                        setVideoReady(true);
                    };
                }
            } catch (error) {
                console.error("Error accessing camera:", error);
            }
        };
        startCamera();
        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach((track) => track.stop());
            }
            setStream(null);
        };
    }, []);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return "";
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return "";
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/png");
    }, []);

    const [pendingCapture, setPendingCapture] = useState(false);

    const startPhotoSession = useCallback(() => {
        setIsCapturing(true);
        setCurrentPhoto(capturedPhotos.length + 1);
        setPendingCapture(true);
    }, [capturedPhotos.length]);

    useEffect(() => {
        if (pendingCapture && capturedPhotos.length < totalPhotos) {
            setCountdown(countdownTime);
            let countdownValue = countdownTime;
            const countdownInterval = setInterval(() => {
                countdownValue--;
                setCountdown(countdownValue);
                if (countdownValue <= 0) {
                    clearInterval(countdownInterval);
                    setFlashActive(true);
                    setTimeout(() => setFlashActive(false), 200);
                    setTimeout(async () => {
                        const photoDataUrl = capturePhoto();
                        if (photoDataUrl) {
                            const withLogo = await overlayLogo(photoDataUrl);
                            setCapturedPhotos((prev) => {
                                if (prev.length < totalPhotos) {
                                    setPendingCapture(false);
                                    return [...prev, withLogo];
                                }
                                return prev;
                            });
                        }
                    }, 100);
                }
            }, 1000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingCapture]);

    useEffect(() => {
        if (!pendingCapture && isCapturing) {
            if (capturedPhotos.length < totalPhotos) {
                setCurrentPhoto(capturedPhotos.length + 1);
                setPendingCapture(true);
            } else {
                setSessionComplete(true);
                setIsCapturing(false);
                setCurrentPhoto(0);
            }
        }
    }, [capturedPhotos.length, pendingCapture, isCapturing]);

    // Guard to prevent multiple photo sessions
    const sessionStartedRef = useRef(false);
    useEffect(() => {
        if (videoReady && !sessionStartedRef.current) {
            sessionStartedRef.current = true;
            const timer = setTimeout(() => {
                startPhotoSession();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [videoReady, startPhotoSession]);

    // Handler for deleting a photo
    const handleDeletePhoto = (index: number) => {
        setCapturedPhotos((prev) => {
            const newPhotos = prev.filter((_, i) => i !== index);
            if (newPhotos.length < totalPhotos && !isCapturing) {
                setSessionComplete(false);
                setTimeout(() => {
                    setIsCapturing(true);
                    startPhotoSession();
                }, 500);
            }
            return newPhotos;
        });
    };

    // Handler for confirming and proceeding
    const handleConfirm = async () => {
        setConfirmed(true);
        // Save captured photos to Firebase
        const sessionId = localStorage.getItem("harapLenteSessionId");
        if (sessionId) {
            const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
            try {
                await set(
                    ref(database, `sessions/${sessionId}/photos`),
                    capturedPhotos
                );
                await set(
                    ref(database, `sessions/${sessionId}/expiresAt`),
                    expiresAt
                );
                console.log("Photos saved to Firebase for session", sessionId);
            } catch (err) {
                console.error("Error saving photos to Firebase:", err);
            }
        }
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        onPhotosComplete(capturedPhotos);
    };

    const progress = (capturedPhotos.length / totalPhotos) * 100;

    return (
        <div className="py-8">
            <div className="text-center mb-6">
                {sessionComplete ? (
                    <div className="space-y-2">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                        <h2 className="text-3xl font-bold text-amber-900">
                            Session Complete!
                        </h2>
                        <p className="text-amber-700">
                            Review your photos below. You can delete and retake
                            any image before proceeding.
                        </p>
                        <div className="mt-4">
                            <button
                                className="bg-amber-800 hover:bg-amber-700 text-white px-8 py-3 text-lg font-medium rounded shadow disabled:opacity-50"
                                onClick={handleConfirm}
                                disabled={
                                    capturedPhotos.length !== totalPhotos ||
                                    confirmed
                                }
                            >
                                Proceed to Layout
                            </button>
                        </div>
                    </div>
                ) : currentPhoto > 0 ? (
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-amber-900">
                            Photo {currentPhoto} of {totalPhotos}
                        </h2>
                        <p className="text-amber-700">
                            {countdown ? `Get ready... ${countdown}` : "Smile!"}
                        </p>
                    </div>
                ) : null}
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-6">
                <Progress value={progress} className="h-3" />
                <p className="text-center text-sm text-amber-600 mt-2">
                    {capturedPhotos.length} of {totalPhotos} photos captured
                </p>
            </div>

            <div className="max-w-2xl mx-auto">
                <Card className="mb-6 overflow-hidden">
                    <CardContent className="p-0 relative">
                        {/* Flash overlay */}
                        {flashActive && (
                            <div className="absolute inset-0 bg-white z-20 opacity-80"></div>
                        )}

                        {/* Countdown overlay */}
                        {countdown && countdown > 0 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                                <div className="text-white text-8xl font-bold animate-pulse">
                                    {countdown}
                                </div>
                            </div>
                        )}

                        {/* Session complete overlay */}
                        {sessionComplete && (
                            <div className="absolute inset-0 bg-green-600 bg-opacity-80 flex items-center justify-center z-10">
                                <div className="text-white text-center">
                                    <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                                    <div className="text-2xl font-bold">
                                        Perfect!
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="aspect-[4/3] bg-gray-900 flex items-center justify-center relative">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />

                            {/* Vintage frame overlay */}
                            <div className="absolute inset-0 border-8 border-amber-200 opacity-30 pointer-events-none"></div>
                            <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-amber-300 opacity-20 pointer-events-none"></div>

                            {/* Harap Lente logo in lower right */}
                            <img
                                src="/images/harap-lente-logo.png"
                                alt="Harap Lente Logo"
                                className="absolute bottom-2 -right-2 md:-right-5 w-32 md:w-52 h-auto opacity-90 drop-shadow-lg pointer-events-none"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Photo thumbnails with delete/retake */}
                {capturedPhotos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                        {capturedPhotos.map((photo, index) => (
                            <div
                                key={index}
                                className="aspect-square bg-amber-100 rounded-lg overflow-hidden border-2 border-amber-300 relative group cursor-pointer"
                                onClick={() => {
                                    setModalPhoto(photo);
                                    setModalOpen(true);
                                }}
                            >
                                <img
                                    src={photo || "/placeholder.svg"}
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                {sessionComplete && (
                                    <button
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeletePhoto(index);
                                        }}
                                        title="Delete and Retake"
                                        disabled={confirmed}
                                    >
                                        &#10006;
                                    </button>
                                )}
                            </div>
                        ))}
                        {Array.from({
                            length: totalPhotos - capturedPhotos.length,
                        }).map((_, index) => (
                            <div
                                key={`empty-${index}`}
                                className="aspect-square bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                            >
                                <Camera className="h-4 w-4 text-gray-400" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Modal for photo preview and download */}
            {modalOpen && modalPhoto && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-lg w-full flex flex-col items-center">
                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-2xl"
                            onClick={() => setModalOpen(false)}
                            title="Close"
                        >
                            &times;
                        </button>
                        <img
                            src={modalPhoto}
                            alt="Preview"
                            className="w-full h-auto rounded mb-4"
                        />
                        <a
                            href={modalPhoto}
                            download={`harap-lente-photo.png`}
                            className="bg-amber-800 hover:bg-amber-700 text-white px-6 py-2 rounded shadow font-medium"
                        >
                            Download Photo
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
