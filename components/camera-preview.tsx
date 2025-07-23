"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs"; // Must import TF backend

interface CameraPreviewProps {
    onStartCapture: (photoCount: number, timer: number) => void;
}

export function CameraPreview({ onStartCapture }: CameraPreviewProps) {
    // Instagram-style filters
    const filters = [
        { name: "Normal", value: "none" },
        { name: "Sepia", value: "sepia(0.7)" },
        { name: "Saturate", value: "saturate(1.8)" },
        { name: "Hue Rotate", value: "hue-rotate(90deg)" },
        { name: "Invert", value: "invert(1)" },
        { name: "Vintage", value: "contrast(1.1) sepia(0.4)" },
        { name: "Soft", value: "brightness(1.08) saturate(1.1)" },
        {
            name: "Cinematic",
            value: "contrast(1.3) brightness(0.9) saturate(1.2)",
        },
        { name: "B&W Film", value: "grayscale(1) contrast(1.2)" },
        { name: "Cool Tone", value: "hue-rotate(200deg) saturate(0.8)" },
        {
            name: "Warm Glow",
            value: "sepia(0.3) brightness(1.1) contrast(1.05)",
        },
        { name: "Dreamy", value: "brightness(1.1) saturate(1.5)" },
        { name: "Faded", value: "contrast(0.8) brightness(1.05) sepia(0.2)" },
        { name: "Moody", value: "brightness(0.8) contrast(1.4)" },
        { name: "Deep Blue", value: "hue-rotate(240deg) saturate(1.3)" },
        {
            name: "Golden Hour",
            value: "sepia(0.6) brightness(1.1) saturate(1.2)",
        },
        {
            name: "Retro VHS",
            value: "contrast(1.2) saturate(1.3) hue-rotate(-15deg)",
        },
        { name: "Toned Down", value: "grayscale(0.4) brightness(0.95)" },
        { name: "Glow Up", value: "saturate(1.5) brightness(1.2)" },
    ];

    const [filter, setFilter] = useState<string>(filters[0].value);
    const [photoCount, setPhotoCount] = useState(5);
    const [timer, setTimer] = useState(4);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraReady, setCameraReady] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

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
                {
                    /* Canvas overlay for detections */
                }
                <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />;
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
                <Button
                    onClick={() => onStartCapture(photoCount, timer)}
                    disabled={!cameraReady}
                    className="bg-amber-900 hover:bg-amber-800 text-white px-12 py-4 text-xl font-semibold tracking-wide shadow-lg disabled:opacity-50 border-2 border-amber-900 mt-4"
                >
                    <Play className="mr-3 h-6 w-6" />
                    Start Photo Session
                </Button>
            </div>

            <div className="max-w-4xl mx-auto">
                <Card className="mb-6 overflow-hidden">
                    <CardContent className="p-0 relative">
                        <div className="flex flex-col md:flex-row bg-gray-900 relative">
                            {/* Video Section */}
                            <div className="relative w-full md:w-3/4 aspect-[4/3] flex items-center justify-center">
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
                                    style={{ filter }}
                                />
                                <canvas
                                    ref={canvasRef}
                                    width={640}
                                    height={480}
                                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                />
                                <div className="absolute inset-0 border-8 border-amber-200 opacity-30 pointer-events-none"></div>
                                <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-amber-300 opacity-20 pointer-events-none"></div>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-48 h-48 border-2 border-white border-dashed rounded-full opacity-30"></div>
                                </div>
                                <img
                                    src="/images/harap-lente-logo.png"
                                    alt="Harap Lente Logo"
                                    className="absolute bottom-2 -right-5 w-52 h-auto opacity-90 drop-shadow-lg pointer-events-none"
                                />
                            </div>

                            {/* Filter Thumbnails */}
                            <div className="w-full md:w-1/4 bg-white/90 overflow-y-auto max-h-[500px] border-l border-amber-300 px-3 py-4 space-y-3">
                                {filters.map((f) => (
                                    <button
                                        key={f.name}
                                        onClick={() => setFilter(f.value)}
                                        className={`flex flex-col items-center w-full p-2 rounded border text-sm font-medium ${
                                            filter === f.value
                                                ? "bg-amber-700 text-white border-amber-700"
                                                : "bg-white text-amber-900 border-amber-300"
                                        }`}
                                    >
                                        <img
                                            src="/sample.jpg"
                                            alt={f.name}
                                            className="w-full h-24 object-cover rounded mb-1"
                                            style={{ filter: f.value }}
                                        />
                                        {f.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-6">
                        <div className="p-6 rounded-xl border-2 border-amber-900 shadow-lg bg-white/80">
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
                                value={photoCount}
                                onChange={(e) =>
                                    setPhotoCount(
                                        Math.max(
                                            4,
                                            Math.min(10, Number(e.target.value))
                                        )
                                    )
                                }
                                className="border border-amber-800 rounded-lg px-4 py-2 text-base w-32 text-center bg-white text-amber-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-700"
                            />
                        </div>
                        <div className="p-6 rounded-xl border-2 border-amber-900 shadow-lg bg-white/80">
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
                                value={timer}
                                onChange={(e) =>
                                    setTimer(
                                        Math.max(
                                            0,
                                            Math.min(30, Number(e.target.value))
                                        )
                                    )
                                }
                                className="border border-amber-800 rounded-lg px-4 py-2 text-base w-32 text-center bg-white text-amber-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-700"
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
