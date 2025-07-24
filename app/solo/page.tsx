"use client";

import { useState, useEffect } from "react";
import { ref, set, get, remove, onValue } from "firebase/database";
import { database } from "@/lib/firebaseConfig";
import {
    RotateCcw,
    Download,
    Home,
    Eye,
    Zap,
    Square,
    Palette,
    CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { CameraPreview } from "@/components/camera-preview";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
// Custom hook to detect mobile device and orientation
function useMobileLandscapeWarning() {
    const [show, setShow] = useState(false);
    useEffect(() => {
        function checkOrientation() {
            const isMobile = /Mobi|Android/i.test(navigator.userAgent);
            const isPortrait = window.matchMedia(
                "(orientation: portrait)"
            ).matches;
            setShow(isMobile && isPortrait);
        }
        checkOrientation();
        window.addEventListener("orientationchange", checkOrientation);
        window.addEventListener("resize", checkOrientation);
        return () => {
            window.removeEventListener("orientationchange", checkOrientation);
            window.removeEventListener("resize", checkOrientation);
        };
    }, []);
    return show;
}
import { PhotoCapture } from "@/components/photo-capture";
import { TemplateSelector } from "@/components/template-selector";
import {
    SubTemplateSelector,
    subTemplates as subTemplatesData,
} from "@/components/sub-template-selector";
import { PhotoComposer } from "@/components/photo-composer";
import { PhotoSelector } from "@/components/photo-selector";
import { DownloadImage } from "@/components/download-image";
const OFFLINE_MODE = process.env.NEXT_PUBLIC_OFFLINE_MODE === "true";

type SessionStep =
    | "preview"
    | "capture"
    | "template"
    | "subtemplate"
    | "select"
    | "download";

export default function SoloPage() {
    const [showLandscapeModal, setShowLandscapeModal] = useState(false);
    const landscapeWarning = useMobileLandscapeWarning();
    // Control landscape modal open state
    useEffect(() => {
        setShowLandscapeModal(landscapeWarning);
    }, [landscapeWarning]);
    // Generate or retrieve session ID
    const [sessionId, setSessionId] = useState<string>("");
    const [currentStep, setCurrentStep] = useState<SessionStep>("preview");
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [selectedSubTemplate, setSelectedSubTemplate] = useState<string>("");
    const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
    const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
    const [compositeImage, setCompositeImage] = useState<string>("");
    const MAX_TRIES = parseInt(
        process.env.NEXT_PUBLIC_PHOTO_TRY_LIMIT_COUNT || "3",
        10
    );
    const LIMIT_ENABLED = process.env.NEXT_PUBLIC_PHOTO_TRY_LIMIT === "true";

    useEffect(() => {
        let count = 0;
        if (LIMIT_ENABLED && typeof window !== "undefined") {
            const storedCount = localStorage.getItem("photoTryCount");
            count = storedCount ? parseInt(storedCount, 10) : 0;
        }
        if (LIMIT_ENABLED && count >= MAX_TRIES && currentStep !== "download") {
            localStorage.setItem("showTryLimitModal", "1");
            window.location.href = "/";
        } else {
            let id = localStorage.getItem("harapLenteSessionId");
            if (!id) {
                id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem("harapLenteSessionId", id);
            }
            setSessionId(id);
        }
    }, []);

    // Create initial session record in Firebase when sessionId is set
    useEffect(() => {
        if (!sessionId) return;
        if (OFFLINE_MODE) {
            // Try to load session from file (GET /api/session)
            fetch(`/api/session?sessionId=${sessionId}`)
                .then((res) => res.json())
                .then((result) => {
                    if (result.data) {
                        // Session exists
                        // ...existing code for setting state from result.data...
                    } else {
                        // Create new session file
                        fetch(`/api/session`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                sessionId,
                                data: {
                                    createdAt: Date.now(),
                                    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
                                },
                            }),
                        });
                    }
                });
        } else {
            const sessionRef = ref(database, `sessions/${sessionId}`);
            get(sessionRef).then((snapshot) => {
                if (!snapshot.exists()) {
                    set(sessionRef, {
                        createdAt: Date.now(),
                        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
                    })
                        .then(() => {
                            console.log(
                                "Session created in Firebase",
                                sessionId
                            );
                        })
                        .catch((err) => {
                            console.error(
                                "Error creating session in Firebase:",
                                err
                            );
                        });
                } else {
                    console.log(
                        "Session already exists in Firebase",
                        sessionId
                    );
                }
            });
        }
    }, [sessionId]);

    // On mount, check for valid localStorage photos, template, and style
    useEffect(() => {
        if (!sessionId) return;
        if (OFFLINE_MODE) {
            fetch(`/api/session?sessionId=${sessionId}`)
                .then((res) => res.json())
                .then((result) => {
                    const data = result.data;
                    if (!data) return;
                    if (data.compositeImage) {
                        setCompositeImage(data.compositeImage);
                        setCurrentStep("download");
                        return;
                    }
                    if (Array.isArray(data.photos) && data.photos.length > 0) {
                        setCapturedPhotos(data.photos);
                        if (!data.template) {
                            setCurrentStep("template");
                        } else if (!data.style) {
                            setSelectedTemplate(data.template);
                            setCurrentStep("subtemplate");
                        } else {
                            setSelectedTemplate(data.template);
                            setSelectedSubTemplate(data.style);
                            setCurrentStep("select");
                        }
                    }
                });
        } else {
            // ...existing code...
            const sessionRef = ref(database, `sessions/${sessionId}`);
            onValue(sessionRef, (snapshot) => {
                const data = snapshot.val();
                if (!data) return;
                if (data.compositeImage) {
                    setCompositeImage(data.compositeImage);
                    setCurrentStep("download");
                    return;
                }
                if (Array.isArray(data.photos) && data.photos.length > 0) {
                    setCapturedPhotos(data.photos);
                    if (!data.template) {
                        setCurrentStep("template");
                    } else if (!data.style) {
                        setSelectedTemplate(data.template);
                        setCurrentStep("subtemplate");
                    } else {
                        setSelectedTemplate(data.template);
                        setSelectedSubTemplate(data.style);
                        setCurrentStep("select");
                    }
                }
            });
        }
    }, [sessionId]);

    const [photoCount, setPhotoCount] = useState(5);
    const [timer, setTimer] = useState(4);
    const handleStartCapture = (count: number, timerValue: number) => {
        setPhotoCount(count);
        setTimer(timerValue);
        setCurrentStep("capture");
    };

    const handlePhotosComplete = async (photos: string[]) => {
        setCapturedPhotos(photos);
        // Save to Firebase or file
        if (sessionId) {
            if (OFFLINE_MODE) {
                await fetch(`/api/session`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId,
                        data: {
                            photos,
                            createdAt: Date.now(),
                            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
                        },
                    }),
                });
            } else {
                await set(ref(database, `sessions/${sessionId}`), {
                    photos,
                    createdAt: Date.now(),
                    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
                });
            }
        }
        setCurrentStep("template");
    };

    const handleTemplateSelect = async (templateId: string) => {
        setSelectedTemplate(templateId);
        if (sessionId) {
            if (OFFLINE_MODE) {
                await fetch(`/api/session`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId,
                        data: {
                            template: templateId,
                        },
                    }),
                });
            } else {
                await set(
                    ref(database, `sessions/${sessionId}/template`),
                    templateId
                );
            }
        }
        setCurrentStep("subtemplate");
    };

    const handleSubTemplateSelect = async (subTemplateId: string) => {
        setSelectedSubTemplate(subTemplateId);
        if (sessionId) {
            if (OFFLINE_MODE) {
                await fetch(`/api/session`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId,
                        data: {
                            style: subTemplateId,
                        },
                    }),
                });
            } else {
                await set(
                    ref(database, `sessions/${sessionId}/style`),
                    subTemplateId
                );
            }
        }
        setCurrentStep("select");
    };

    const handlePhotoSelectionConfirm = async (photos: string[]) => {
        setSelectedPhotos(photos);
        if (sessionId) {
            if (OFFLINE_MODE) {
                await fetch(`/api/session`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId,
                        data: {
                            selectedPhotos: photos,
                        },
                    }),
                });
            } else {
                await set(
                    ref(database, `sessions/${sessionId}/selectedPhotos`),
                    photos
                );
            }
        }
        setCurrentStep("download");
    };

    const handleReset = async () => {
        setCapturedPhotos([]);
        setCompositeImage("");
        setCurrentStep("preview");
        setSelectedTemplate("");
        setSelectedSubTemplate("");

        let count = 0;

        if (LIMIT_ENABLED && typeof window !== "undefined") {
            const storedCount = localStorage.getItem("photoTryCount");
            count = storedCount ? parseInt(storedCount, 10) : 0;
        }
        if (LIMIT_ENABLED && count >= MAX_TRIES && currentStep !== "download") {
            localStorage.setItem("showTryLimitModal", "1");
            window.location.href = "/";
        }

        if (sessionId) {
            if (OFFLINE_MODE) {
                await fetch("/api/session", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId }),
                });
            } else {
                await remove(ref(database, `sessions/${sessionId}/photos`));
                await remove(ref(database, `sessions/${sessionId}/template`));
                await remove(ref(database, `sessions/${sessionId}/style`));
                await remove(
                    ref(database, `sessions/${sessionId}/selectedPhotos`)
                );
                await remove(
                    ref(database, `sessions/${sessionId}/compositeImage`)
                );
            }
        }
    };
    // Cleanup: Remove sessions older than 1 day
    useEffect(() => {
        const cleanupOldSessions = async () => {
            const sessionsRef = ref(database, "sessions");
            onValue(sessionsRef, (snapshot) => {
                const sessions = snapshot.val();
                if (!sessions) return;
                Object.entries(sessions).forEach(([id, data]: any) => {
                    if (
                        data.createdAt &&
                        Date.now() - data.createdAt > 24 * 60 * 60 * 1000
                    ) {
                        remove(ref(database, `sessions/${id}`));
                    }
                });
            });
        };
        cleanupOldSessions();
    }, []);

    const getStepTitle = () => {
        switch (currentStep) {
            case "preview":
                return "Camera Preview";
            case "capture":
                return "Taking Photos";
            case "template":
                return "Choose Layout";
            case "subtemplate":
                return "Choose Style";
            case "select":
                return "Select Photos";
            case "download":
                return "Your Photo Strip";
            default:
                return "Solo Session";
        }
    };

    function handleBack(): void {
        if (currentStep === "subtemplate") {
            setCurrentStep("template");
            setSelectedSubTemplate("");
        } else if (currentStep === "select") {
            setCurrentStep("subtemplate");
            setSelectedPhotos([]);
        } else if (currentStep === "download") {
            setCurrentStep("select");
            setCompositeImage("");
        }
    }
    const NOISE_BG =
        "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")";

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 relative overflow-hidden">
            {/* Landscape orientation modal for mobile */}
            <Dialog
                open={showLandscapeModal}
                onOpenChange={setShowLandscapeModal}
            >
                <DialogContent className="max-w-xs rounded-2xl p-0 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border-0 shadow-2xl">
                    <div className="flex flex-col items-center justify-center p-6">
                        <div className="bg-amber-100 rounded-full p-3 mb-3 shadow-md">
                            <svg
                                width="36"
                                height="36"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="text-amber-500"
                            >
                                <rect
                                    x="3"
                                    y="7"
                                    width="18"
                                    height="10"
                                    rx="2"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <rect
                                    x="7"
                                    y="3"
                                    width="10"
                                    height="18"
                                    rx="2"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    opacity="0.3"
                                />
                            </svg>
                        </div>
                        <DialogHeader className="w-full text-center">
                            <DialogTitle className="text-lg font-extrabold text-amber-900 mb-1 tracking-wide">
                                Best Viewed in Landscape
                            </DialogTitle>
                        </DialogHeader>
                        <DialogDescription className="text-base text-amber-800 mt-2">
                            For the best experience, please rotate your device
                            to landscape mode.
                        </DialogDescription>
                        <div className="mt-4 text-center">
                            <span className="inline-block text-amber-700 bg-amber-100 rounded-lg px-4 py-2 text-sm font-medium shadow-sm">
                                Tip: For best results and to prevent stretching
                                of your photo, please use your device in{" "}
                                <b>landscape orientation</b> when taking
                                pictures.
                            </span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Vintage grain overlay */}
            <div
                className="absolute inset-0 opacity-20 animate-pulse pointer-events-none"
                style={{
                    backgroundImage: NOISE_BG,
                    backgroundRepeat: "repeat",
                }}
            />

            {/* Decorative elements */}
            <div className="absolute top-8 md:top-10 left-6 md:left-10 w-12 md:w-20 h-12 md:h-20 border-4 border-amber-300 rounded-full opacity-30 animate-bounce pointer-events-none"></div>
            <div className="absolute bottom-8 md:bottom-10 right-6 md:right-10 w-10 md:w-16 h-10 md:h-16 border-4 border-orange-300 rounded-full opacity-30 animate-pulse pointer-events-none"></div>
            <div
                className="absolute top-1/4 md:top-1/3 right-12 md:right-20 w-8 md:w-12 h-8 md:h-12 border-4 border-amber-400 rotate-45 opacity-20 animate-spin pointer-events-none"
                style={{ animationDuration: "8s" }}
            ></div>
            <div className="absolute bottom-1/4 md:bottom-1/3 left-12 md:left-20 w-6 md:w-8 h-6 md:h-8 border-4 border-orange-400 rotate-45 opacity-20 animate-ping pointer-events-none"></div>
            <div
                className="absolute top-1/2 left-4 md:left-8 w-4 md:w-6 h-4 md:h-6 bg-amber-300 rounded-full opacity-20 animate-bounce pointer-events-none"
                style={{ animationDelay: "1s", animationDuration: "3s" }}
            ></div>
            <div
                className="absolute top-3/4 right-4 md:right-8 w-3 md:w-4 h-3 md:h-4 bg-orange-300 rounded-full opacity-20 animate-pulse pointer-events-none"
                style={{ animationDelay: "2s" }}
            ></div>

            {/* Vintage Footer */}
            <div className="absolute bottom-2 md:bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
                <p className="text-xs text-amber-600 tracking-[0.2em] md:tracking-[0.3em] uppercase font-bold text-center px-4 pt-5">
                    {"Say Cheese!"} Since Forever
                </p>
            </div>

            {/* Header with Logo */}
            <div className="bg-amber-900 text-white px-4 shadow-lg relative z-10">
                <div className=" mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Image
                            src="/images/HarapLenteHorizontal.png"
                            alt="Harap Lente"
                            width={400}
                            height={100}
                            className="h-24 w-auto"
                        />
                        <div className="hidden md:block">
                            <h1 className="text-xl font-bold tracking-wide">
                                {getStepTitle()}
                            </h1>
                            <p className="text-amber-200 text-sm">
                                Solo Photobooth Session
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="bg-transparent border-white text-white hover:bg-white hover:text-amber-900"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            <span className="hidden md:inline">Reset</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent border-white text-white hover:bg-white hover:text-amber-900"
                            onClick={async () => {
                                if (sessionId) {
                                    await remove(
                                        ref(database, `sessions/${sessionId}`)
                                    );
                                }
                                localStorage.removeItem("harapLenteSessionId");
                                window.location.href = "/";
                            }}
                        >
                            <Home className="h-4 w-4 mr-2" />
                            <span className="hidden md:inline">Home</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="bg-white border-b border-amber-200 p-4 relative z-10">
                <div className="max-w-6xl mx-auto flex flex-col gap-2 items-center justify-center">
                    {/* Desktop: 1 line */}
                    <div className="hidden md:flex items-center justify-center space-x-4 md:space-x-8 overflow-x-auto">
                        <div
                            className={`flex items-center whitespace-nowrap ${
                                currentStep === "preview"
                                    ? "text-amber-600"
                                    : "text-gray-400"
                            }`}
                        >
                            <Eye className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            <span className="font-medium text-sm md:text-base">
                                Preview
                            </span>
                        </div>
                        <div className="w-4 md:w-8 h-px bg-gray-300"></div>
                        <div
                            className={`flex items-center whitespace-nowrap ${
                                currentStep === "capture"
                                    ? "text-amber-600"
                                    : "text-gray-400"
                            }`}
                        >
                            <Zap className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            <span className="font-medium text-sm md:text-base">
                                Capture
                            </span>
                        </div>
                        <div className="w-4 md:w-8 h-px bg-gray-300"></div>
                        <div
                            className={`flex items-center whitespace-nowrap ${
                                currentStep === "template"
                                    ? "text-amber-600"
                                    : "text-gray-400"
                            }`}
                        >
                            <Square className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            <span className="font-medium text-sm md:text-base">
                                Layout
                            </span>
                        </div>
                        <div className="w-4 md:w-8 h-px bg-gray-300"></div>
                        <div
                            className={`flex items-center whitespace-nowrap ${
                                currentStep === "subtemplate"
                                    ? "text-amber-600"
                                    : "text-gray-400"
                            }`}
                        >
                            <Palette className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            <span className="font-medium text-sm md:text-base">
                                Style
                            </span>
                        </div>
                        <div className="w-4 md:w-8 h-px bg-gray-300"></div>

                        <div
                            className={`flex items-center whitespace-nowrap ${
                                currentStep === "select"
                                    ? "text-amber-600"
                                    : "text-gray-400"
                            }`}
                        >
                            <CheckSquare className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            <span className="font-medium text-sm md:text-base">
                                Select
                            </span>
                        </div>
                        <div className="w-4 md:w-8 h-px bg-gray-300"></div>
                        <div
                            className={`flex items-center whitespace-nowrap ${
                                currentStep === "download"
                                    ? "text-amber-600"
                                    : "text-gray-400"
                            }`}
                        >
                            <Download className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            <span className="font-medium text-sm md:text-base">
                                Download
                            </span>
                        </div>
                    </div>
                    {/* Mobile: 2 lines */}
                    <div className="flex md:hidden flex-col gap-2 w-full items-center">
                        <div className="flex items-center justify-center space-x-4 overflow-x-auto">
                            <div
                                className={`flex items-center whitespace-nowrap ${
                                    currentStep === "preview"
                                        ? "text-amber-600"
                                        : "text-gray-400"
                                }`}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                <span className="font-medium text-sm">
                                    Preview
                                </span>
                            </div>
                            <div className="w-4 h-px bg-gray-300"></div>
                            <div
                                className={`flex items-center whitespace-nowrap ${
                                    currentStep === "capture"
                                        ? "text-amber-600"
                                        : "text-gray-400"
                                }`}
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                <span className="font-medium text-sm">
                                    Capture
                                </span>
                            </div>
                            <div className="w-4 h-px bg-gray-300"></div>
                            <div
                                className={`flex items-center whitespace-nowrap ${
                                    currentStep === "template"
                                        ? "text-amber-600"
                                        : "text-gray-400"
                                }`}
                            >
                                <Square className="h-4 w-4 mr-2" />
                                <span className="font-medium text-sm">
                                    Layout
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center space-x-4 overflow-x-auto">
                            <div
                                className={`flex items-center whitespace-nowrap ${
                                    currentStep === "select"
                                        ? "text-amber-600"
                                        : "text-gray-400"
                                }`}
                            >
                                <CheckSquare className="h-4 w-4 mr-2" />
                                <span className="font-medium text-sm">
                                    Select
                                </span>
                            </div>
                            <div className="w-4 h-px bg-gray-300"></div>
                            <div
                                className={`flex items-center whitespace-nowrap ${
                                    currentStep === "subtemplate"
                                        ? "text-amber-600"
                                        : "text-gray-400"
                                }`}
                            >
                                <Palette className="h-4 w-4 mr-2" />
                                <span className="font-medium text-sm">
                                    Style
                                </span>
                            </div>
                            <div className="w-4 h-px bg-gray-300"></div>
                            <div
                                className={`flex items-center whitespace-nowrap ${
                                    currentStep === "download"
                                        ? "text-amber-600"
                                        : "text-gray-400"
                                }`}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="font-medium text-sm">
                                    Download
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto p-4 relative z-10 pb-5">
                {currentStep === "preview" && (
                    <CameraPreview onStartCapture={handleStartCapture} />
                )}

                {currentStep === "capture" && (
                    <PhotoCapture
                        onPhotosComplete={handlePhotosComplete}
                        countdownTime={timer}
                        photoCount={photoCount}
                    />
                )}

                {currentStep === "template" && (
                    <TemplateSelector onTemplateSelect={handleTemplateSelect} />
                )}

                {currentStep === "subtemplate" && (
                    <SubTemplateSelector
                        templateId={selectedTemplate}
                        onSubTemplateSelect={handleSubTemplateSelect}
                        onBack={handleBack}
                    />
                )}

                {currentStep === "select" && (
                    <PhotoSelector
                        photos={capturedPhotos}
                        templateId={selectedTemplate}
                        subTemplateId={selectedSubTemplate}
                        onBack={handleBack}
                        templateImage={(() => {
                            // Find the template image from subTemplates
                            const subTemplates =
                                (
                                    subTemplatesData as Record<
                                        string,
                                        Array<{
                                            id: string;
                                            name: string;
                                            description: string;
                                            template: string;
                                            preview: string;
                                        }>
                                    >
                                )[selectedTemplate] || [];
                            const found = subTemplates.find(
                                (t) => t.id === selectedSubTemplate
                            );
                            return found?.template || "";
                        })()}
                        onConfirm={handlePhotoSelectionConfirm}
                    />
                )}

                {currentStep === "download" && (
                    <>
                        <DownloadImage />
                    </>
                )}
            </div>
            {/* Custom CSS for floating animation */}
            <style jsx>{`
                @keyframes float {
                    0%,
                    100% {
                        transform: translateY(0px) rotate(-1deg);
                    }
                    50% {
                        transform: translateY(-10px) rotate(1deg);
                    }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
