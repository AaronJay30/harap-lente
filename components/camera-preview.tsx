"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CameraPreviewProps {
    onStartCapture: () => void;
}

export function CameraPreview({ onStartCapture }: CameraPreviewProps) {
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

    return (
        <div className="py-8">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-amber-900 mb-2">
                    Get Ready for Your Session!
                </h2>
                <p className="text-amber-700">
                    Position yourself in the camera and click start when ready
                </p>
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
                                className="absolute bottom-2 right-2 w-32 h-auto opacity-90 drop-shadow-lg pointer-events-none"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center space-y-4">
                    <Button
                        onClick={onStartCapture}
                        disabled={!cameraReady}
                        className="bg-amber-800 hover:bg-amber-700 text-white px-12 py-4 text-xl font-medium tracking-wide shadow-lg disabled:opacity-50"
                    >
                        <Play className="mr-3 h-6 w-6" />
                        Start Photo Session
                    </Button>

                    <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
                        <p className="text-amber-800 font-medium mb-2">
                            📸 What happens next:
                        </p>
                        <ul className="text-amber-700 text-sm space-y-1">
                            <li>• 10 photos will be taken automatically</li>
                            <li>• 10-second countdown between each photo</li>
                            <li>• Strike different poses for variety!</li>
                            <li>• Have fun and be creative!</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
