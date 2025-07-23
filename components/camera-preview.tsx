"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CameraPreviewProps {
    onStartCapture: (photoCount: number, timer: number) => void;
}

export function CameraPreview({ onStartCapture }: CameraPreviewProps) {
    const [photoCount, setPhotoCount] = useState(5);
    const [timer, setTimer] = useState(4);
    const [photoCountInput, setPhotoCountInput] = useState("5");
    const [timerInput, setTimerInput] = useState("4");
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraReady, setCameraReady] = useState(false);

    useEffect(() => {
        let activeStream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                // Use mobile-friendly constraints and fallback for facingMode
                let constraints = {
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: { exact: "user" },
                    },
                };
                let mediaStream: MediaStream;
                try {
                    mediaStream = await navigator.mediaDevices.getUserMedia(
                        constraints
                    );
                } catch (err) {
                    // Fallback for browsers that don't support exact facingMode
                    // Use a new constraints object for fallback
                    constraints = {
                        video: {
                            width: { ideal: 640 },
                            height: { ideal: 480 },
                        },
                    } as any;
                    mediaStream = await navigator.mediaDevices.getUserMedia(
                        constraints
                    );
                }
                setStream(mediaStream);
                activeStream = mediaStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.onloadedmetadata = () => {
                        setCameraReady(true);
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

    // Helper to clamp and update state on blur or submit
    const handlePhotoCountBlur = () => {
        let val = parseInt(photoCountInput, 10);
        if (isNaN(val)) val = 4;
        val = Math.max(4, Math.min(10, val));
        setPhotoCount(val);
        setPhotoCountInput(val.toString());
    };
    const handleTimerBlur = () => {
        let val = parseInt(timerInput, 10);
        if (isNaN(val)) val = 2;
        val = Math.max(2, Math.min(10, val));
        setTimer(val);
        setTimerInput(val.toString());
    };

    const handleStartCapture = () => {
        handlePhotoCountBlur();
        handleTimerBlur();
        onStartCapture(photoCount, timer);
    };

    return (
        <div className="py-8">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-amber-900 mb-2">
                    Get Ready for Your Session!
                </h2>
                <p className="text-amber-700">
                    Position yourself in the camera and click start when ready
                </p>
                <Button
                    onClick={handleStartCapture}
                    disabled={!cameraReady}
                    className="bg-amber-900 hover:bg-amber-800 text-white px-12 py-4 text-xl font-semibold tracking-wide shadow-lg disabled:opacity-50 border-2 border-amber-900 mt-4"
                >
                    <Play className="mr-3 h-6 w-6" />
                    Start Photo Session
                </Button>
            </div>

            <div className="max-w-2xl mx-auto">
                <Card className="mb-6 overflow-hidden">
                    <CardContent className="p-0 relative">
                        <div className="aspect-[4/3] bg-gray-900 flex items-center justify-center relative">
                            {!cameraReady && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                                    <div className="text-white text-center">
                                        <Camera className="h-12 w-12 mx-auto mb-4 animate-pulse" />
                                        <p>Starting camera...</p>
                                    </div>
                                </div>
                            )}

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

                            {/* Center guide */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-48 h-48 border-2 border-white border-dashed rounded-full opacity-30"></div>
                            </div>

                            {/* Harap Lente logo in lower right */}
                            <img
                                src="/images/harap-lente-logo.png"
                                alt="Harap Lente Logo"
                                className="absolute bottom-2 -right-2 md:-right-5 w-32 md:w-52 h-auto opacity-90 drop-shadow-lg pointer-events-none"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center space-y-6">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-4 md:gap-8 mb-6 w-full">
                        <div className="flex-1 p-4 md:p-6 rounded-xl border-2 border-amber-900 shadow-lg bg-white/80">
                            <label
                                htmlFor="photoCount"
                                className="block text-base font-semibold text-amber-900 mb-2"
                            >
                                Number of Photos
                            </label>
                            <input
                                id="photoCount"
                                type="number"
                                min={4}
                                max={10}
                                value={photoCountInput}
                                onChange={(e) =>
                                    setPhotoCountInput(
                                        e.target.value.replace(/[^0-9]/g, "")
                                    )
                                }
                                onBlur={handlePhotoCountBlur}
                                className="border border-amber-800 rounded-lg px-4 py-3 text-lg w-full text-center bg-white text-amber-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-700 transition"
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                        </div>
                        <div className="flex-1 p-4 md:p-6 rounded-xl border-2 border-amber-900 shadow-lg bg-white/80">
                            <label
                                htmlFor="timer"
                                className="block text-base font-semibold text-amber-900 mb-2"
                            >
                                Timer per Photo (seconds)
                            </label>
                            <input
                                id="timer"
                                type="number"
                                min={2}
                                max={10}
                                value={timerInput}
                                onChange={(e) =>
                                    setTimerInput(
                                        e.target.value.replace(/[^0-9]/g, "")
                                    )
                                }
                                onBlur={handleTimerBlur}
                                className="border border-amber-800 rounded-lg px-4 py-3 text-lg w-full text-center bg-white text-amber-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-700 transition"
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                        </div>
                    </div>
                    <style jsx>{`
                        .retro-box {
                            font-family: "Courier New", Courier, monospace;
                            box-shadow: 0 4px 24px 0 rgba(255, 193, 7, 0.15);
                        }
                        .retro-label {
                            letter-spacing: 2px;
                            text-shadow: 1px 1px 0 #fff8e1;
                        }
                        .retro-input {
                            border-radius: 8px;
                            background: repeating-linear-gradient(
                                135deg,
                                #fff8e1,
                                #ffe082 10px,
                                #fff8e1 20px
                            );
                            font-size: 2rem;
                        }
                        .retro-btn {
                            font-family: "Courier New", Courier, monospace;
                            letter-spacing: 2px;
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
}
